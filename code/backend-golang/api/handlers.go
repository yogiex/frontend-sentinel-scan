package api

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/domain/entity"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/domain/repository"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/authscan"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/messaging"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/report"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/orchestrator"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/pkg/errors"
)

// ScanServiceInterface defines the interface for scan operations.
type ScanServiceInterface interface {
	StartScan(ctx context.Context, createdBy uint, targets []string, filter entity.TemplateFilter) (*entity.ScanJob, error)
	GetScan(ctx context.Context, id uint) (*entity.ScanJob, error)
	CancelScan(ctx context.Context, id uint) error
	GetProgress(ctx context.Context, id uint) (*entity.ScanProgress, error)
	GetResults(ctx context.Context, scanID uint) ([]*entity.Finding, error)
}

// TicketServiceInterface defines the interface for ticket operations.
type TicketServiceInterface interface {
	CreateTicket(ctx context.Context, findingID uint, title, description, priority string, createdBy uint) (*entity.Ticket, error)
	UpdateStatus(ctx context.Context, id uint, status entity.TicketStatus) error
	AssignTicket(ctx context.Context, ticketID, userID uint) error
	GetTickets(ctx context.Context, filter repository.TicketFilter) ([]*entity.Ticket, error)
}

// AuthServiceInterface defines the interface for auth operations.
type AuthServiceInterface interface {
	Authenticate(ctx context.Context, username, password string) (*entity.User, error)
	HasPermission(ctx context.Context, userID uint, perm entity.Permission) (bool, error)
	GetUserRoles(ctx context.Context, userID uint) ([]entity.Role, error)
}

// AuthCredentialServiceInterface defines the interface for auth credential CRUD.
type AuthCredentialServiceInterface interface {
	Create(ctx context.Context, userID uint, name string, method entity.AuthMethod, config map[string]interface{}, loginURL, verifyURL, verifyPattern string) (*entity.AuthCredential, error)
	GetByID(ctx context.Context, id uint) (*entity.AuthCredential, error)
	ListByUserID(ctx context.Context, userID uint) ([]*entity.AuthCredential, error)
	Update(ctx context.Context, id uint, updates map[string]interface{}) (*entity.AuthCredential, error)
	Delete(ctx context.Context, id uint) error
	UpdateLastVerified(ctx context.Context, id uint) error
	Sanitize(cred *entity.AuthCredential)
}

// AuthCredentialVerifyResponse represents the verification response.
type AuthCredentialVerifyResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Cookies int    `json:"cookies"`
	Headers int    `json:"headers"`
}

// ReportServiceInterface defines the interface for report operations.
type ReportServiceInterface interface {
	GetReportData(ctx context.Context, scanID uint) (*entity.ScanReportData, error)
}

// Handler handles HTTP requests using application services.
type Handler struct {
	scanService          ScanServiceInterface
	ticketService        TicketServiceInterface
	authService          AuthServiceInterface
	authCredentialService AuthCredentialServiceInterface
	orchestrator        *orchestrator.Orchestrator
	eventConsumer       *messaging.EventConsumer
	sessionManager      *authscan.SessionManager
	reportService       ReportServiceInterface
	reportGenerator     *report.Generator
}

// NewHandler creates a new Handler with application services.
func NewHandler(
	scanService ScanServiceInterface,
	ticketService TicketServiceInterface,
	authService AuthServiceInterface,
	authCredentialService AuthCredentialServiceInterface,
	orchestrator *orchestrator.Orchestrator,
) *Handler {
	return &Handler{
		scanService:          scanService,
		ticketService:        ticketService,
		authService:          authService,
		authCredentialService: authCredentialService,
		orchestrator:         orchestrator,
	}
}

// WithReportService sets the report service and generator for report endpoints.
func (h *Handler) WithReportService(rs ReportServiceInterface, rg *report.Generator) *Handler {
	h.reportService = rs
	h.reportGenerator = rg
	return h
}

// WithSessionManager sets the session manager for authenticated scanning.
func (h *Handler) WithSessionManager(sm *authscan.SessionManager) *Handler {
	h.sessionManager = sm
	return h
}

// WithEventConsumer sets the event consumer for RabbitMQ-based WebSocket streaming.
func (h *Handler) WithEventConsumer(ec *messaging.EventConsumer) *Handler {
	h.eventConsumer = ec
	return h
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string `json:"status" example:"healthy"`
	Version   string `json:"version,omitempty" example:"1.0.0"`
	Timestamp string `json:"timestamp" example:"2026-05-11T10:00:00Z"`
}

// CreateScanRequest represents the request body for creating a new scan.
type CreateScanRequest struct {
	Targets           []string `json:"targets" example:"http://example.com,https://test.com"`
	TemplateSelectors string   `json:"template_selectors" example:"{\"severity\":[\"high\",\"critical\"]}"`
	AuthCredentialID  *uint    `json:"auth_credential_id,omitempty" example:"1"`
}

// HealthHandler handles health check requests
// @Summary      Health check
// @Description  Returns the health status of the API server
// @Tags         System
// @Produce      json
// @Success      200 {object} HealthResponse
// @Router       /health [get]
func (h *Handler) HealthHandler(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}
	
	// TODO: Add version from build flags
	// response.Version = Version
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// CreateScan creates and starts a new vulnerability scan
// @Summary      Create and start a vulnerability scan
// @Description  Initiates a new scan against specified targets using Nuclei templates.
// @Tags         Scans
// @Accept       json
// @Produce      json
// @Param        request body CreateScanRequest true "Scan targets and template filters"
// @Success      201 {object} entity.ScanJob
// @Failure      400 {object} errors.AppError
// @Failure      500 {object} errors.AppError
// @Security     BearerAuth
// @Router       /scans [post]
func (h *Handler) CreateScan(w http.ResponseWriter, r *http.Request) {
	var req CreateScanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if len(req.Targets) == 0 {
		http.Error(w, "Targets are required", http.StatusBadRequest)
		return
	}

	// Get user ID from context (set by auth middleware)
	createdBy := uint(1) // TODO: extract from JWT context

	scan, err := h.scanService.StartScan(r.Context(), createdBy, req.Targets, entity.TemplateFilter{})
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			http.Error(w, appErr.Message, appErr.Status)
		} else {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	if req.AuthCredentialID != nil {
		scan.AuthCredentialID = req.AuthCredentialID

		// Start authenticated session BEFORE orchestrator dispatch
		if h.sessionManager != nil {
			cred, credErr := h.authCredentialService.GetByID(r.Context(), *req.AuthCredentialID)
			if credErr == nil {
				_, sessErr := h.sessionManager.StartSession(r.Context(), scan.ID, cred)
				if sessErr != nil {
					log.Printf("[scan] failed to start auth session for scan %d: %v — scan will proceed unauthenticated", scan.ID, sessErr)
				}
			}
		}
	}

	// Start scan in orchestrator (tasks will pick up session from sessionManager)
	if h.orchestrator != nil {
		if err := h.orchestrator.StartScan(scan.ID, req.Targets, req.TemplateSelectors); err != nil {
			http.Error(w, "Failed to start scan", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(scan)
}

// GetScan returns scan status and details
// @Summary      Get scan status and details
// @Description  Retrieves the current status and metadata of a scan job by ID.
// @Tags         Scans
// @Produce      json
// @Param        id path int true "Scan ID"
// @Success      200 {object} entity.ScanJob
// @Failure      404 {object} errors.AppError
// @Failure      500 {object} errors.AppError
// @Security     BearerAuth
// @Router       /scans/{id} [get]
func (h *Handler) GetScan(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid scan ID", http.StatusBadRequest)
		return
	}

	scan, err := h.scanService.GetScan(r.Context(), uint(id))
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			http.Error(w, appErr.Message, appErr.Status)
		} else {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(scan)
}

// GetScanResults returns all findings for a scan
// @Summary      Get scan findings
// @Description  Retrieves all vulnerability findings detected during a scan.
// @Tags         Scans
// @Produce      json
// @Param        id path int true "Scan ID"
// @Success      200 {array} entity.Finding
// @Failure      404 {object} errors.AppError
// @Failure      500 {object} errors.AppError
// @Security     BearerAuth
// @Router       /scans/{id}/results [get]
func (h *Handler) GetScanResults(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid scan ID", http.StatusBadRequest)
		return
	}

	findings, err := h.scanService.GetResults(r.Context(), uint(id))
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			http.Error(w, appErr.Message, appErr.Status)
		} else {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(findings)
}

// ListTemplates lists available Nuclei templates
// @Summary      List available Nuclei templates
// @Description  Returns a list of available Nuclei templates, optionally filtered by severity or tags.
// @Tags         Templates
// @Produce      json
// @Param        severity query string false "Filter by severity (comma-separated: info,low,medium,high,critical)"
// @Param        tags query string false "Filter by tags (comma-separated)"
// @Success      200 {array} string
// @Security     BearerAuth
// @Router       /templates [get]
func (h *Handler) ListTemplates(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode([]string{})
}

// GetTemplate returns template details
// @Summary      Get template details
// @Description  Returns details of a specific Nuclei template by ID.
// @Tags         Templates
// @Produce      json
// @Param        id path string true "Template ID"
// @Success      200 {object} object
// @Security     BearerAuth
// @Router       /templates/{id} [get]
func (h *Handler) GetTemplate(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{})
}
