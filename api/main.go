package main

import (
	"encoding/json"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/julienschmidt/httprouter"
)

type server struct {
	vm *vm
}

func (s *server) index(
	w http.ResponseWriter, r *http.Request, ps httprouter.Params,
) {
	http.Redirect(w, r, "/app/", http.StatusTemporaryRedirect)
}

func (s *server) move(
	w http.ResponseWriter, r *http.Request, ps httprouter.Params,
) {
	ctx := r.Context()
	id := ps.ByName("id")
	log.Printf("[INFO] running: %s", id)

	jsonData, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("[ERRO] failed to read body: %v", err)
		w.WriteHeader(500)
		return
	}

	out, err := s.vm.execute(ctx, id, "move", jsonData)
	if err != nil {
		log.Printf("[ERRO] failed to execute move: %v", err)
		w.WriteHeader(500)
		return
	}

	log.Printf("[INFO] got response %s: %s", id, out)

	resp, err := json.Marshal(struct {
		Move string `json:"move"`
	}{out})
	if err != nil {
		log.Printf("[ERRO] failed to marshal json: %v", err)
		w.WriteHeader(500)
		return
	}

	_, err = w.Write(resp)
	if err != nil {
		log.Printf("[ERRO] failed to write: %v", err)
		w.WriteHeader(500)
		return
	}
}

func (s *server) save(
	w http.ResponseWriter, r *http.Request, ps httprouter.Params,
) {
	r.Body = http.MaxBytesReader(w, r.Body, 512)

	id := ps.ByName("id")
	log.Printf("[INFO] saving: %s", id)

	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("[ERRO] failed to read body: %v", err)
		w.WriteHeader(500)
		return
	}

	err = s.vm.save(id, string(data))
	if err != nil {
		log.Printf("[ERRO] failed to write body: %v", err)
		w.WriteHeader(500)
		return
	}
}

func (s *server) logs(
	w http.ResponseWriter, r *http.Request, ps httprouter.Params,
) {
	id := ps.ByName("id")
	log.Printf("[INFO] reading logs: %s", id)

	logs, err := s.vm.logs(id)
	if err != nil {
		log.Printf("[ERRO] failed to read logs: %v", err)
		w.WriteHeader(500)
		return
	}

	_, err = io.Copy(w, logs)
	if err != nil {
		log.Printf("[ERRO] failed to write logs: %v", err)
		w.WriteHeader(500)
		return
	}
}

func main() {
	v := &vm{conn: os.Getenv("REDIS_URL")}
	if err := v.open(); err != nil {
		log.Fatalf("vm open failed: %v", err)
	}

	s := &server{vm: v}

	router := httprouter.New()

	router.POST("/api/:id/save", s.save)
	router.POST("/api/:id/move", s.move)
	router.GET("/api/:id/logs", s.logs)
	router.GET("/", s.index)

	router.ServeFiles("/app/*filepath", http.Dir("public/"))

	log.Printf("starting on 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
