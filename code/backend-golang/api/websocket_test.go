package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/event"
)

func setupWebSocketTest(t *testing.T) (*httptest.Server, *event.Bus, string, func()) {
	t.Helper()
	eventBus := event.NewBus()
	h := &Handler{}
	r := mux.NewRouter()
	r.HandleFunc("/api/scans/{id}/stream", h.StreamResults(eventBus))

	ts := httptest.NewServer(r)

	wsURL := "ws" + ts.URL[4:] + "/api/scans/1/stream"
	cleanup := func() {
		ts.Close()
	}
	return ts, eventBus, wsURL, cleanup
}

func TestStreamResults_WebSocketUpgrade(t *testing.T) {
	ts, _, wsURL, cleanup := setupWebSocketTest(t)
	defer cleanup()
	_ = ts

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect to WebSocket: %v", err)
	}
	defer conn.Close()
}

func TestStreamResults_ReceivesEvent(t *testing.T) {
	_, eventBus, wsURL, cleanup := setupWebSocketTest(t)
	defer cleanup()

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	conn.SetReadDeadline(time.Now().Add(2 * time.Second))

	eventBus.Publish("1", event.Event{Type: "finding", Payload: map[string]interface{}{"id": 1, "severity": "high"}})

	_, msg, err := conn.ReadMessage()
	if err != nil {
		t.Fatalf("Failed to read message: %v", err)
	}

	var received map[string]interface{}
	if err := json.Unmarshal(msg, &received); err != nil {
		t.Fatalf("Failed to unmarshal event: %v", err)
	}

	if received["type"] != "finding" {
		t.Errorf("Event type = %v, want finding", received["type"])
	}
}

func TestStreamResults_MultipleEvents(t *testing.T) {
	_, eventBus, wsURL, cleanup := setupWebSocketTest(t)
	defer cleanup()

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	events := []event.Event{
		{Type: "progress", Payload: map[string]interface{}{"completed": 1, "total": 10}},
		{Type: "finding", Payload: map[string]interface{}{"id": 1, "severity": "critical"}},
		{Type: "finding", Payload: map[string]interface{}{"id": 2, "severity": "high"}},
		{Type: "complete", Payload: map[string]interface{}{"scan_id": 1}},
	}

	for _, evt := range events {
		eventBus.Publish("1", evt)
	}

	conn.SetReadDeadline(time.Now().Add(2 * time.Second))
	for i := 0; i < len(events); i++ {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			t.Fatalf("Failed to read message %d: %v", i, err)
		}
		var received map[string]interface{}
		if err := json.Unmarshal(msg, &received); err != nil {
			t.Fatalf("Failed to unmarshal event %d: %v", i, err)
		}
		if received["type"] != string(events[i].Type) {
			t.Errorf("Event %d type = %v, want %v", i, received["type"], events[i].Type)
		}
	}
}

func TestStreamResults_ScanIDFiltering(t *testing.T) {
	_, eventBus, wsURL, cleanup := setupWebSocketTest(t)
	defer cleanup()

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	conn.SetReadDeadline(time.Now().Add(1 * time.Second))

	// Publish to a different scan ID — should NOT be received
	eventBus.Publish("other-scan", event.Event{Type: "finding", Payload: map[string]interface{}{"id": 99}})

	// Publish to our scan ID — should be received
	eventBus.Publish("1", event.Event{Type: "finding", Payload: map[string]interface{}{"id": 1}})

	_, msg, err := conn.ReadMessage()
	if err != nil {
		t.Fatalf("Failed to read message: %v", err)
	}
	var received map[string]interface{}
	json.Unmarshal(msg, &received)
	payload := received["payload"].(map[string]interface{})
	if payload["id"] != float64(1) {
		t.Errorf("Received event from wrong scan: payload id = %v, want 1", payload["id"])
	}
}

func TestStreamResults_DisconnectOnClose(t *testing.T) {
	_, eventBus, wsURL, cleanup := setupWebSocketTest(t)
	defer cleanup()

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}

	conn.Close()

	time.Sleep(100 * time.Millisecond)

	eventBus.Publish("1", event.Event{Type: "progress", Payload: map[string]interface{}{}})
}

func TestStreamResults_BadPayloadJSON(t *testing.T) {
	_, eventBus, wsURL, cleanup := setupWebSocketTest(t)
	defer cleanup()

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	conn.SetReadDeadline(time.Now().Add(2 * time.Second))

	eventBus.Publish("1", event.Event{Type: "finding", Payload: map[string]interface{}{
		"id":   1,
		"data": "valid",
	}})

	_, msg, err := conn.ReadMessage()
	if err != nil {
		t.Fatalf("Failed to read valid message: %v", err)
	}
	var received map[string]interface{}
	json.Unmarshal(msg, &received)
	if received["type"] != "finding" {
		t.Errorf("Expected finding event, got %v", received["type"])
	}
}

func TestStreamResults_DoesNotCrashOnInvalidPayload(t *testing.T) {
	_, eventBus, wsURL, cleanup := setupWebSocketTest(t)
	defer cleanup()

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	conn.SetReadDeadline(time.Now().Add(2 * time.Second))

	// Non-serializable payload (channel) — json.Marshal will fail
	ch := make(chan int)
	eventBus.Publish("1", event.Event{Type: "bad", Payload: ch})

	eventBus.Publish("1", event.Event{Type: "finding", Payload: map[string]interface{}{"id": 1}})

	_, msg, err := conn.ReadMessage()
	if err != nil {
		t.Fatalf("Failed to read message after bad payload: %v", err)
	}
	var received map[string]interface{}
	json.Unmarshal(msg, &received)
	if received["type"] != "finding" {
		t.Errorf("Expected finding event after bad payload, got %v", received["type"])
	}
}

func TestStreamResults_RabbitMQ_InvalidScanID(t *testing.T) {
	h := &Handler{}
	r := mux.NewRouter()

	r.HandleFunc("/api/scans/{id}/stream", h.StreamResultsRabbitMQ(nil))

	ts := httptest.NewServer(r)
	defer ts.Close()

	resp, err := ts.Client().Get(ts.URL + "/api/scans/invalid-id/stream")
	if err != nil {
		t.Fatalf("Request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected 400 for invalid scan ID, got %d", resp.StatusCode)
	}
}

func TestStreamResults_RabbitMQ_ValidScanID(t *testing.T) {
	h := &Handler{}
	r := mux.NewRouter()

	r.HandleFunc("/api/scans/{id}/stream", h.StreamResultsRabbitMQ(nil))

	ts := httptest.NewServer(r)
	defer ts.Close()

	// Use WebSocket dial — upgrade will succeed (scan ID is valid)
	// Handler will then panic on nil eventConsumer, but that means scan ID was accepted
	wsURL := "ws" + ts.URL[4:] + "/api/scans/1/stream"
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		// If the error is about bad request or scan ID, that's a problem
		if websocket.IsCloseError(err, websocket.CloseAbnormalClosure) ||
			websocket.IsCloseError(err, websocket.CloseInternalServerErr) {
			return // handler panicked on nil consumer after upgrade — expected
		}
		t.Fatalf("Unexpected WebSocket error: %v", err)
	}
	defer conn.Close()
	// Connected successfully — scan ID was valid
}
