package detection

import (
	"fmt"
	"net/http"
	"time"
)

type Fingerprint struct {
	client *http.Client
}

func NewFingerprint() *Fingerprint {
	return &Fingerprint{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (f *Fingerprint) Fingerprint(target string, tmpl interface{}) (string, error) {
	// Simple banner grabbing for version fingerprinting
	resp, err := f.client.Get(target)
	if err != nil {
		return "", fmt.Errorf("failed to reach target: %w", err)
	}
	defer resp.Body.Close()

	// Check Server header for version info
	server := resp.Header.Get("Server")
	if server != "" {
		return server, nil
	}

	return "unknown", nil
}
