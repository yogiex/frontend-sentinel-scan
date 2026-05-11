// main.go

// @title           SentinelScan API
// @version         1.0
// @description     High-performance vulnerability scanning engine powered by Nuclei templates.
// @termsOfService  https://github.com/inkubasi-btp-cybersecurity

// @contact.name   SentinelScan Team
// @contact.email  support@sentinelscan.dev

// @license.name  MIT
// @license.url   https://opensource.org/licenses/MIT

// @host      localhost:8080
// @BasePath  /api

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/api"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/config"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/application"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/domain/repository"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/authscan"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/database/postgres"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/event"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/messaging"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/report"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/scanner"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/worker"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/orchestrator"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/template"
	gormpostgres "gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Database
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host, cfg.Database.Port, cfg.Database.User,
		cfg.Database.Password, cfg.Database.DBName, cfg.Database.SSLMode)
	db, err := gorm.Open(gormpostgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	if err := db.AutoMigrate(
		&postgres.ScanJob{}, &postgres.Finding{}, &postgres.Ticket{},
		&postgres.User{}, &postgres.AuditLog{}, &postgres.AuthCredential{},
		&postgres.AuthSessionModel{},
	); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Repositories
	var scanRepo repository.ScanRepository = postgres.NewScanRepository(db)
	findingRepo := postgres.NewFindingRepository(db)
	ticketRepo := postgres.NewTicketRepository(db)
	userRepo := postgres.NewUserRepository(db)
	_ = postgres.NewAuditLogRepository(db)

	// Auth credential repository & service
	authCredRepo := postgres.NewAuthCredentialRepository(db)
	authCredService := application.NewAuthCredentialService(authCredRepo)

	// Application services
	scanService := application.NewScanService(scanRepo, findingRepo)
	ticketService := application.NewTicketService(ticketRepo, findingRepo, userRepo)
	authService := application.NewAuthService(userRepo)

	// Session manager for authenticated scanning
	sessionManager := authscan.NewSessionManager()

	// Apply session manager to worker pools

	// Template loader
	templateLoader, err := template.NewLoader(cfg.Template.Dir)
	if err != nil {
		log.Fatalf("Failed to initialize template loader: %v", err)
	}

	// Event bus (in-memory fallback)
	eventBus := event.NewBus()

	// Scanner engines
	engineCfg := scanner.EngineConfig{
		ChromiumPath: cfg.Scanner.ChromiumPath,
		TimeoutSec:   cfg.Scanner.TimeoutSec,
	}
	httpEngine := scanner.NewHTTPEngine(engineCfg)
	var headlessEngine *scanner.HeadlessEngine
	if cfg.Scanner.HeadlessSize > 0 {
		headlessEngine = scanner.NewHeadlessEngine(engineCfg)
		log.Printf("Headless scanner engine initialized (chromium: %s, timeout: %ds)",
			cfg.Scanner.ChromiumPath, cfg.Scanner.TimeoutSec)
	}

	// Try RabbitMQ; fall back to in-memory if unavailable
	mqConfig := messaging.Config{
		Host:              cfg.RabbitMQ.Host,
		Port:              cfg.RabbitMQ.Port,
		User:              cfg.RabbitMQ.User,
		Password:          cfg.RabbitMQ.Password,
		VHost:             cfg.RabbitMQ.VHost,
		PrefetchCount:     cfg.RabbitMQ.PrefetchCount,
		Heartbeat:         cfg.RabbitMQ.Heartbeat,
		ConnectionTimeout: cfg.RabbitMQ.ConnectionTimeout,
		MaxRetries:        cfg.RabbitMQ.MaxRetries,
		RetryDelayMS:      cfg.RabbitMQ.RetryDelayMS,
	}

	var mqConn *messaging.Connection
	var taskPublisher *messaging.TaskPublisher
	var eventPublisher *messaging.EventPublisher
	var eventConsumer *messaging.EventConsumer
	useRabbitMQ := false

	mqConn = messaging.NewConnection(mqConfig)
	if err := mqConn.Connect(); err != nil {
		log.Printf("RabbitMQ not available (%v), falling back to in-memory channels", err)
		mqConn = nil
	} else {
		log.Println("RabbitMQ connected successfully")
		useRabbitMQ = true
		taskPublisher = messaging.NewTaskPublisher(mqConn)
		eventPublisher = messaging.NewEventPublisher(mqConn)
		eventConsumer = messaging.NewEventConsumer(mqConn)

		// HTTP workers pool
		httpPool := worker.NewRabbitMQPool(context.Background(), cfg.Worker.Size, eventPublisher)
		httpPool.WithEngines(httpEngine, nil).WithSessionManager(sessionManager)

		if cfg.Worker.AutoScale.Enabled {
			httpScaler := worker.NewAutoScaler(
				messaging.QueueTasksHTTP, "http",
				mqConn, httpPool, taskPublisher, mqConfig,
				worker.AutoScaleConfig{
					Enabled:            true,
					MinWorkers:         cfg.Worker.AutoScale.MinWorkers,
					MaxWorkers:         cfg.Worker.AutoScale.MaxWorkers,
					ScaleUpThreshold:   cfg.Worker.AutoScale.ScaleUpThreshold,
					ScaleDownThreshold: cfg.Worker.AutoScale.ScaleDownThreshold,
					ScaleUpBy:          cfg.Worker.AutoScale.ScaleUpBy,
					ScaleDownBy:        cfg.Worker.AutoScale.ScaleDownBy,
					PollInterval:       time.Duration(cfg.Worker.AutoScale.PollIntervalSec) * time.Second,
					Cooldown:           time.Duration(cfg.Worker.AutoScale.CooldownSec) * time.Second,
				},
			)
			httpScaler.Start()
			defer httpScaler.Stop()
		} else {
			httpConsumer := messaging.NewTaskConsumer(mqConn, httpPool, taskPublisher, mqConfig, messaging.QueueTasksHTTP)
			for i := 0; i < cfg.Worker.Size; i++ {
				go func(id int) {
					if err := httpConsumer.Consume(context.Background(), id); err != nil {
						log.Printf("HTTP worker %d stopped: %v", id, err)
					}
				}(i)
			}
			log.Printf("Started %d HTTP workers", cfg.Worker.Size)
		}

		// Headless workers pool (separate, smaller)
		if headlessEngine != nil {
			headlessPool := worker.NewRabbitMQPool(context.Background(), cfg.Scanner.HeadlessSize, eventPublisher)
			headlessPool.WithEngines(httpEngine, headlessEngine).WithSessionManager(sessionManager)

			if cfg.Worker.AutoScale.Enabled {
				headlessScaler := worker.NewAutoScaler(
					messaging.QueueTasksHeadless, "headless",
					mqConn, headlessPool, taskPublisher, mqConfig,
					worker.AutoScaleConfig{
						Enabled:            true,
						MinWorkers:         cfg.Worker.AutoScale.MinWorkers,
						MaxWorkers:         cfg.Worker.AutoScale.MaxWorkers,
						ScaleUpThreshold:   cfg.Worker.AutoScale.ScaleUpThreshold,
						ScaleDownThreshold: cfg.Worker.AutoScale.ScaleDownThreshold,
						ScaleUpBy:          cfg.Worker.AutoScale.ScaleUpBy,
						ScaleDownBy:        cfg.Worker.AutoScale.ScaleDownBy,
						PollInterval:       time.Duration(cfg.Worker.AutoScale.PollIntervalSec) * time.Second,
						Cooldown:           time.Duration(cfg.Worker.AutoScale.CooldownSec) * time.Second,
					},
				)
				headlessScaler.Start()
				defer headlessScaler.Stop()
			} else {
				headlessConsumer := messaging.NewTaskConsumer(mqConn, headlessPool, taskPublisher, mqConfig, messaging.QueueTasksHeadless)
				for i := 0; i < cfg.Scanner.HeadlessSize; i++ {
					go func(id int) {
						if err := headlessConsumer.Consume(context.Background(), id); err != nil {
							log.Printf("Headless worker %d stopped: %v", id, err)
						}
					}(i)
				}
				log.Printf("Started %d headless workers", cfg.Scanner.HeadlessSize)
			}
		}
	}

	// Orchestrator
	orchCfg := orchestrator.Config{
		DB:              db,
		TemplateLoader:  templateLoader,
		EventBus:        eventBus,
		ScanRepo:        scanRepo,
		FindingRepo:     findingRepo,
		TaskPublisher:   taskPublisher,
		MessagingConfig: &orchestrator.ConfigMessaging{RabbitMQ: mqConfig},
	}

	if !useRabbitMQ {
		taskQueue := make(chan worker.Task, 1000)
		resultQueue := make(chan worker.Result, 1000)
		orchCfg.TaskQueue = taskQueue
		orchCfg.ResultQueue = resultQueue

		pool := worker.NewPool(context.Background(), cfg.Worker.Size, taskQueue, resultQueue, eventBus)
		pool.WithEngines(httpEngine, headlessEngine).WithSessionManager(sessionManager)
		pool.Start()
		log.Printf("Started %d in-memory workers", cfg.Worker.Size)
	}

	orch := orchestrator.New(orchCfg)
	orch.StartDispatchLoop(context.Background())

	// Report service
	reportService := application.NewReportService(scanRepo, findingRepo)
	pdfGen := report.NewPDFGenerator(cfg.Scanner.ChromiumPath)
	reportGenerator := report.NewGenerator(reportService, pdfGen, cfg.Report.OutputDir)

	// API handler
	handler := api.NewHandler(scanService, ticketService, authService, authCredService, orch)
	handler.WithSessionManager(sessionManager)
	handler.WithReportService(reportService, reportGenerator)
	if useRabbitMQ {
		handler.WithEventConsumer(eventConsumer)
	}
	router := api.NewRouter(handler, eventBus)

	// Start server
	addr := fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)
	log.Printf("Starting SentinelScan on %s", addr)
	log.Printf("Engines: HTTP=true Headless=%v Workers=%d HeadlessWorkers=%d",
		headlessEngine != nil, cfg.Worker.Size, cfg.Scanner.HeadlessSize)

	if mqConn != nil {
		defer mqConn.Close()
	}

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
