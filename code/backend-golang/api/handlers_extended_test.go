package api

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gorilla/mux"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/domain/entity"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/domain/repository"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/authscan"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/pkg/errors"
	"github.com/stretchr/testify/mock"
)

type mockScanService struct{ mock.Mock }
type mockTicketService struct{ mock.Mock }
type mockAuthService struct{ mock.Mock }
type mockAuthCredentialService struct{ mock.Mock }
type mockReportService struct{ mock.Mock }

func (m *mockScanService) StartScan(ctx context.Context, createdBy uint, targets []string, filter entity.TemplateFilter) (*entity.ScanJob, error) {
	args := m.Called(ctx, createdBy, targets, filter)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.ScanJob), args.Error(1)
}
func (m *mockScanService) GetScan(ctx context.Context, id uint) (*entity.ScanJob, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.ScanJob), args.Error(1)
}
func (m *mockScanService) CancelScan(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}
func (m *mockScanService) GetProgress(ctx context.Context, id uint) (*entity.ScanProgress, error) {
	args := m.Called(ctx, id)
	return nil, args.Error(1)
}
func (m *mockScanService) GetResults(ctx context.Context, scanID uint) ([]*entity.Finding, error) {
	args := m.Called(ctx, scanID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entity.Finding), args.Error(1)
}

func (m *mockTicketService) CreateTicket(ctx context.Context, findingID uint, title, description, priority string, createdBy uint) (*entity.Ticket, error) {
	args := m.Called(ctx, findingID, title, description, priority, createdBy)
	return args.Get(0).(*entity.Ticket), args.Error(1)
}
func (m *mockTicketService) UpdateStatus(ctx context.Context, id uint, status entity.TicketStatus) error {
	return m.Called(ctx, id, status).Error(0)
}
func (m *mockTicketService) AssignTicket(ctx context.Context, ticketID, userID uint) error {
	return m.Called(ctx, ticketID, userID).Error(0)
}
func (m *mockTicketService) GetTickets(ctx context.Context, filter repository.TicketFilter) ([]*entity.Ticket, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]*entity.Ticket), args.Error(1)
}

func (m *mockAuthService) Authenticate(ctx context.Context, username, password string) (*entity.User, error) {
	args := m.Called(ctx, username, password)
	return args.Get(0).(*entity.User), args.Error(1)
}
func (m *mockAuthService) HasPermission(ctx context.Context, userID uint, perm entity.Permission) (bool, error) {
	args := m.Called(ctx, userID, perm)
	return args.Bool(0), args.Error(1)
}
func (m *mockAuthService) GetUserRoles(ctx context.Context, userID uint) ([]entity.Role, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).([]entity.Role), args.Error(1)
}

func (m *mockAuthCredentialService) Create(ctx context.Context, userID uint, name string, method entity.AuthMethod, config map[string]interface{}, loginURL, verifyURL, verifyPattern string) (*entity.AuthCredential, error) {
	args := m.Called(ctx, userID, name, method, config, loginURL, verifyURL, verifyPattern)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.AuthCredential), args.Error(1)
}
func (m *mockAuthCredentialService) GetByID(ctx context.Context, id uint) (*entity.AuthCredential, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.AuthCredential), args.Error(1)
}
func (m *mockAuthCredentialService) ListByUserID(ctx context.Context, userID uint) ([]*entity.AuthCredential, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).([]*entity.AuthCredential), args.Error(1)
}
func (m *mockAuthCredentialService) Update(ctx context.Context, id uint, updates map[string]interface{}) (*entity.AuthCredential, error) {
	args := m.Called(ctx, id, updates)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.AuthCredential), args.Error(1)
}
func (m *mockAuthCredentialService) Delete(ctx context.Context, id uint) error {
	return m.Called(ctx, id).Error(0)
}
func (m *mockAuthCredentialService) UpdateLastVerified(ctx context.Context, id uint) error {
	return m.Called(ctx, id).Error(0)
}
func (m *mockAuthCredentialService) Sanitize(cred *entity.AuthCredential) {}

func (m *mockReportService) GetReportData(ctx context.Context, scanID uint) (*entity.ScanReportData, error) {
	args := m.Called(ctx, scanID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.ScanReportData), args.Error(1)
}

func newRouterWithHandler(h *Handler) *mux.Router {
	r := mux.NewRouter()
	r.HandleFunc("/api/scans", h.CreateScan).Methods("POST")
	r.HandleFunc("/api/scans/{id}", h.GetScan).Methods("GET")
	r.HandleFunc("/api/scans/{id}/results", h.GetScanResults).Methods("GET")
	r.HandleFunc("/api/auth-credentials", h.CreateAuthCredential).Methods("POST")
	r.HandleFunc("/api/auth-credentials", h.ListAuthCredentials).Methods("GET")
	r.HandleFunc("/api/auth-credentials/{id}", h.GetAuthCredential).Methods("GET")
	r.HandleFunc("/api/auth-credentials/{id}", h.UpdateAuthCredential).Methods("PUT")
	r.HandleFunc("/api/auth-credentials/{id}", h.DeleteAuthCredential).Methods("DELETE")
	r.HandleFunc("/api/auth-credentials/{id}/verify", h.VerifyAuthCredential).Methods("POST")
	r.HandleFunc("/api/scans/{id}/report-data", h.GetReportData).Methods("GET")
	return r
}

func TestCreateScan(t *testing.T) {
	mockSvc := new(mockScanService)
	h := &Handler{scanService: mockSvc}

	t.Run("success", func(t *testing.T) {
		body := `{"targets":["http://example.com"]}`
		req := httptest.NewRequest("POST", "/api/scans", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")

		mockSvc.On("StartScan", mock.Anything, uint(1), []string{"http://example.com"}, mock.Anything).
			Return(&entity.ScanJob{ID: 1, Status: entity.ScanStatusPending}, nil).Once()

		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusAccepted {
			t.Errorf("expected status %d, got %d", http.StatusAccepted, w.Code)
		}
		mockSvc.AssertExpectations(t)
	})

	t.Run("invalid body", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/scans", bytes.NewBufferString("not-json"))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	t.Run("missing targets", func(t *testing.T) {
		body := `{"targets":[]}`
		req := httptest.NewRequest("POST", "/api/scans", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})
}

func TestGetScan(t *testing.T) {
	mockSvc := new(mockScanService)
	h := &Handler{scanService: mockSvc}

	t.Run("success", func(t *testing.T) {
		mockSvc.On("GetScan", mock.Anything, uint(1)).
			Return(&entity.ScanJob{ID: 1, Status: entity.ScanStatusCompleted}, nil).Once()

		req := httptest.NewRequest("GET", "/api/scans/1", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
		}
		mockSvc.AssertExpectations(t)
	})

	t.Run("invalid id", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/scans/abc", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	t.Run("not found", func(t *testing.T) {
		mockSvc.On("GetScan", mock.Anything, uint(999)).
			Return(nil, errors.NewAppError("NOT_FOUND", "not found", 404)).Once()

		req := httptest.NewRequest("GET", "/api/scans/999", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected status %d, got %d", http.StatusNotFound, w.Code)
		}
		mockSvc.AssertExpectations(t)
	})
}

func TestGetScanResults(t *testing.T) {
	mockSvc := new(mockScanService)
	h := &Handler{scanService: mockSvc}

	t.Run("success", func(t *testing.T) {
		mockSvc.On("GetResults", mock.Anything, uint(1)).
			Return([]*entity.Finding{}, nil).Once()

		req := httptest.NewRequest("GET", "/api/scans/1/results", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
		}
		mockSvc.AssertExpectations(t)
	})

	t.Run("invalid id", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/scans/abc/results", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})
}

func TestCreateAuthCredential(t *testing.T) {
	mockCred := new(mockAuthCredentialService)
	h := &Handler{authCredentialService: mockCred}

	t.Run("success", func(t *testing.T) {
		body := `{"name":"test-cred","method":"cookie","config":{"cookies":[{"name":"sess","value":"abc"}]}}`
		req := httptest.NewRequest("POST", "/api/auth-credentials", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")

		mockCred.On("Create", mock.Anything, uint(1), "test-cred", entity.AuthMethod("cookie"), mock.Anything, "", "", "").
			Return(&entity.AuthCredential{ID: 1, Name: "test-cred"}, nil).Once()

		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Errorf("expected status %d, got %d", http.StatusCreated, w.Code)
		}
		mockCred.AssertExpectations(t)
	})

	t.Run("invalid body", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/auth-credentials", bytes.NewBufferString("not-json"))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})
}

func TestGetAuthCredential(t *testing.T) {
	mockCred := new(mockAuthCredentialService)
	h := &Handler{authCredentialService: mockCred}

	t.Run("success", func(t *testing.T) {
		mockCred.On("GetByID", mock.Anything, uint(1)).
			Return(&entity.AuthCredential{ID: 1, Name: "test"}, nil).Once()

		req := httptest.NewRequest("GET", "/api/auth-credentials/1", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
		}
		mockCred.AssertExpectations(t)
	})

	t.Run("not found", func(t *testing.T) {
		mockCred.On("GetByID", mock.Anything, uint(999)).Return(nil, assertError("not found")).Once()

		req := httptest.NewRequest("GET", "/api/auth-credentials/999", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected status %d, got %d", http.StatusNotFound, w.Code)
		}
		mockCred.AssertExpectations(t)
	})

	t.Run("invalid id", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/auth-credentials/abc", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})
}

func TestListAuthCredentials(t *testing.T) {
	mockCred := new(mockAuthCredentialService)
	h := &Handler{authCredentialService: mockCred}

	mockCred.On("ListByUserID", mock.Anything, uint(1)).
		Return([]*entity.AuthCredential{
			{ID: 1, Name: "cred1"},
			{ID: 2, Name: "cred2"},
		}, nil).Once()

	req := httptest.NewRequest("GET", "/api/auth-credentials", nil)
	w := httptest.NewRecorder()
	newRouterWithHandler(h).ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
	}

	var creds []*entity.AuthCredential
	json.NewDecoder(w.Body).Decode(&creds)
	if len(creds) != 2 {
		t.Errorf("expected 2 credentials, got %d", len(creds))
	}
	mockCred.AssertExpectations(t)
}

func TestUpdateAuthCredential(t *testing.T) {
	mockCred := new(mockAuthCredentialService)
	h := &Handler{authCredentialService: mockCred}

	t.Run("success", func(t *testing.T) {
		body := `{"name":"updated-name","is_active":false}`
		req := httptest.NewRequest("PUT", "/api/auth-credentials/1", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")

		mockCred.On("Update", mock.Anything, uint(1), mock.Anything).
			Return(&entity.AuthCredential{ID: 1, Name: "updated-name", IsActive: false}, nil).Once()

		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
		}
		mockCred.AssertExpectations(t)
	})

	t.Run("invalid body", func(t *testing.T) {
		req := httptest.NewRequest("PUT", "/api/auth-credentials/1", bytes.NewBufferString("not-json"))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	t.Run("invalid id", func(t *testing.T) {
		body := `{"name":"test"}`
		req := httptest.NewRequest("PUT", "/api/auth-credentials/abc", bytes.NewBufferString(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})
}

func TestDeleteAuthCredential(t *testing.T) {
	mockCred := new(mockAuthCredentialService)
	h := &Handler{authCredentialService: mockCred}

	t.Run("success", func(t *testing.T) {
		mockCred.On("Delete", mock.Anything, uint(1)).Return(nil).Once()

		req := httptest.NewRequest("DELETE", "/api/auth-credentials/1", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusNoContent {
			t.Errorf("expected status %d, got %d", http.StatusNoContent, w.Code)
		}
		mockCred.AssertExpectations(t)
	})

	t.Run("invalid id", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/api/auth-credentials/abc", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})
}

func TestVerifyAuthCredential(t *testing.T) {
	t.Run("no session manager", func(t *testing.T) {
		mockCred := new(mockAuthCredentialService)
		h := &Handler{authCredentialService: mockCred}

		mockCred.On("GetByID", mock.Anything, uint(1)).
			Return(&entity.AuthCredential{ID: 1}, nil).Once()

		req := httptest.NewRequest("POST", "/api/auth-credentials/1/verify", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusInternalServerError {
			t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
		}
		mockCred.AssertExpectations(t)
	})

	t.Run("credential not found", func(t *testing.T) {
		mockCred := new(mockAuthCredentialService)
		h := &Handler{authCredentialService: mockCred}

		mockCred.On("GetByID", mock.Anything, uint(999)).Return(nil, assertError("not found")).Once()

		req := httptest.NewRequest("POST", "/api/auth-credentials/999/verify", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected status %d, got %d", http.StatusNotFound, w.Code)
		}
		mockCred.AssertExpectations(t)
	})

	t.Run("auth failed", func(t *testing.T) {
		mockCred := new(mockAuthCredentialService)
		sm := authscan.NewSessionManager()
		h := &Handler{authCredentialService: mockCred, sessionManager: sm}

		cred := &entity.AuthCredential{ID: 1, Method: entity.AuthMethodCookie}
		mockCred.On("GetByID", mock.Anything, uint(1)).Return(cred, nil).Once()

		req := httptest.NewRequest("POST", "/api/auth-credentials/1/verify", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected status %d, got %d", http.StatusUnauthorized, w.Code)
		}
		mockCred.AssertExpectations(t)
	})
}

func TestGetReportData(t *testing.T) {
	t.Run("no report service", func(t *testing.T) {
		h := &Handler{}

		req := httptest.NewRequest("GET", "/api/scans/1/report-data", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusInternalServerError {
			t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
		}
	})

	t.Run("success", func(t *testing.T) {
		mockReport := new(mockReportService)
		h := &Handler{reportService: mockReport}

		mockReport.On("GetReportData", mock.Anything, uint(1)).
			Return(&entity.ScanReportData{}, nil).Once()

		req := httptest.NewRequest("GET", "/api/scans/1/report-data", nil)
		w := httptest.NewRecorder()
		newRouterWithHandler(h).ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
		}
		mockReport.AssertExpectations(t)
	})
}

func assertError(msg string) error {
	return &simpleError{msg}
}

type simpleError struct{ msg string }

func (e *simpleError) Error() string { return e.msg }
