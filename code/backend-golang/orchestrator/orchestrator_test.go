package orchestrator

import (
	"context"
	"errors"
	"os"
	"sync"
	"testing"
	"time"

	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/domain/entity"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/domain/repository"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/event"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/worker"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/template"
	"github.com/stretchr/testify/mock"
)

type mockScanRepo struct {
	mock.Mock
}

func (m *mockScanRepo) Create(ctx context.Context, scan *entity.ScanJob) error {
	args := m.Called(ctx, scan)
	return args.Error(0)
}

func (m *mockScanRepo) FindByID(ctx context.Context, id uint) (*entity.ScanJob, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.ScanJob), args.Error(1)
}

func (m *mockScanRepo) Update(ctx context.Context, scan *entity.ScanJob) error {
	args := m.Called(ctx, scan)
	return args.Error(0)
}

func (m *mockScanRepo) UpdateStatus(ctx context.Context, id uint, status entity.ScanStatus) error {
	args := m.Called(ctx, id, status)
	return args.Error(0)
}

func (m *mockScanRepo) UpdateProgress(ctx context.Context, id uint, progress *entity.ScanProgress) error {
	args := m.Called(ctx, id, progress)
	return args.Error(0)
}

func (m *mockScanRepo) List(ctx context.Context, filter repository.ScanFilter) ([]*entity.ScanJob, error) {
	args := m.Called(ctx, filter)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entity.ScanJob), args.Error(1)
}

func setupTestOrchestrator(t *testing.T) (*Orchestrator, chan worker.Task, string) {
	t.Helper()

	tmpDir, err := os.MkdirTemp("", "test-templates-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}

	tmplContent := `
id: CVE-2023-1234
info:
  name: Test Vulnerability
  severity: high
  tags: [web, rce]
`
	if err := os.WriteFile(tmpDir+"/CVE-2023-1234.yaml", []byte(tmplContent), 0644); err != nil {
		t.Fatalf("Failed to write test template: %v", err)
	}

	loader, err := template.NewLoader(tmpDir)
	if err != nil {
		t.Fatalf("Failed to create loader: %v", err)
	}

	taskQueue := make(chan worker.Task, 100)
	eventBus := event.NewBus()
	mockRepo := new(mockScanRepo)

	o := New(Config{
		TemplateLoader: loader,
		TaskQueue:     taskQueue,
		EventBus:      eventBus,
		ScanRepo:      mockRepo,
	})

	return o, taskQueue, tmpDir
}

func TestOrchestrator_New(t *testing.T) {
	taskQueue := make(chan worker.Task, 10)
	o := New(Config{
		TaskQueue: taskQueue,
	})

	if o == nil {
		t.Error("Expected orchestrator to be created")
	}
}

func TestOrchestrator_StartScan(t *testing.T) {
	o, taskQueue, tmpDir := setupTestOrchestrator(t)
	defer os.RemoveAll(tmpDir)
	defer close(taskQueue)

	mockRepo := o.cfg.ScanRepo.(*mockScanRepo)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusRunning).Return(nil)

	err := o.StartScan(1, []string{"http://example.com"}, "")
	if err != nil {
		t.Errorf("StartScan failed: %v", err)
	}

	select {
	case task := <-taskQueue:
		if task.ScanID != 1 {
			t.Errorf("Expected scan ID 1, got %d", task.ScanID)
		}
		if task.Target != "http://example.com" {
			t.Errorf("Expected target http://example.com, got %s", task.Target)
		}
		if task.TemplateID != "CVE-2023-1234" {
			t.Errorf("Expected template ID CVE-2023-1234, got %s", task.TemplateID)
		}
	default:
		t.Error("Expected task to be queued")
	}

	mockRepo.AssertExpectations(t)
}

func TestOrchestrator_StartScan_MultipleTargets(t *testing.T) {
	o, taskQueue, tmpDir := setupTestOrchestrator(t)
	defer os.RemoveAll(tmpDir)
	defer close(taskQueue)

	mockRepo := o.cfg.ScanRepo.(*mockScanRepo)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusRunning).Return(nil)

	targets := []string{"http://example.com", "https://test.com"}
	err := o.StartScan(1, targets, "")
	if err != nil {
		t.Errorf("StartScan failed: %v", err)
	}

	count := 0
	for i := 0; i < 2; i++ {
		select {
		case <-taskQueue:
			count++
		default:
			t.Error("Expected more tasks to be queued")
		}
	}

	if count != 2 {
		t.Errorf("Expected 2 tasks, got %d", count)
	}

	mockRepo.AssertExpectations(t)
}

func TestOrchestrator_StartScan_UpdateStatusError(t *testing.T) {
	o, taskQueue, tmpDir := setupTestOrchestrator(t)
	defer os.RemoveAll(tmpDir)
	defer close(taskQueue)

	mockRepo := o.cfg.ScanRepo.(*mockScanRepo)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusRunning).Return(errors.New("update status failed"))

	err := o.StartScan(1, []string{"http://example.com"}, "")
	if err == nil {
		t.Error("Expected error from UpdateStatus failure")
	}

	mockRepo.AssertExpectations(t)
}

func TestOrchestrator_StartScan_NoTemplates(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "empty-templates-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	loader, err := template.NewLoader(tmpDir)
	if err != nil {
		t.Fatalf("Failed to create loader: %v", err)
	}

	taskQueue := make(chan worker.Task, 100)
	eventBus := event.NewBus()
	mockRepo := new(mockScanRepo)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusRunning).Return(nil)

	o := New(Config{
		TemplateLoader: loader,
		TaskQueue:     taskQueue,
		EventBus:      eventBus,
		ScanRepo:      mockRepo,
	})
	defer close(taskQueue)

	err = o.StartScan(1, []string{"http://example.com"}, "")
	if err != nil {
		t.Errorf("StartScan failed: %v", err)
	}

	select {
	case <-taskQueue:
		t.Error("Expected no tasks to be queued with empty templates")
	default:
	}

	mockRepo.AssertExpectations(t)
}

func TestOrchestrator_StartScan_MultipleTemplates(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "multi-templates-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	contents := []struct {
		id    string
		content string
	}{
		{"CVE-2023-0001", "id: CVE-2023-0001\ninfo:\n  name: Test 1\n  severity: high\n  tags: [web]\n"},
		{"CVE-2023-0002", "id: CVE-2023-0002\ninfo:\n  name: Test 2\n  severity: critical\n  tags: [api]\n"},
		{"CVE-2023-0003", "id: CVE-2023-0003\ninfo:\n  name: Test 3\n  severity: medium\n  engine: headless\n  tags: [headless]\n"},
	}
	for _, c := range contents {
		os.WriteFile(tmpDir+"/"+c.id+".yaml", []byte(c.content), 0644)
	}

	loader, err := template.NewLoader(tmpDir)
	if err != nil {
		t.Fatalf("Failed to create loader: %v", err)
	}

	taskQueue := make(chan worker.Task, 100)
	eventBus := event.NewBus()
	mockRepo := new(mockScanRepo)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusRunning).Return(nil)

	o := New(Config{
		TemplateLoader: loader,
		TaskQueue:     taskQueue,
		EventBus:      eventBus,
		ScanRepo:      mockRepo,
	})
	defer close(taskQueue)

	targets := []string{"http://example.com", "https://test.com"}
	expectedTasks := len(contents) * len(targets)

	err = o.StartScan(1, targets, "")
	if err != nil {
		t.Errorf("StartScan failed: %v", err)
	}

	count := 0
	for i := 0; i < expectedTasks; i++ {
		select {
		case <-taskQueue:
			count++
		default:
			break
		}
	}

	if count != expectedTasks {
		t.Errorf("Expected %d tasks, got %d", expectedTasks, count)
	}

	mockRepo.AssertExpectations(t)
}

func TestOrchestrator_StartScan_StatusUpdatedAfterTasks(t *testing.T) {
	o, taskQueue, tmpDir := setupTestOrchestrator(t)
	defer os.RemoveAll(tmpDir)
	defer close(taskQueue)

	mockRepo := o.cfg.ScanRepo.(*mockScanRepo)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusRunning).Return(nil)

	err := o.StartScan(1, []string{"http://example.com"}, "")
	if err != nil {
		t.Errorf("StartScan failed: %v", err)
	}

	select {
	case task := <-taskQueue:
		if task.ScanID != 1 {
			t.Errorf("Expected scan ID 1, got %d", task.ScanID)
		}
	default:
		t.Error("Expected task to be queued")
	}

	mockRepo.AssertNumberOfCalls(t, "UpdateStatus", 1)
	mockRepo.AssertExpectations(t)
}

func TestOrchestrator_StartScan_MultipleTargetsNoTemplate(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "no-tmpl-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	loader, _ := template.NewLoader(tmpDir)

	taskQueue := make(chan worker.Task, 100)
	eventBus := event.NewBus()
	mockRepo := new(mockScanRepo)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusRunning).Return(nil)

	o := New(Config{
		TemplateLoader: loader,
		TaskQueue:     taskQueue,
		EventBus:      eventBus,
		ScanRepo:      mockRepo,
	})
	defer close(taskQueue)

	err = o.StartScan(1, []string{"http://a.com", "http://b.com", "http://c.com"}, "")
	if err != nil {
		t.Errorf("StartScan failed with no templates: %v", err)
	}

	select {
	case <-taskQueue:
		t.Error("Expected no tasks when no templates exist")
	default:
	}

	mockRepo.AssertExpectations(t)
}

func TestOrchestrator_StartScan_HeadlessTemplateRouting(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "headless-tmpl-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	httpTmpl := "id: http-tmpl\ninfo:\n  name: HTTP Template\n  severity: high\n  tags: [web]\n"
	headlessTmpl := "id: headless-tmpl\ninfo:\n  name: Headless Template\n  severity: medium\n  engine: headless\n  tags: [headless]\n"
	os.WriteFile(tmpDir+"/http-tmpl.yaml", []byte(httpTmpl), 0644)
	os.WriteFile(tmpDir+"/headless-tmpl.yaml", []byte(headlessTmpl), 0644)

	loader, _ := template.NewLoader(tmpDir)

	taskQueue := make(chan worker.Task, 100)
	eventBus := event.NewBus()
	mockRepo := new(mockScanRepo)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusRunning).Return(nil)

	o := New(Config{
		TemplateLoader: loader,
		TaskQueue:     taskQueue,
		EventBus:      eventBus,
		ScanRepo:      mockRepo,
	})
	defer close(taskQueue)

	o.StartScan(1, []string{"http://example.com"}, "")

	tasks := make(map[string]bool)
	for i := 0; i < 2; i++ {
		select {
		case task := <-taskQueue:
			tasks[task.TemplateID] = true
		default:
		}
	}

	if !tasks["http-tmpl"] {
		t.Error("Expected http-tmpl to be queued")
	}
	if !tasks["headless-tmpl"] {
		t.Error("Expected headless-tmpl to be queued")
	}

	mockRepo.AssertExpectations(t)
}

func TestOrchestrator_StartScan_TracksProgress(t *testing.T) {
	o, _, tmpDir := setupTestOrchestrator(t)
	defer os.RemoveAll(tmpDir)

	mockRepo := o.cfg.ScanRepo.(*mockScanRepo)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusRunning).Return(nil)

	o.StartScan(1, []string{"http://a.com", "http://b.com"}, "")

	progress, ok := o.GetProgress(1)
	if !ok {
		t.Fatal("Expected progress to be tracked")
	}
	if progress.TotalTasks != 2 {
		t.Errorf("TotalTasks = %d, want 2", progress.TotalTasks)
	}
	if progress.InProgress != 2 {
		t.Errorf("InProgress = %d, want 2", progress.InProgress)
	}
}

func TestOrchestrator_CompleteTask_AllSuccess(t *testing.T) {
	o, _, tmpDir := setupTestOrchestrator(t)
	defer os.RemoveAll(tmpDir)

	mockRepo := o.cfg.ScanRepo.(*mockScanRepo)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusRunning).Return(nil)
	mockRepo.On("UpdateProgress", mock.Anything, uint(1), mock.AnythingOfType("*entity.ScanProgress")).Return(nil)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusCompleted).Return(nil)

	o.StartScan(1, []string{"http://a.com"}, "")

	err := o.CompleteTask(1, true)
	if err != nil {
		t.Errorf("CompleteTask failed: %v", err)
	}

	_, ok := o.GetProgress(1)
	if ok {
		t.Error("Progress should be cleaned up after all tasks complete")
	}

	mockRepo.AssertExpectations(t)
}

func TestOrchestrator_CompleteTask_PartialProgress(t *testing.T) {
	o, _, tmpDir := setupTestOrchestrator(t)
	defer os.RemoveAll(tmpDir)

	mockRepo := o.cfg.ScanRepo.(*mockScanRepo)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusRunning).Return(nil)
	mockRepo.On("UpdateProgress", mock.Anything, uint(1), mock.AnythingOfType("*entity.ScanProgress")).Return(nil).Times(2)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusCompleted).Return(nil)

	o.StartScan(1, []string{"http://a.com", "http://b.com"}, "")

	err := o.CompleteTask(1, true)
	if err != nil {
		t.Errorf("First CompleteTask failed: %v", err)
	}

	progress, ok := o.GetProgress(1)
	if !ok {
		t.Fatal("Expected progress after partial completion")
	}
	if progress.Completed != 1 {
		t.Errorf("Completed = %d, want 1", progress.Completed)
	}
	if progress.InProgress != 1 {
		t.Errorf("InProgress = %d, want 1", progress.InProgress)
	}

	err = o.CompleteTask(1, true)
	if err != nil {
		t.Errorf("Second CompleteTask failed: %v", err)
	}

	mockRepo.AssertExpectations(t)
}

func TestOrchestrator_CompleteTask_NotFound(t *testing.T) {
	o := New(Config{})
	err := o.CompleteTask(999, true)
	if err == nil {
		t.Error("Expected error for non-existent scan")
	}
}

func TestOrchestrator_CompleteTask_ConcurrentSafe(t *testing.T) {
	o, _, tmpDir := setupTestOrchestrator(t)
	defer os.RemoveAll(tmpDir)

	mockRepo := o.cfg.ScanRepo.(*mockScanRepo)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusRunning).Return(nil)
	mockRepo.On("UpdateProgress", mock.Anything, uint(1), mock.AnythingOfType("*entity.ScanProgress")).Return(nil).Times(5)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusCompleted).Return(nil)

	o.StartScan(1, []string{"http://a.com", "http://b.com", "http://c.com", "http://d.com", "http://e.com"}, "")

	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			o.CompleteTask(1, true)
		}()
	}
	wg.Wait()

	_, ok := o.GetProgress(1)
	if ok {
		t.Error("Progress should be cleaned up after all tasks done")
	}

	mockRepo.AssertExpectations(t)
}

func TestOrchestrator_GetProgress_NotFound(t *testing.T) {
	o := New(Config{})
	_, ok := o.GetProgress(999)
	if ok {
		t.Error("Expected false for non-existent scan")
	}
}

func TestOrchestrator_StartDispatchLoop_Success(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	o, _, tmpDir := setupTestOrchestrator(t)
	defer os.RemoveAll(tmpDir)

	o.cfg.ResultQueue = make(chan worker.Result, 10)

	mockRepo := o.cfg.ScanRepo.(*mockScanRepo)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusRunning).Return(nil)
	mockRepo.On("UpdateProgress", mock.Anything, uint(1), mock.AnythingOfType("*entity.ScanProgress")).Return(nil).Times(2)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusCompleted).Return(nil)

	o.StartScan(1, []string{"http://a.com", "http://b.com"}, "")
	o.StartDispatchLoop(ctx)

	o.cfg.ResultQueue <- worker.Result{ScanID: 1, TaskID: "t1", Error: nil}
	o.cfg.ResultQueue <- worker.Result{ScanID: 1, TaskID: "t2", Error: nil}

	time.Sleep(200 * time.Millisecond)

	_, ok := o.GetProgress(1)
	if ok {
		t.Error("Progress should be cleaned up after all tasks complete")
	}

	mockRepo.AssertExpectations(t)
}

func TestOrchestrator_StartDispatchLoop_Failure(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	o, _, tmpDir := setupTestOrchestrator(t)
	defer os.RemoveAll(tmpDir)

	o.cfg.ResultQueue = make(chan worker.Result, 10)

	mockRepo := o.cfg.ScanRepo.(*mockScanRepo)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusRunning).Return(nil)
	mockRepo.On("UpdateProgress", mock.Anything, uint(1), mock.AnythingOfType("*entity.ScanProgress")).Return(nil).Times(2)
	mockRepo.On("UpdateStatus", mock.Anything, uint(1), entity.ScanStatusCompleted).Return(nil)

	o.StartScan(1, []string{"http://a.com", "http://b.com"}, "")
	o.StartDispatchLoop(ctx)

	o.cfg.ResultQueue <- worker.Result{ScanID: 1, TaskID: "t1", Error: errors.New("connection refused")}
	o.cfg.ResultQueue <- worker.Result{ScanID: 1, TaskID: "t2", Error: errors.New("timeout")}

	time.Sleep(200 * time.Millisecond)

	_, ok := o.GetProgress(1)
	if ok {
		t.Error("Progress should be cleaned up after all failures")
	}

	mockRepo.AssertExpectations(t)
}

func TestOrchestrator_StartDispatchLoop_ContextCancellation(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())

	o, _, tmpDir := setupTestOrchestrator(t)
	defer os.RemoveAll(tmpDir)

	o.cfg.ResultQueue = make(chan worker.Result, 10)
	o.StartDispatchLoop(ctx)

	cancel()

	time.Sleep(50 * time.Millisecond)
}

func TestOrchestrator_StartDispatchLoop_NilResultQueue(t *testing.T) {
	o := New(Config{})
	o.StartDispatchLoop(context.Background())
}

func TestOrchestrator_StartDispatchLoop_ChannelClose(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	o, _, tmpDir := setupTestOrchestrator(t)
	defer os.RemoveAll(tmpDir)

	resultQueue := make(chan worker.Result, 10)
	o.cfg.ResultQueue = resultQueue
	o.StartDispatchLoop(ctx)

	close(resultQueue)

	time.Sleep(50 * time.Millisecond)
}
