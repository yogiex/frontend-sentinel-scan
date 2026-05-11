package worker

import (
	"context"
	"fmt"
	"log"
	"sync"

	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/authscan"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/event"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/messaging"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/scanner"
)

type Pool struct {
	size           int
	taskQueue      chan Task
	resultQueue    chan Result
	eventBus       *event.Bus
	eventPub       *messaging.EventPublisher
	wg             sync.WaitGroup
	cancel         context.CancelFunc
	ctx            context.Context
	useRabbitMQ    bool
	httpEngine     *scanner.HTTPEngine
	headlessEngine *scanner.HeadlessEngine
	sessionManager *authscan.SessionManager
}

func NewPool(ctx context.Context, size int, taskQueue chan Task, resultQueue chan Result, eventBus *event.Bus) *Pool {
	ctx, cancel := context.WithCancel(ctx)
	return &Pool{
		size:        size,
		taskQueue:   taskQueue,
		resultQueue: resultQueue,
		eventBus:    eventBus,
		cancel:      cancel,
		ctx:         ctx,
	}
}

func NewRabbitMQPool(ctx context.Context, size int, eventPub *messaging.EventPublisher) *Pool {
	ctx, cancel := context.WithCancel(ctx)
	return &Pool{
		size:        size,
		eventPub:    eventPub,
		cancel:      cancel,
		ctx:         ctx,
		useRabbitMQ: true,
	}
}

func (p *Pool) WithEngines(httpEng *scanner.HTTPEngine, headlessEng *scanner.HeadlessEngine) *Pool {
	p.httpEngine = httpEng
	p.headlessEngine = headlessEng
	return p
}

func (p *Pool) WithSessionManager(sm *authscan.SessionManager) *Pool {
	p.sessionManager = sm
	return p
}

func (p *Pool) Start() {
	if p.useRabbitMQ {
		return
	}
	for i := 0; i < p.size; i++ {
		p.wg.Add(1)
		go p.worker(i)
	}
}

func (p *Pool) worker(id int) {
	defer p.wg.Done()
	for {
		select {
		case <-p.ctx.Done():
			return
		case task, ok := <-p.taskQueue:
			if !ok {
				return
			}
			result := p.executeTask(task)
			select {
			case p.resultQueue <- result:
				if result.Finding != nil && result.Finding.Matched {
					p.eventBus.PublishFinding(fmt.Sprintf("%d", task.ScanID), result.Finding)
				}
			case <-p.ctx.Done():
				return
			}
		}
	}
}

func (p *Pool) HandleTask(ctx context.Context, msg messaging.TaskMessage) messaging.TaskResult {
	session := p.resolveSession(msg.ScanID)
	scanTask := scanner.Task{
		ScanID:     msg.ScanID,
		Target:     msg.Target,
		TemplateID: msg.TemplateID,
		Engine:     scanner.EngineType(msg.Engine),
		Session:    session,
	}

	var result *scanner.Result

	switch msg.Engine {
	case "headless":
		if p.headlessEngine != nil {
			result = p.headlessEngine.Execute(ctx, scanTask)
		} else {
			log.Printf("Headless engine not available for task %s/%s", msg.Target, msg.TemplateID)
			result = &scanner.Result{
				Finding: &scanner.Finding{Target: msg.Target, TemplateID: msg.TemplateID, Matched: false},
				Error:   fmt.Errorf("headless engine not available"),
			}
		}
	default:
		if p.httpEngine != nil {
			result = p.httpEngine.Execute(ctx, scanTask)
		} else {
			result = &scanner.Result{
				Finding: &scanner.Finding{Target: msg.Target, TemplateID: msg.TemplateID, Matched: false},
			}
		}
	}

	status := messaging.TaskStatusSuccess
	if result.Error != nil {
		status = messaging.TaskStatusRetry
	}

	if p.eventPub != nil && result.Finding != nil {
		p.eventPub.PublishProgress(ctx, msg.ScanID, 0, 0)
		if result.Finding.Matched {
			findingPayload := &messaging.FindingPayload{
				Target:     result.Finding.Target,
				TemplateID: result.Finding.TemplateID,
				Matched:    result.Finding.Matched,
				Severity:   result.Finding.Severity,
				Details:    result.Finding.Details,
			}
			p.eventPub.PublishFinding(ctx, msg.ScanID, findingPayload)
		}
	}

	findingPayload := &messaging.FindingPayload{
		Target:     msg.Target,
		TemplateID: msg.TemplateID,
		Matched:    false,
		Severity:   "info",
	}
	if result.Finding != nil {
		findingPayload.Matched = result.Finding.Matched
		findingPayload.Severity = result.Finding.Severity
		findingPayload.Details = result.Finding.Details
	}

	return messaging.TaskResult{
		Status:  status,
		Finding: findingPayload,
		Error:   result.Error,
	}
}

func (p *Pool) executeTask(task Task) Result {
	if task.Session == nil && p.sessionManager != nil {
		task.Session = p.resolveSession(task.ScanID)
	}

	if p.httpEngine == nil {
		return Result{
			TaskID: task.ID,
			ScanID: task.ScanID,
			Finding: &Finding{
				Target:     task.Target,
				TemplateID: task.TemplateID,
				Matched:    false,
			},
		}
	}

	scanTask := scanner.Task{
		ScanID:     task.ScanID,
		Target:     task.Target,
		TemplateID: task.TemplateID,
		Engine:     scanner.EngineHTTP,
		Session:    task.Session,
	}
	result := p.httpEngine.Execute(context.Background(), scanTask)
	workerFinding := &Finding{
		Target:     task.Target,
		TemplateID: task.TemplateID,
		Matched:    false,
	}
	if result.Finding != nil {
		workerFinding.Matched = result.Finding.Matched
		workerFinding.Severity = result.Finding.Severity
		workerFinding.Details = result.Finding.Details
	}
	return Result{
		TaskID:  task.ID,
		ScanID:  task.ScanID,
		Finding: workerFinding,
		Error:   result.Error,
	}
}

func (p *Pool) resolveSession(scanID uint) *authscan.Session {
	if p.sessionManager == nil {
		return nil
	}
	return p.sessionManager.GetSession(scanID)
}

func (p *Pool) Stop() {
	p.cancel()
	p.wg.Wait()
}
