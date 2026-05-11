package event

import (
	"sync"
)

type EventType string

const (
	EventTypeFinding   EventType = "finding"
	EventTypeProgress  EventType = "progress"
	EventTypeComplete  EventType = "complete"
	EventTypeFailed    EventType = "failed"
)

type Event struct {
	Type    EventType   `json:"type"`
	Payload interface{} `json:"payload,omitempty"`
}

type Bus struct {
	subscribers map[string][]chan Event
	mu          sync.RWMutex
}

func NewBus() *Bus {
	return &Bus{
		subscribers: make(map[string][]chan Event),
	}
}

func (b *Bus) Subscribe(scanID string) chan Event {
	b.mu.Lock()
	defer b.mu.Unlock()

	ch := make(chan Event, 10)
	b.subscribers[scanID] = append(b.subscribers[scanID], ch)
	return ch
}

func (b *Bus) Unsubscribe(scanID string, ch chan Event) {
	b.mu.Lock()
	defer b.mu.Unlock()

	subs := b.subscribers[scanID]
	for i, sub := range subs {
		if sub == ch {
			b.subscribers[scanID] = append(subs[:i], subs[i+1:]...)
			close(ch)
			break
		}
	}
}

func (b *Bus) Publish(scanID string, event Event) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	for _, ch := range b.subscribers[scanID] {
		select {
		case ch <- event:
		default:
			// Subscriber channel full, skip
		}
	}
}

func (b *Bus) PublishFinding(scanID string, finding interface{}) {
	b.Publish(scanID, Event{Type: EventTypeFinding, Payload: finding})
}

func (b *Bus) PublishProgress(scanID string, completed, total int) {
	b.Publish(scanID, Event{Type: EventTypeProgress, Payload: map[string]int{
		"completed": completed,
		"total":     total,
	}})
}

func (b *Bus) PublishComplete(scanID string) {
	b.Publish(scanID, Event{Type: EventTypeComplete})
}
