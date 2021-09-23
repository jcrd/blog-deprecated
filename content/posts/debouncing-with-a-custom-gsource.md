---
title: "Debouncing with a custom GSource"
categories:
  - Development
tags:
  - C
  - Linux
date: 2021-04-13T10:40:28-06:00
---

While developing [sessiond][sessiond], a session manager written in C with
[GLib][glib], I was presented with an ideal use case for debouncing: postponing
the execution of code that would otherwise run too frequently based on the
influx of external events. sessiond is responsible for monitoring X11 input
events, which are processed in the GLib event loop using a
custom [GSource][gsource]. Debouncing avoids unnecessarily handling every event,
especially mouse input events which are generated constantly while the mouse
pointer moves.

[sessiond]: https://twiddlingbits.net/introducing-sessiond/
[glib]: https://docs.gtk.org/glib/
[gsource]: https://docs.gtk.org/glib/struct.Source.html

## Abstract debouncing

In the case of sessiond, only the time an input event occurred is relevant, so an
abstract implementation of debouncing might look like this:

```python
debounce_interval = 1

while true:
    if event:
        last_event_time = current_time()
        schedule_event_processing(last_event_time + debounce_interval)

# Called when time given to `schedule_event_processing` is reached.
def process_event():
    if current_time() - last_event_time >= debounce_interval:
        process()
```

When an event occurs, the current time is recorded as `last_event_time`. There
should be no response to the event until at least `debounce_interval` has
elapsed, so event processing is scheduled for a time in the future equal to the
current time plus the debounce interval. If another event occurs before this
time has passed, an additional response is scheduled, and `last_event_time` is
updated.

In the processing function, it is important to compare the time that has elapsed
since the last event to `debounce_interval` to ensure additional events were not
generated after this response was scheduled. This way, event processing happens
only when `debounce_interval` time has passed since the last event was
received—the essence of debouncing.

## Custom GSource implementation

This method of debouncing can be implemented with a custom GSource's `check` and
`dispatch` functions using [g_source_set_ready_time][ready-time].

[ready-time]: https://docs.gtk.org/glib/method.Source.set_ready_time.html

First, define a custom GSource by declaring a struct containing a `GSource`:

```c
typedef struct {
    GSource source;
    gpointer fd;
    gint64 last_event_time;
} InputSource;
```

Next, implement the `check` function, which determines if the source is ready to
be dispatched:

```c
#define DEBOUNCE_US (1 * 1000000)

gboolean
inputsource_check(GSource *source)
{
    InputSource *self = (InputSource *)source;
    GIOCondition revents = g_source_query_unix_fd(source, self->fd);

    if (!(revents & G_IO_IN))
        return FALSE;

    // Process events...

    self->last_event_time = g_get_monotonic_time();
    g_source_set_ready_time(source, self->last_event_time + DEBOUNCE_US);
}
```

In this function, a file descriptor is queried to determine if any events are
pending. If there are no events to be handled, the function returns `FALSE` to
signify there is no need to call the `dispatch` function. Otherwise, pending
events should be processed accordingly. Finally, the current monotonic
time—being that of the last event(s)—is recorded and the source is instructed
to dispatch in `DEBOUNCE_US` microseconds with `g_source_set_ready_time`.

Now, implement the `dispatch` function, which is responsible for calling the
callback function provided to this GSource at creation time:

```c
gboolean
inputsource_dispatch(GSource *source, GSourceFunc func, gpointer user_data)
{
    XSource *self = (XSource *)source;

    if (g_get_monotonic_time() - self->last_event_time >= DEBOUNCE_US) {
        g_source_set_ready_time(source, -1);
        return func(user_data);
    }

    return G_SOURCE_CONTINUE;
}
```

The logic here is as follows: this function is called at the monotonic time
given to `g_source_set_ready_time` in the `check` function above, so we know at
least `DEBOUNCE_US` time has passed since the handling of *those* events,
**but** additional events may have been received in the meantime, reflected by
an updated `self->last_event_time`. If at least `DEBOUNCE_US` time has elapsed
since the last event, we call the user-provided callback function, and
`g_source_set_ready_time(source, -1)` is used to stop future dispatching of this
source until the `check` function detects pending events. This is necessary
because `g_source_set_ready_time` will cause the source to be continuously
dispatched if the time it was last given is in the past, which will inevitably
be the case.

Finally, create the `GSourceFuncs` struct and initialize the custom GSource:

```c
GSourceFuncs inputsource_funcs = {
    NULL, // prepare function
    inputsource_check,
    inputsource_dispatch,
    NULL, // finalize function
    NULL,
    NULL,
};

GSource *source = g_source_new(&inputsource_funcs, sizeof(InputSource));
InputSource *self = (InputSource *)source;

self->last_event_time = 0;

// Add the file descriptor.
// self->fd = g_source_add_unix_fd(source, ..., G_IO_IN);

// Set callback.
// g_source_set_callback(source, ...);

// Attach source to context.
// g_source_attach(source, ...);
```

## More information

[This tutorial][gsource-tut] describes in greater detail the `check`,
`dispatch`, and other functions that control the behavior of a custom GSource.

For a complete working example, refer to sessiond's debouncing implementation in
[xsource.c][xsource].

[gsource-tut]: https://web.archive.org/web/20200806195500/https://developer.gnome.org/gnome-devel-demos/unstable/custom-gsource.c.html.en
[xsource]: https://github.com/jcrd/sessiond/blob/master/src/xsource.c
