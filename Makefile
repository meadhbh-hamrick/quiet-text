# Makefile
#

info:
	@echo Targets include: install, site, test, clean
	@echo install - download node dependencies
	@echo site - builds HTML site using warp and weave
	@echo test - tests lexxer, parser, warp and weave
	@echo clean - removes node_modules and package-lock.json

install:
	npm install

site:
	@echo ToDo: Implement site functionality

test:
	npm run test

clean:
	$(RM) -r node_modules package-lock.json
