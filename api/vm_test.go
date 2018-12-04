package main

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"
)

var v = &vm{conn: "localhost:6379"}

func init() {
	if err := v.open(); err != nil {
		panic(err)
	}
}

func TestTimeout(t *testing.T) {
	err := v.save("timeout-1", "function looper() { while (true) { console.log('ok') } }")
	require.NoError(t, err)

	_, err = v.execute(context.Background(), "timeout-1", "looper", []byte("{}"))
	require.Error(t, err)
}

func TestExec(t *testing.T) {
	err := v.save("timeout-1", "function hello() { return 'hi' }")
	require.NoError(t, err)

	val, err := v.execute(context.Background(), "timeout-1", "hello", []byte("{}"))
	require.NoError(t, err)
	require.Equal(t, "hi", val)
}
