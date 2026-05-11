package orchestrator

import (
	"context"
	"fmt"
	"log"
	"sync"

	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/domain/entity"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/domain/repository"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/event"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/messaging"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/worker"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/template"
	"gorm.io/gorm"
)

type Config struct {
	DB              *gorm.DB
	TemplateLoader  *template.Loader
	TaskQueue       chan worker.Task
	EventBus        *event.Bus
	ScanRepo        repository.ScanRepository
	FindingRepo     repository.FindingRepository
	TaskPublisher   *messaging.TaskPublisher
	MessagingConfig *ConfigMessaging
}

type ConfigMessaging struct {
	RabbitMQ messaging.Config
}

type Orchestrator struct {
	cfg   Config
	tasks map[uint]*entity.ScanProgress
	mu    sync.Mutex
}

func New(cfg Config) *Orchestrator {
	return &Orchestrator{
		cfg:   cfg,
		tasks: make(map[uint]*entity.ScanProgress),
	}
}

func (o *Orchestrator) StartScan(scanID uint, targets []string, templateSelectors string) error {
	templates, err := o.cfg.TemplateLoader.List()
	if err != nil {
		return fmt.Errorf("failed to list templates: %w", err)
	}

	ctx := context.Background()

	totalTasks := len(targets) * len(templates)

	o.mu.Lock()
	o.tasks[scanID] = &entity.ScanProgress{
		TotalTasks: totalTasks,
		Completed:  0,
		Failed:     0,
		InProgress: totalTasks,
	}
	o.mu.Unlock()

	if o.cfg.TaskPublisher != nil {
		for _, target := range targets {
			for _, tmpl := range templates {
				var pubErr error
				switch tmpl.EngineType() {
				case "headless":
					pubErr = o.cfg.TaskPublisher.PublishHeadless(ctx, scanID, target, tmpl.ID)
				default:
					pubErr = o.cfg.TaskPublisher.PublishHTTP(ctx, scanID, target, tmpl.ID)
				}
				if pubErr != nil {
					log.Printf("Failed to publish task for %s/%s: %v", target, tmpl.ID, pubErr)
					continue
				}
			}
		}
	} else if o.cfg.TaskQueue != nil {
		for _, target := range targets {
			for _, tmpl := range templates {
				task := worker.Task{
					ID:         fmt.Sprintf("%d-%s-%s", scanID, target, tmpl.ID),
					ScanID:     scanID,
					Target:     target,
					TemplateID: tmpl.ID,
					Template:   tmpl,
				}
				o.cfg.TaskQueue <- task
			}
		}
	}

	if err := o.cfg.ScanRepo.UpdateStatus(ctx, scanID, entity.ScanStatusRunning); err != nil {
		return fmt.Errorf("failed to update scan status: %w", err)
	}
	return nil
}

func (o *Orchestrator) CompleteTask(scanID uint, success bool) error {
	o.mu.Lock()
	progress, ok := o.tasks[scanID]
	if !ok {
		o.mu.Unlock()
		return fmt.Errorf("scan %d not found in progress tracker", scanID)
	}

	if success {
		progress.Completed++
	} else {
		progress.Failed++
	}
	progress.InProgress--
	allDone := progress.Completed+progress.Failed >= progress.TotalTasks
	if allDone {
		delete(o.tasks, scanID)
	}
	progressCopy := *progress
	o.mu.Unlock()

	ctx := context.Background()
	if err := o.cfg.ScanRepo.UpdateProgress(ctx, scanID, &progressCopy); err != nil {
		return fmt.Errorf("failed to update progress: %w", err)
	}

	if allDone {
		if err := o.cfg.ScanRepo.UpdateStatus(ctx, scanID, entity.ScanStatusCompleted); err != nil {
			return fmt.Errorf("failed to update scan status: %w", err)
		}
	}

	return nil
}

func (o *Orchestrator) GetProgress(scanID uint) (*entity.ScanProgress, bool) {
	o.mu.Lock()
	defer o.mu.Unlock()
	progress, ok := o.tasks[scanID]
	if !ok {
		return nil, false
	}
	copied := *progress
	return &copied, true
}
