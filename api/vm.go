package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"strings"
	"time"

	"github.com/go-redis/redis"
	"github.com/robertkrimen/otto"
)

var (
	errHalt     = errors.New("execute: timeout error")
	errNoScript = errors.New("execute: no script")
	errMaxSize  = errors.New("js: max size reached")
)

const (
	maxSize     = 512
	maxLogLines = 20
	logExpiry   = 5 * time.Minute
)

type vm struct {
	conn  string
	redis *redis.Client
}

func (v *vm) open() error {
	client := redis.NewClient(&redis.Options{
		Addr:     v.conn,
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	_, err := client.Ping().Result()
	v.redis = client
	return err
}

func (v *vm) logMsg(id, msg string) {
	if err := v.redis.LPush("logs:"+id, msg).Err(); err != nil {
		log.Printf("[ERROR] redis: failed to write: %v", err)
	}
}

func (v *vm) log(id string, argumentList []otto.Value) {
	output := []string{}
	for _, argument := range argumentList {
		output = append(output, fmt.Sprintf("%v", argument))
	}
	val := strings.Join(output, " ")

	if err := v.redis.LPush("logs:"+id, val).Err(); err != nil {
		log.Printf("[ERROR] redis: failed to write: %v", err)
	}
	if err := v.redis.LTrim("logs:"+id, 0, maxLogLines).Err(); err != nil {
		log.Printf("[ERROR] redis: failed to write: %v", err)
	}
	if err := v.redis.Expire("logs:"+id, logExpiry).Err(); err != nil {
		log.Printf("[ERROR] redis: failed to write: %v", err)
	}
}

func (v *vm) console(id string) map[string]interface{} {
	return map[string]interface{}{
		"log": func(call otto.FunctionCall) otto.Value {
			v.log(id, call.ArgumentList)
			return otto.UndefinedValue()
		},
		"error": func(call otto.FunctionCall) otto.Value {
			v.log(id, call.ArgumentList)
			return otto.UndefinedValue()
		},
	}
}

func (v *vm) execute(
	ctx context.Context, id, fn string, jsonData []byte,
) (_ string, err error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Millisecond)
	defer cancel()

	js, err := v.redis.Get("js:" + id).Result()
	if err != nil {
		return "", errNoScript
	}

	vm := otto.New()
	vm.Interrupt = make(chan func(), 1)
	vm.Set("console", v.console(id))

	defer func() {
		if caught := recover(); caught != nil {
			if caught == errHalt {
				err = errHalt
				v.logMsg(id, "ERROR: execution timeout")
				return
			}
			err = fmt.Errorf("execute: panic: %v", err)
		}
	}()

	go func() {
		select {
		case <-ctx.Done():
			vm.Interrupt <- func() { panic(errHalt) }
		}
	}()

	m := map[string]interface{}{}
	if err := json.Unmarshal(jsonData, &m); err != nil {
		return "", fmt.Errorf("execute: unmarshal failed: %v", err)
	}

	script := js + ";\n" + fn + "(req);"
	vm.Set("req", m)

	value, err := vm.Run(script)
	if err != nil {
		v.logMsg(id, err.Error())
		return "", fmt.Errorf("execute: run failed: %v", err)
	}
	out, err := value.ToString()
	if err != nil {
		return "", fmt.Errorf("execute: value failed: %v", err)
	}

	return out, nil
}

func (v *vm) logs(id string) (io.Reader, error) {
	lines, err := v.redis.LRange("logs:"+id, 0, 100).Result()
	if err != nil {
		return nil, err
	}

	buf := bytes.NewBuffer(nil)
	for _, l := range lines {
		buf.WriteString(l + "\n")
	}
	return buf, nil
}

func (v *vm) save(id, js string) error {
	if len(js) > 512 {
		return errMaxSize
	}
	return v.redis.Set("js:"+id, js, 0).Err()
}
