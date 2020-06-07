# Tmux Reference

[TOC]

You can't scroll back with the trackpad or mouse wheel in tmux. The sacrifice of your precious time to learn these commands is worth it.

## RTFM:

<http://manpages.ubuntu.com/manpages/eoan/man1/tmux.1.html>
<https://tmuxcheatsheet.com/>

## Use ctrl+b to enter tmux command mode. Then press a command key:

## The most important command is 'd' ... DETACH and escape TMUX

## The 2nd most important command is 'ctrl+c' ... to escape scrolling mode

## Thirdly, yes you CAN use the mouse to scroll, but first, press ctrl+b and fn+up-arrow (or for some people ctrl+b and page up). Then you can scroll.

## Press ctrl+c to exit scrolling mode

____

> ### fn key + up and down arrow

Scroll up and down by one page through the pane
____

> #### z: zoom / unzoom current pane

Make one of the small panes take up the whole screen. Useful for reading logs.
____

> #### up and down arrow

Switch panes. Wait 2 seconds after switching to type new commands
____

> #### shift+{ or shift+}

> Cycle the order of the panes in the window. Useful coupled with spacebar, to bring the pane you want to focus on to the stop of the pane stack first

### tmux management

kill all sessions

`tmux kill-server`

attach to last used session

`tmux attach`

list all sessions

`tmux list-sessions`

attach to specific

`tmux attach -t gram-app`

### tmuxp: auto tmux session generator

#### Start the built-in sessions

`gram mux.sh bare-metal`
`gram mux.sh docker`
`gram mux.sh tapp-dev`
`gram mux.sh wasm`

#### Load tmux completions in your shell

> Add lines in your shell RC file:

Linux/bash (~/.bashrc):

`eval "$(_TMUXP_COMPLETE=source tmuxp)"`

OSX/zsh (~/.zshrc):

`eval "$(_TMUXP_COMPLETE=source_zsh tmuxp)"`
