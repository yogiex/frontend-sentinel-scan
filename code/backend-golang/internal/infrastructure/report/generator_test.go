package report

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"testing"

	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/application"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/domain/entity"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/domain/repository"
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

type mockFindingRepo struct {
	mock.Mock
}

func (m *mockFindingRepo) Create(ctx context.Context, finding *entity.Finding) error {
	args := m.Called(ctx, finding)
	return args.Error(0)
}

func (m *mockFindingRepo) CreateBatch(ctx context.Context, findings []*entity.Finding) error {
	args := m.Called(ctx, findings)
	return args.Error(0)
}

func (m *mockFindingRepo) FindByScanID(ctx context.Context, scanID uint) ([]*entity.Finding, error) {
	args := m.Called(ctx, scanID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entity.Finding), args.Error(1)
}

func (m *mockFindingRepo) FindBySeverity(ctx context.Context, severity string) ([]*entity.Finding, error) {
	args := m.Called(ctx, severity)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entity.Finding), args.Error(1)
}

func (m *mockFindingRepo) FindByTarget(ctx context.Context, target string) ([]*entity.Finding, error) {
	args := m.Called(ctx, target)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entity.Finding), args.Error(1)
}

func (m *mockFindingRepo) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *mockFindingRepo) DeleteByScanID(ctx context.Context, scanID uint) error {
	args := m.Called(ctx, scanID)
	return args.Error(0)
}

func TestNewGenerator(t *testing.T) {
	gen := NewGenerator(nil, nil, "./test-reports")

	if gen == nil {
		t.Fatal("Expected non-nil generator")
	}
	if gen.outputDir != "./test-reports" {
		t.Errorf("outputDir = %v, want ./test-reports", gen.outputDir)
	}
}

func TestGenerator_GetPDFPath(t *testing.T) {
	gen := &Generator{outputDir: "/tmp/reports"}
	path := gen.GetPDFPath(42)

	expected := filepath.Join("/tmp/reports", "scan_42.pdf")
	if path != expected {
		t.Errorf("GetPDFPath(42) = %v, want %v", path, expected)
	}
}

func TestGenerator_PDFExists_NotFound(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "report-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	gen := &Generator{outputDir: tmpDir}
	if gen.PDFExists(999) {
		t.Error("Expected PDFExists=false for non-existent report")
	}
}

func TestGenerator_PDFExists_Found(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "report-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	scanID := uint(1)
	dummyPath := filepath.Join(tmpDir, "scan_1.pdf")
	if err := os.WriteFile(dummyPath, []byte("dummy pdf content"), 0644); err != nil {
		t.Fatalf("Failed to create dummy PDF: %v", err)
	}

	gen := &Generator{outputDir: tmpDir}
	if !gen.PDFExists(scanID) {
		t.Error("Expected PDFExists=true for existing report")
	}
}

func TestGenerator_PDFExists_AfterDelete(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "report-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	scanID := uint(1)
	dummyPath := filepath.Join(tmpDir, "scan_1.pdf")
	os.WriteFile(dummyPath, []byte("dummy"), 0644)

	gen := &Generator{outputDir: tmpDir}

	if !gen.PDFExists(scanID) {
		t.Fatal("Expected PDFExists=true before delete")
	}

	os.Remove(dummyPath)

	if gen.PDFExists(scanID) {
		t.Error("Expected PDFExists=false after delete")
	}
}

func TestGenerator_NewGenerator_SetsOutputDir(t *testing.T) {
	gen := NewGenerator(nil, nil, "/custom/output")

	if gen.outputDir != "/custom/output" {
		t.Errorf("outputDir = %v, want /custom/output", gen.outputDir)
	}
}

func TestGenerator_GeneratePDF_ScanNotFound(t *testing.T) {
	mockScan := new(mockScanRepo)
	mockScan.On("FindByID", mock.Anything, uint(999)).Return(nil, errors.New("not found"))
	mockFinding := new(mockFindingRepo)

	reportSvc := application.NewReportService(mockScan, mockFinding)
	pdfGen := NewPDFGenerator("")
	defer pdfGen.Close()

	tmpDir := t.TempDir()
	gen := NewGenerator(reportSvc, pdfGen, tmpDir)

	_, err := gen.GeneratePDF(context.Background(), 999)
	if err == nil {
		t.Error("Expected error for non-existent scan")
	}
	mockScan.AssertExpectations(t)
}

func TestGenerator_GeneratePDF_NoChrome(t *testing.T) {
	mockScan := new(mockScanRepo)
	mockScan.On("FindByID", mock.Anything, uint(1)).Return(&entity.ScanJob{ID: 1, Status: entity.ScanStatusCompleted}, nil)
	mockFinding := new(mockFindingRepo)
	mockFinding.On("FindByScanID", mock.Anything, uint(1)).Return([]*entity.Finding{}, nil)

	reportSvc := application.NewReportService(mockScan, mockFinding)
	pdfGen := NewPDFGenerator("/nonexistent/chrome/path")
	defer pdfGen.Close()

	tmpDir := t.TempDir()
	gen := NewGenerator(reportSvc, pdfGen, tmpDir)

	_, err := gen.GeneratePDF(context.Background(), 1)
	if err == nil {
		t.Error("Expected error from PDF generation with invalid Chrome path")
	}
	mockScan.AssertExpectations(t)
	mockFinding.AssertExpectations(t)
}

func TestGenerator_GeneratePDF_FindingsError(t *testing.T) {
	mockScan := new(mockScanRepo)
	mockScan.On("FindByID", mock.Anything, uint(1)).Return(&entity.ScanJob{ID: 1, Status: entity.ScanStatusCompleted}, nil)
	mockFinding := new(mockFindingRepo)
	mockFinding.On("FindByScanID", mock.Anything, uint(1)).Return(nil, errors.New("db error"))

	reportSvc := application.NewReportService(mockScan, mockFinding)
	pdfGen := NewPDFGenerator("")
	defer pdfGen.Close()

	gen := NewGenerator(reportSvc, pdfGen, t.TempDir())

	_, err := gen.GeneratePDF(context.Background(), 1)
	if err == nil {
		t.Error("Expected error for findings fetch failure")
	}
	mockScan.AssertExpectations(t)
	mockFinding.AssertExpectations(t)
}
