# Makefile for Biba-Bop Firebase Hosting

build:
	npm run build

deploy: build
	firebase deploy

clean:
	rm -rf dist

dev:
	npm run dev

# Optional: alias for login
login:
	firebase login
