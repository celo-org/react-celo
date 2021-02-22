

dev:
	yarn lerna run dev --stream --parallel

build-demo:
	yarn lerna run build --scope use-contractkit --stream
	yarn lerna run build --scope example --stream
	ls
	ls -a packages/example
	ls -a packages/example/.next

publish:
	cd packages/use-contractkit && yarn build && npm version patch && npm publish --public

.PHONY: dev