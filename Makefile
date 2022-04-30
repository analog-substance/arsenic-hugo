report:: example/node_modules
	@cd example && \
	hugo server
example/node_modules:
	@cd example && \
	npm install
