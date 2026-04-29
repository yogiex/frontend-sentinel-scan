package event

import (
	"testing"
	"time"
)

func TestBus_SubscribePublish(t *testing.T) {
	bus := NewBus()
	scanID := "test-scan-1"

	ch := bus.Subscribe(scanID)
	defer bus.Unsubscribe(scanID, ch)

	// Publish event
	bus.PublishFinding(scanID, map[string]string{"test": "value"})

	// Wait for event
	select {
	case event := <-ch:
		if event.Type != EventTypeFinding {
			t.Errorf("Expected finding event, got %s", event.Type)
		}
	case <-time.After(1 * time.Second):
		t.Error("Timeout waiting for event")
	}
}
