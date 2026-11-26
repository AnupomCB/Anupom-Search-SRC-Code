//go:build windows

package main

import (
	_ "embed"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"

	webview2 "github.com/jchv/go-webview2"
	"golang.org/x/sys/windows"
)

//go:embed index.html
var indexHTML []byte

//go:embed logo.png
var logoPNG []byte

//go:embed inject.js
var injectJS string

func msgBox(title, text string) {
	t, _ := windows.UTF16PtrFromString(title)
	m, _ := windows.UTF16PtrFromString(text)
	windows.MessageBox(0, m, t, windows.MB_OK|windows.MB_ICONINFORMATION)
}

func main() {
	// Single instance: a second launch just exits instead of opening a duplicate window.
	name, _ := windows.UTF16PtrFromString("Local\\AnupomSearchSingleInstance")
	if h, err := windows.CreateMutex(nil, false, name); err == nil {
		if windows.GetLastError() == windows.ERROR_ALREADY_EXISTS {
			_ = h
			return
		}
	}

	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		msgBox("Anupom Search", "Could not start the local page server:\n"+err.Error())
		return
	}
	port := fmt.Sprint(ln.Addr().(*net.TCPAddr).Port)

	mux := http.NewServeMux()
	mux.HandleFunc("/logo.png", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/png")
		w.Header().Set("Cache-Control", "max-age=86400")
		w.Write(logoPNG)
	})
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" && r.URL.Path != "/index.html" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store")
		w.Write(indexHTML)
	})
	go http.Serve(ln, mux)

	dataDir := filepath.Join(os.Getenv("LOCALAPPDATA"), "AnupomSearch")
	_ = os.MkdirAll(dataDir, 0o755)

	w := webview2.NewWithOptions(webview2.WebViewOptions{
		DataPath:  dataDir,
		AutoFocus: true,
		WindowOptions: webview2.WindowOptions{
			Title: "Anupom Search", Width: 1180, Height: 780, IconId: 1, Center: true,
		},
	})
	if w == nil {
		msgBox("Anupom Search",
			"Microsoft Edge WebView2 Runtime is required but was not found.\n\n"+
				"Please install it from:\nhttps://go.microsoft.com/fwlink/p/?LinkId=2124703\n\nthen start Anupom Search again.")
		return
	}
	defer w.Destroy()
	w.SetSize(1180, 780, webview2.HintNone)
	w.SetSize(760, 520, webview2.HintMin)

	// Lets the About page / toolbar open a link in the user's default browser.
	_ = w.Bind("anupomOpenExternal", func(u string) {
		if strings.HasPrefix(u, "http://") || strings.HasPrefix(u, "https://") {
			c := exec.Command("rundll32", "url.dll,FileProtocolHandler", u)
			c.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
			_ = c.Start()
		}
	})
	w.Init(strings.ReplaceAll(injectJS, "%PORT%", port))
	w.Navigate("http://127.0.0.1:" + port + "/")
	w.Run()
}
