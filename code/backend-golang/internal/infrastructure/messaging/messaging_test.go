package messaging

import (
	"context"
	"errors"
	"testing"
)

func TestItoa(t *testing.T) {
	tests := []struct {
		input uint
		want  string
	}{
		{0, "0"},
		{1, "1"},
		{9, "9"},
		{10, "10"},
		{100, "100"},
		{999, "999"},
		{123456789, "123456789"},
	}

	for _, tt := range tests {
		t.Run(tt.want, func(t *testing.T) {
			got := itoa(tt.input)
			if got != tt.want {
				t.Errorf("itoa(%d) = %s, want %s", tt.input, got, tt.want)
			}
		})
	}
}

func TestEventRoutingKey(t *testing.T) {
	tests := []struct {
		scanID    uint
		eventType EventType
		want      string
	}{
		{1, EventFinding, "scan.1.finding"},
		{42, EventProgress, "scan.42.progress"},
		{100, EventComplete, "scan.100.complete"},
		{0, EventFailed, "scan.0.failed"},
		{999, EventCancelled, "scan.999.cancelled"},
	}

	for _, tt := range tests {
		t.Run(tt.want, func(t *testing.T) {
			got := EventRoutingKey(tt.scanID, tt.eventType)
			if got != tt.want {
				t.Errorf("EventRoutingKey(%d, %s) = %s, want %s", tt.scanID, tt.eventType, got, tt.want)
			}
		})
	}
}

func TestScanEventRoutingKey(t *testing.T) {
	tests := []struct {
		scanID uint
		want   string
	}{
		{1, "scan.1.#"},
		{42, "scan.42.#"},
		{0, "scan.0.#"},
	}

	for _, tt := range tests {
		t.Run(tt.want, func(t *testing.T) {
			got := ScanEventRoutingKey(tt.scanID)
			if got != tt.want {
				t.Errorf("ScanEventRoutingKey(%d) = %s, want %s", tt.scanID, got, tt.want)
			}
		})
	}
}

func TestDefaultConfig(t *testing.T) {
	cfg := DefaultConfig()

	if cfg.Host != "localhost" {
		t.Errorf("DefaultConfig() Host = %s, want localhost", cfg.Host)
	}
	if cfg.Port != 5672 {
		t.Errorf("DefaultConfig() Port = %d, want 5672", cfg.Port)
	}
	if cfg.User != "admin" {
		t.Errorf("DefaultConfig() User = %s, want admin", cfg.User)
	}
	if cfg.PrefetchCount != DefaultPrefetchCount {
		t.Errorf("DefaultConfig() PrefetchCount = %d, want %d", cfg.PrefetchCount, DefaultPrefetchCount)
	}
	if cfg.Heartbeat != 30 {
		t.Errorf("DefaultConfig() Heartbeat = %d, want 30", cfg.Heartbeat)
	}
	if cfg.MaxRetries != DefaultMaxRetries {
		t.Errorf("DefaultConfig() MaxRetries = %d, want %d", cfg.MaxRetries, DefaultMaxRetries)
	}
	if cfg.RetryDelayMS != DefaultRetryDelayMS {
		t.Errorf("DefaultConfig() RetryDelayMS = %d, want %d", cfg.RetryDelayMS, DefaultRetryDelayMS)
	}
}

func TestNewConnection(t *testing.T) {
	cfg := DefaultConfig()
	conn := NewConnection(cfg)
	if conn == nil {
		t.Fatal("NewConnection() returned nil")
	}
	if conn.IsConnected() {
		t.Error("NewConnection() should not be connected initially")
	}
}

func TestConnection_Channel_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	_, err := conn.Channel()
	if err == nil {
		t.Error("Channel() expected error when not connected")
	}
}

func TestConnection_Publish_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	err := conn.Publish(context.Background(), "test", "key", []byte("body"))
	if err == nil {
		t.Error("Publish() expected error when not connected")
	}
}

func TestConnection_Consume_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	_, err := conn.Consume("queue", "tag", false)
	if err == nil {
		t.Error("Consume() expected error when not connected")
	}
}

func TestConnection_QueueDepth_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	_, err := conn.QueueDepth("test-queue")
	if err == nil {
		t.Error("QueueDepth() expected error when not connected")
	}
}

func TestConnection_Close_Idempotent(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	conn.Close()
}

func TestNewTaskPublisher(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewTaskPublisher(conn)
	if pub == nil {
		t.Fatal("NewTaskPublisher() returned nil")
	}
}

func TestNewEventPublisher(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewEventPublisher(conn)
	if pub == nil {
		t.Fatal("NewEventPublisher() returned nil")
	}
}

func TestNewEventConsumer(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	consumer := NewEventConsumer(conn)
	if consumer == nil {
		t.Fatal("NewEventConsumer() returned nil")
	}
}

func TestNewTaskConsumer(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewTaskPublisher(conn)
	handler := &mockTaskHandler{}
	consumer := NewTaskConsumer(conn, handler, pub, DefaultConfig(), "")

	if consumer == nil {
		t.Fatal("NewTaskConsumer() returned nil")
	}
}

func TestNewTaskConsumer_CustomQueue(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewTaskPublisher(conn)
	handler := &mockTaskHandler{}
	consumer := NewTaskConsumer(conn, handler, pub, DefaultConfig(), QueueTasksHTTP)

	if consumer == nil {
		t.Fatal("NewTaskConsumer() returned nil")
	}
}

type mockTaskHandler struct{}

func (h *mockTaskHandler) HandleTask(ctx context.Context, msg TaskMessage) TaskResult {
	return TaskResult{Status: TaskStatusSuccess}
}

func TestTaskPublisher_PublishTask_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewTaskPublisher(conn)

	err := pub.PublishTask(context.Background(), 1, "http://example.com", "template-1")
	if err == nil {
		t.Error("PublishTask() expected error when not connected")
	}
}

func TestTaskPublisher_PublishHTTP_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewTaskPublisher(conn)

	err := pub.PublishHTTP(context.Background(), 1, "http://example.com", "template-1")
	if err == nil {
		t.Error("PublishHTTP() expected error when not connected")
	}
}

func TestTaskPublisher_PublishHeadless_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewTaskPublisher(conn)

	err := pub.PublishHeadless(context.Background(), 1, "http://example.com", "template-1")
	if err == nil {
		t.Error("PublishHeadless() expected error when not connected")
	}
}

func TestTaskPublisher_PublishRetry_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewTaskPublisher(conn)

	msg := TaskMessage{ScanID: 1, Target: "http://example.com", TemplateID: "t1", RetryCount: 0}
	err := pub.PublishRetry(context.Background(), msg)
	if err == nil {
		t.Error("PublishRetry() expected error when not connected")
	}
}

func TestTaskPublisher_PublishDLQ_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewTaskPublisher(conn)

	msg := TaskMessage{ScanID: 1, Target: "http://example.com", TemplateID: "t1"}
	err := pub.PublishDLQ(context.Background(), msg, "test error")
	if err == nil {
		t.Error("PublishDLQ() expected error when not connected")
	}
}

func TestEventPublisher_PublishFinding_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewEventPublisher(conn)

	err := pub.PublishFinding(context.Background(), 1, &FindingPayload{Target: "http://example.com"})
	if err == nil {
		t.Error("PublishFinding() expected error when not connected")
	}
}

func TestEventPublisher_PublishProgress_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewEventPublisher(conn)

	err := pub.PublishProgress(context.Background(), 1, 5, 10)
	if err == nil {
		t.Error("PublishProgress() expected error when not connected")
	}
}

func TestEventPublisher_PublishComplete_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewEventPublisher(conn)

	err := pub.PublishComplete(context.Background(), 1)
	if err == nil {
		t.Error("PublishComplete() expected error when not connected")
	}
}

func TestEventPublisher_PublishFailed_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewEventPublisher(conn)

	err := pub.PublishFailed(context.Background(), 1, errors.New("test error"))
	if err == nil {
		t.Error("PublishFailed() expected error when not connected")
	}
}

func TestEventPublisher_PublishCancelled_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewEventPublisher(conn)

	err := pub.PublishCancelled(context.Background(), 1)
	if err == nil {
		t.Error("PublishCancelled() expected error when not connected")
	}
}

func TestEventConsumer_SubscribeScan_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	consumer := NewEventConsumer(conn)

	_, err := consumer.SubscribeScan(context.Background(), 1)
	if err == nil {
		t.Error("SubscribeScan() expected error when not connected")
	}
}

func TestEventConsumer_ConsumePersist_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	consumer := NewEventConsumer(conn)

	err := consumer.ConsumePersist(context.Background(), func(ctx context.Context, msg EventMessage) error {
		return nil
	})
	if err == nil {
		t.Error("ConsumePersist() expected error when not connected")
	}
}

func TestTaskConsumer_Consume_NotConnected(t *testing.T) {
	conn := NewConnection(DefaultConfig())
	pub := NewTaskPublisher(conn)
	handler := &mockTaskHandler{}
	consumer := NewTaskConsumer(conn, handler, pub, DefaultConfig(), QueueTasks)

	err := consumer.Consume(context.Background(), 1)
	if err == nil {
		t.Error("Consume() expected error when not connected")
	}
}
