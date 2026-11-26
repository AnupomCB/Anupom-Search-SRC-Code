module anupomsearch

go 1.24

require (
	github.com/jchv/go-webview2 v0.0.0-20260205173254-56598839c808
	golang.org/x/sys v0.28.0
)

require github.com/jchv/go-winloader v0.0.0-20250406163304-c1995be93bd1 // indirect

replace github.com/jchv/go-webview2 => /tmp/claude-0/mods/go-webview2

replace github.com/jchv/go-winloader => /tmp/claude-0/mods/go-winloader

replace golang.org/x/sys => /tmp/claude-0/mods/sys
