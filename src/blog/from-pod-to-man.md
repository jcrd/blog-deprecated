---
tags: post
layout: post
title: "From Pod to man pages"
date: 2022-01-30
---

While developing many of my projects I've found myself faced with the timeless
question: to document or not to document? My goal is to provide [man
pages][manpages] for any project used from the command-line or designed to be
integrated into a larger Linux ecosystem. And so, at the onset of my open-source
journey, I stood at a crossroad: learn the unwieldy [troff][troff] format of man
pages or set up a process to build them from an alternative markup format.

[manpages]: https://en.wikipedia.org/wiki/Man_page
[troff]: https://en.wikipedia.org/wiki/Troff

This is an excerpt from the `time` command's man page written in `troff`:

```txt
.TH TIME 1 2019-03-06 "" "Linux User's Manual"
.SH NAME
time \- time a simple command or give resource usage
.SH SYNOPSIS
.B time \c
.RI [ options ] " command " [ arguments... ]
.SH DESCRIPTION
The
.B time
command runs the specified program
.I command
with the given arguments.
```

From my perspective, an alternative is _necessary_. The markup syntax is cryptic
and what would be inline markup in other formats requires a newline in _troff_.

There are numerous means of generating man pages from assorted markup formats.
For example, using:

- _reStructured text_ with [`rst2man`][rst2man],
- _AsciiDoc_ format with [`AsciiDoc`][asciidoc] itself,
- _Markdown_ with [`ronn`][ronn] or [`pandoc`][pandoc],
- or _Pod_ with [`pod2man`][pod2man]

to name a few.

[rst2man]: https://manpages.debian.org/testing/docutils-common/rst2man.1.en.html
[asciidoc]: https://docs.asciidoctor.org/asciidoctor/latest/manpage-backend/
[ronn]: https://spin.atomicobject.com/2015/05/06/man-pages-in-markdown-ronn/
[pandoc]: https://gabmus.org/posts/man_pages_with_markdown_and_pandoc/
[pod2man]: https://perldoc.perl.org/pod2man

Admittedly, I'd enjoy writing man pages in _Markdown_, but in approaching the
question of an appropriate build pipeline, I decided early on that I'd like to
avoid any external depedencies. This eliminates most options, but the `pod2man`
command is available by default in the Linux distributions I've used. With this
in mind, Perl's [_Pod_][pod], or Plain Old Documentation, is the top contender.

Here's an example of a _Pod_-formatted man page from my [`iniq`][iniq] project:

[pod]: https://perldoc.perl.org/perlpod
[iniq]: https://github.com/jcrd/iniq

```md
=head1 NAME

iniq - INI file reader

=head1 SYNOPSIS

B<iniq> [options] [FILE]

With no FILE, read standard input.

=head1 DESCRIPTION

iniq is a simple INI file reader for the command line. It queries an INI file
based on the path <I<section>><I<separator>><I<key>> and allows use of custom
separators in the file and formatting of the output. Sections inherit keys from
a special DEFAULT section unless the I<-D> flag is used. See below for examples.

=head1 OPTIONS

=over

=item B<-h>

Show help message.
```

Compared to _troff_, this is both easier to write and to read, which are
important qualities in the maintenance of documentation.

## Converting `.pod` files to man pages

Producing a man page from a `.pod` file is straightforward using the `pod2man`
command. In most of my projects, this step is part of a `Makefile`.

In the case of `iniq`, these `Makefile` rules build and install its man page:

```shell
VERSIONCMD = git describe --dirty --tags --always 2> /dev/null
VERSION := $(shell $(VERSIONCMD) || cat VERSION)

PREFIX ?= /usr/local
MANPREFIX ?= $(PREFIX)/share/man
MANPAGE = iniq.1

$(MANPAGE): man/$(MANPAGE).pod
	pod2man -n=iniq -c=iniq -s=1 -r=$(VERSION) $< $(MANPAGE)

install: $(MANPAGE)
	mkdir -p $(DESTDIR)$(MANPREFIX)/man1
	cp -p $(MANPAGE) $(DESTDIR)$(MANPREFIX)/man1
```

The conversion command:

```shell
pod2man -n=$name -c=$header -s=$section -r=$footer $input $output
```

- takes the input `.pod` file as its first positional argument,
- and the output file name as its second;
- the `-n` flag sets the man page name,
- the `-c` flag sets the page header,
- the `-s` flag sets the section, which should match the output file's
  extension,
- the `-r` flag sets the page footer, which in my projects is always the
  version.

## More information

Descriptions of `pod2man`'s various options can be found [here][pod2man] or in
its man page using `man pod2man`; and with that we've come full circle!
