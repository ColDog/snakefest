COMMIT := $(shell git rev-parse --short HEAD)

run:
	docker run --rm -it -p 4000:80 coldog/snakefest:$(COMMIT)
.PHONY: run

build:
	# (cd api && yarn build)
	# (cd app && yarn build)
	docker build -t coldog/snakefest:$(COMMIT) .
.PHONY: build

push:
	docker push -t coldog/snakefest:$(COMMIT) .
.PHONY: build

render:
	@cat manifest.yaml | sed "s/COMMIT/$(COMMIT)/"
.PHONY: render

deploy:
	make render | kubectl apply -f -
.PHONY: deploy

delete:
	make render | kubectl delete -f -
.PHONY: delete

external-ip:
	@kubectl get svc/snakefest -o json | jq -r '.status.loadBalancer.ingress[0].ip'
.PHONY: external-ip

release: build deploy external-ip
.PHONY: release
