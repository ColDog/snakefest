package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"strings"
	"time"

	"github.com/go-redis/redis"
	"github.com/robertkrimen/otto"
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

func (v *vm) log(id string, argumentList []otto.Value) {
	output := []string{}
	for _, argument := range argumentList {
		output = append(output, fmt.Sprintf("%v", argument))
	}
	val := strings.Join(output, " ")

	if err := v.redis.LPush("logs:"+id, val).Err(); err != nil {
		log.Printf("[ERROR] redis: failed to write: %v", err)
	}
	if err := v.redis.LTrim("logs:"+id, 0, 100).Err(); err != nil {
		log.Printf("[ERROR] redis: failed to write: %v", err)
	}
	if err := v.redis.Expire("logs:"+id, 5*time.Minute).Err(); err != nil {
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
) (string, error) {
	js, err := v.redis.Get("js:" + id).Result()
	if err != nil {
		return "", err
	}

	vm := otto.New()
	vm.Set("console", v.console(id))

	m := map[string]interface{}{}
	if err := json.Unmarshal(jsonData, &m); err != nil {
		return "", err
	}

	script := js + ";\n" + fn + "(req);"
	vm.Set("req", m)

	value, err := vm.Run(script)
	if err != nil {
		return "", err
	}
	out, err := value.ToString()
	if err != nil {
		return "", err
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
	return v.redis.Set("js:"+id, js, 0).Err()
}
