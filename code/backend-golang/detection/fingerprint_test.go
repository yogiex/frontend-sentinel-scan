package detection

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestFingerprint_ServerHeader(t *testing.T) {
	// Create test server
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Server", "Apache/2.4.29")
		w.WriteHeader(http.StatusOK)
	}))
	defer ts.Close()

	fp := NewFingerprint()
	version, err := fp.Fingerprint(ts.URL, nil)
	if err != nil {
		t.Fatalf("Fingerprint failed: %v", err)
	}

	if version != "Apache/2.4.29" {
		t.Errorf("Expected version Apache/2.4.29, got %s", version)
	}
}
