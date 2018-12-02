COMMIT := $(shell git rev-parse --short HEAD)

redis:
	docker run -d --name=redis --rm -it -p 6379:6379 redis
.PHONY: redis

run:
	docker run -e REDIS_URL=localhost:6379 --net=host --rm -it -p 8080:8080 coldog/snakefest:$(COMMIT)
.PHONY: run

build:
	(cd api && CGO_ENABLED=0 go build -a -ldflags '-extldflags "-static"' -o build/api .)
	(cd app && yarn install && yarn build)
	docker build -t coldog/snakefest:$(COMMIT) .
.PHONY: build

push:
	docker push coldog/snakefest:$(COMMIT)
.PHONY: build

deploy:
	cat manifest.yaml | sed "s/COMMIT/$(COMMIT)/" | kubectl apply -f -
.PHONY: deploy

delete:
	cat manifest.yaml | sed "s/COMMIT/$(COMMIT)/" | kubectl delete -f -
.PHONY: delete

service:
	@kubectl describe svc/snakefest
.PHONY: service

external-ip:
	@kubectl get svc/snakefest -o json | jq -r '.status.loadBalancer.ingress[0].ip'
.PHONY: external-ip

release: build push deploy external-ip
.PHONY: release
