---
title: "Introducing sessiond"
tags:
  - c
  - linux
  - project
date: 2021-04-04
lastmod: 2022-01-25
---

When I began using Linux on the desktop in ~2012, I experimented with the
prevalent desktop environments (Gnome, KDE, etc.), but was quickly drawn into
the realm of tiling window managers by their promise of increased productivity
and customization. While I believe these promises were fulfilled, tiling window
managers were not without a significant shortcoming: they are solely window
managers, lacking the integrated suite of software and applications that put the
environment in desktop environments. The most noticeable omission was proper
_session management_, which facilitates, for instance: locking the screen or
suspending the system after a period of inactivity. This was not a dealbreaker
on a desktop computer, but using a laptop without these features felt like a
dysfunctional hack.

It would be quite a few more years of exploring the universe of tiling window
managers before deciding to address this issue myself, and with the broad
adoption of _systemd_ by the larger Linux ecosystem, it was easier than ever.
Enter: **sessiond**, a standalone session manager for Linux.

## What does it do?

sessiond is a daemon for _systemd_-based Linux systems that interfaces with
_systemd-logind_ to provide the missing session management features to X11
window managers. Its primary responsibility is to monitor keyboard and mouse
activity to determine when a session has become idle, and to then act
accordingly. It is capable of:

- locking the screen when idle and before suspending the system
- dimming the screen's backlight when idle
- triggering _systemd_ targets for use by the window manager or end user
- optionally managing DPMS settings
- controlling keyboard and monitor backlight brightness
- controlling audio sink volume and mute state **\***

{{< notice label="* Update" color="green" >}} The audio sink interface is new in
version **0.6.0**. {{< /notice >}}

It also provides a DBus service so that it may be integrated with modern window
managers. For example, a window manager can prevent idling when a media player
is open by interacting with the DBus methods.

It is designed to be zero-configuration, providing sensible defaults, but allows
configuration if needed. See [here][config] for additional details.

[config]: https://sessiond.org/configuration/

## How do I use it?

sessiond requires a Linux system utilizing _systemd-logind_. It may be possible
to use [elogind][elogind] but this has not been tested.

{{< notice label="Note">}} This brief tutorial assumes basic knowledge of
_systemd_-based Linux systems and the command-line. {{< /notice >}}

[elogind]: https://github.com/elogind/elogind

### Installation

Currently, sessiond RPM packages are built for Fedora via [copr][copr] and
installable with the following commands:

```sh
dnf copr enable jcrd/sessiond
dnf install sessiond
```

I would like to see packages for other major distros in the future. Until
sessiond achieves world domination, it is recommended to build from source by
following [these instructions][building].

If you package sessiond for your distribution, please let me know by creating an
issue [here][sessiond.org-repo].

[copr]: https://copr.fedorainfracloud.org/coprs/jcrd/sessiond/
[building]: https://sessiond.org/building/
[sessiond.org-repo]: https://github.com/jcrd/sessiond.org/issues

### Setting up your window manager

The intended way to use sessiond with your window manager of choice is to create
a custom _systemd_ service in the `~/.config/systemd/user` directory. For
example, below is a `awesome.service` file that runs the [Awesome][awesomewm]
window manager:

```systemd
[Unit]
Description=Awesome window manager
Requires=sessiond-session.target
After=sessiond.service
PartOf=graphical-session.target

[Service]
ExecStart=/usr/bin/awesome

[Install]
Alias=window-manager.service
```

The options in the `[Unit]` section ensure your window manager is only running
alongside the sessiond daemon. The `Alias=` option in the `[Install]` section
lets sessiond know this service is the window manager so the session will be
stopped when it exits.

Next, enable the window manager service with
`systemctl --user enable awesome.service`.

Now, select the `sessiond session` entry via your display manager or set it as
the default in its configuration file. For example, if using `lightdm`, set
`user-session=sessiond` in `/etc/lightdm/lightdm.conf`.

[awesomewm]: https://awesomewm.org/

### Locking the session

sessiond wouldn't be of much use without a means by which to lock the screen.
Create a service for your screen locker of choice in `~/.config/systemd/user`.
For example, here is a `i3lock.service` that runs `i3lock` as the screen locker:

```systemd
[Unit]
Description=Lock X session with i3lock
PartOf=graphical-session.target

[Service]
ExecStart=/usr/bin/i3lock
ExecStopPost=/usr/bin/sessionctl unlock

[Install]
WantedBy=graphical-lock.target
```

The `sessionctl unlock` command in `ExecStopPost` under the `[Service]` section
notifies sessiond that the session has been unlocked when the service exits.
Enable with `systemctl --user enable i3lock` so its started upon triggering the
`graphical-lock` target, which by default occurs when the session becomes
inactive and before suspending the system.

### Other services

Additional services (e.g. a compositor) can be started with the session by
creating _systemd_ service files in `~/.config/systemd/user` containing:

```systemd
[Unit]
PartOf=graphical-session.target
```

and:

```systemd
[Install]
WantedBy=graphical-session.target
```

Enable such services with `systemctl --user enable <service>`.

### Inhibiting idling

It's often desirable to prevent the session from idling while, for instance,
watching a video. `sessiond-inhibit` comes to the rescue:

```sh
sessiond-inhibit -y 'movie night' mpv ...
```

This can be automated if your window manager supports client rules and some
level of scripting.

## More information

For more information about sessiond, visit its [website][sessiond].

[sessiond]: https://sessiond.org/

You should now be equipped with sufficient knowledge to go forth and manage your
own sessions!
