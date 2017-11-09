# Octopede

[![Travis build status](http://img.shields.io/travis/gajus/octopede/master.svg?style=flat-square)](https://travis-ci.org/gajus/octopede)
[![Coveralls](https://img.shields.io/coveralls/gajus/octopede.svg?style=flat-square)](https://coveralls.io/github/gajus/octopede)
[![NPM version](http://img.shields.io/npm/v/octopede.svg?style=flat-square)](https://www.npmjs.org/package/octopede)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Headless Chrome orchestration service.

## Usage

Refer to the CLI manual.

```bash
$ octopede --help

```

### Start a cluster

```bash
$ octopede start \
  --maximum-instances 10 \
  --minimum-instances 5 \
  --port 9200

```
