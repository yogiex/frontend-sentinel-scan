package benchmarks

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/scanner"
)

func BenchmarkHTTPEngine_Execute(b *testing.B) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Server", "Apache/2.4.41")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "<html><body>Welcome to Test</body></html>")
	}))
	defer server.Close()

	engine := scanner.NewHTTPEngine(scanner.EngineConfig{TimeoutSec: 30})

	task := scanner.Task{
		Target:     server.URL,
		TemplateID: "bench-test",
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		result := engine.Execute(context.Background(), task)
		if result.Error != nil {
			b.Fatalf("Execute failed: %v", result.Error)
		}
	}
}

func BenchmarkHTTPEngine_Execute_LargeResponse(b *testing.B) {
	body := ""
	for i := 0; i < 1000; i++ {
		body += fmt.Sprintf("<div id='block-%d'>content</div>\n", i)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Server", "nginx/1.20.1")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "<html><body>%s</body></html>", body)
	}))
	defer server.Close()

	engine := scanner.NewHTTPEngine(scanner.EngineConfig{TimeoutSec: 30})
	task := scanner.Task{
		Target:     server.URL,
		TemplateID: "bench-large",
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		result := engine.Execute(context.Background(), task)
		if result.Error != nil {
			b.Fatalf("Execute failed: %v", result.Error)
		}
	}
}
