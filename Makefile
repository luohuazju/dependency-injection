MOCHA_OPTS = --check-leaks
REPORTER = dot

check: test

test:
	@NODE_ENV=test mocha \
		--reporter $(REPORTER) \
		test/*.js

.PHONY: test check