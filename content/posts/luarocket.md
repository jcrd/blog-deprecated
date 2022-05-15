---
title: "luarocket, or vendoring Lua rocks"
tags:
  - lua
  - development
  - project
date: 2022-04-24
---

The Lua programming language, like many others, employs a purpose-built package
manager to download and install its ecosystem of libraries. This tool,
[LuaRocks][luarocks], has some notable features:

- downloads/installs packages to user-specific or system-wide locations
- configurable dependency resolution
- builds locally define rocks (Lua modules packaged by LuaRocks)
- queries information about the active LuaRocks configuration

In these ways, LuaRocks is functionally similar to the package managers of other
dynamic languages such as [pip][pip] for Python and [npm][npm] for JavaScript.

<!--more-->

Where these features fall short is in managing the dependencies of multiple Lua
projects—each with a potentially different version of Lua. Being that Lua is an
[_embedded language_][lua-embed], this is in fact common, and further
exacerbated by the popularity of both the reference [Lua][lua] implementation
and [luajit][luajit].

[luarocks]: https://luarocks.org/
[pip]: https://pip.pypa.io/en/stable/
[npm]: https://www.npmjs.com/
[lua-embed]: https://www.lua.org/pil/24.html
[lua]: https://www.lua.org/
[luajit]: https://luajit.org/

## Problem

I encountered this issue during the development of an experimental window
manager, [dovetail][dovetail]. It is based on the [awesome window
manager][awesomewm] framework, which can be built with Lua versions 5.1-5.3 or
luajit. It also depends on a few Lua packages, and therein lies the problem. It
quickly became an overwhelming task to unify the range of Lua versions and
implementations, 3rd party packages, varying installation paths, and integration
with an embedded interpreter.

[dovetail]: https://github.com/jcrd/dovetail
[awesomewm]: https://awesomewm.org/

## Solution

After consideration of my options, I decided the easiest solution was to vendor
all dependency packages. I set up Makefile rules to download the version of
packages specified in a version-controlled file to a specific Lua rocks tree
where the package’s files are extracted and moved into a `lua_modules` directory
in the root of the project. During installation, these modules are copied to a
system-wide shared data directory and referenced by awesome’s Lua interpreter.

When I required this functionality outside of the dovetail project, I
re-implemented these Makefile rules as a shell script called
[luarocket][luarocket]. It is meant to be included directly in a project and
utilized as part of its build process.

## References

- [luarocket]: Vendor Lua rocks into a local project directory

[luarocket]: https://github.com/jcrd/luarocket
