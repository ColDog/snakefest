COMMIT := $(shell git rev-parse --short HEAD)

run:
	docker run --rm -it -p 4000:80 coldog/snakefest:$(COMMIT)
.PHONY: run

build:
	(cd api && yarn install && yarn build)
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

external-ip:
	@kubectl get svc/snakefest -o json | jq -r '.status.loadBalancer.ingress[0].ip'
.PHONY: external-ip

release: build push deploy external-ip
.PHONY: release
