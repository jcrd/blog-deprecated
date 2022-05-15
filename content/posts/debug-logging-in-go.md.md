---
title: "Debug logging in Go"
tags:
  - development
  - debugging
  - go
date: 2022-05-15
---

My project, [lifelight][lifelight], is written in Go and designed to run on
low-powered [Raspberry Pis][raspi]. I wanted minimal overhead in the production
build, so I implemented a logging system that is compiled out in non-debug
builds. This is made easy using Go's [_build constraints_][build-const].

[lifelight]: https://github.com/jcrd/lifelight
[raspi]: https://www.raspberrypi.com/products/raspberry-pi-zero/
[build-const]: https://pkg.go.dev/go/build#hdr-Build_Constraints

## The code

This implementation utilizes three files: the main file, and two logger
implementation files with build constraints.

The main file includes the interface definition and a global variable:

```go
package main

type Logger interface {
    // format string, and objects to format
    Log(string, ...interface{})
}

var logger Logger
```

One of the logger implementations, the _dummy_, satisfies this interface with
methods that do nothing:

```go
//go:build !debug

package main

type DummyLogger struct {}

func (dl DummyLogger) log(format string, v ...interface{}) {}

func init() {
    logger = DummyLogger{}
}
```

The `//go:build !debug` build constraint means that it will only be included in
the production build when the `debug` tag is absent.

The `init` function will be called at runtime, setting the global `logger`
variable for use in the rest of the program.

The debug logger is implemented in the same way, using the `//go:build debug`
build constraint:

```go
//go:build debug

package life

import (
	"log"
)

type DebugLogger struct {}

func (dl *DebugLogger) log(format string, v ...interface{}) {
    log.Printf(format, v...)
}

func init() {
	logger = &DebugLogger{}
}
```

## The build

Specifying tags at build time is simple:

```sh
go build -tags debug .
```

This can be integrated into a `Makefile`, for example:

```Makefile
main:
    go build .

debug:
    go build -tags debug .

.PHONY: debug
```

Now, logging does nothing unless the `debug` tag is specified!
