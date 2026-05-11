package entity

import (
	"testing"
	"time"
)

func TestNewAuthCredential(t *testing.T) {
	now := time.Now()
	config := map[string]interface{}{"token": "abc"}

	cred := NewAuthCredential(1, "test-cred", AuthMethodBearer, config, "http://login", "http://verify", "ok")

	if cred.UserID != 1 {
		t.Errorf("UserID = %d, want 1", cred.UserID)
	}
	if cred.Name != "test-cred" {
		t.Errorf("Name = %s, want test-cred", cred.Name)
	}
	if cred.Method != AuthMethodBearer {
		t.Errorf("Method = %v, want bearer", cred.Method)
	}
	if cred.Config["token"] != "abc" {
		t.Errorf("Config['token'] = %v, want abc", cred.Config["token"])
	}
	if cred.LoginURL != "http://login" {
		t.Errorf("LoginURL = %s, want http://login", cred.LoginURL)
	}
	if cred.VerifyURL != "http://verify" {
		t.Errorf("VerifyURL = %s, want http://verify", cred.VerifyURL)
	}
	if cred.VerifyPattern != "ok" {
		t.Errorf("VerifyPattern = %s, want ok", cred.VerifyPattern)
	}
	if !cred.IsActive {
		t.Error("IsActive should be true by default")
	}
	if cred.CreatedAt.Before(now.Add(-time.Second)) || cred.CreatedAt.After(now.Add(time.Second)) {
		t.Error("CreatedAt should be set to current time")
	}
}

func TestNewAuthCredential_Defaults(t *testing.T) {
	cred := NewAuthCredential(0, "", "", nil, "", "", "")

	if cred.UserID != 0 {
		t.Errorf("UserID = %d, want 0", cred.UserID)
	}
	if cred.Name != "" {
		t.Errorf("Name = %s, want empty", cred.Name)
	}
	if cred.Config != nil {
		t.Error("Config should be nil for empty config")
	}
}

func TestNewAuthSession(t *testing.T) {
	s := NewAuthSession(1, 2)

	if s.ScanID != 1 {
		t.Errorf("ScanID = %d, want 1", s.ScanID)
	}
	if s.CredentialID != 2 {
		t.Errorf("CredentialID = %d, want 2", s.CredentialID)
	}
	if s.Status != AuthSessionActive {
		t.Errorf("Status = %v, want active", s.Status)
	}
	if s.FailCount != 0 {
		t.Errorf("FailCount = %d, want 0", s.FailCount)
	}
	if s.Cookies != nil {
		t.Error("Cookies should be nil initially")
	}
	if s.Headers != nil {
		t.Error("Headers should be nil initially")
	}
}

func TestAuthSession_ZeroValues(t *testing.T) {
	s := NewAuthSession(0, 0)

	if s.ScanID != 0 {
		t.Errorf("ScanID = %d, want 0", s.ScanID)
	}
	if s.CredentialID != 0 {
		t.Errorf("CredentialID = %d, want 0", s.CredentialID)
	}
}

func TestAuthSessionStatus_Values(t *testing.T) {
	if AuthSessionActive != "active" {
		t.Errorf("AuthSessionActive = %s, want active", AuthSessionActive)
	}
	if AuthSessionExpired != "expired" {
		t.Errorf("AuthSessionExpired = %s, want expired", AuthSessionExpired)
	}
	if AuthSessionRefreshing != "refreshing" {
		t.Errorf("AuthSessionRefreshing = %s, want refreshing", AuthSessionRefreshing)
	}
	if AuthSessionFailed != "failed" {
		t.Errorf("AuthSessionFailed = %s, want failed", AuthSessionFailed)
	}
}

func TestNewReportData_NilScan(t *testing.T) {
	report := NewReportData(nil, nil)
	if report != nil {
		t.Error("NewReportData(nil, nil) should return nil")
	}
}

func TestNewReportData_EmptyFindings(t *testing.T) {
	scan := &ScanJob{
		ID:     1,
		Status: ScanStatusPending,
		Targets: []string{"http://example.com"},
	}
	report := NewReportData(scan, []*Finding{})

	if report == nil {
		t.Fatal("NewReportData() returned nil")
	}
	if report.Scan.ID != 1 {
		t.Errorf("Scan.ID = %d, want 1", report.Scan.ID)
	}
	if report.Summary.TotalFindings != 0 {
		t.Errorf("TotalFindings = %d, want 0", report.Summary.TotalFindings)
	}
	if len(report.Findings) != 0 {
		t.Errorf("finding groups = %d, want 0", len(report.Findings))
	}
}

func TestNewReportData_WithFindings(t *testing.T) {
	scan := &ScanJob{
		ID:     1,
		Status: ScanStatusCompleted,
	}
	findings := []*Finding{
		{ID: 1, Target: "http://a.com", Severity: "critical", Matched: true, TemplateID: "t1"},
		{ID: 2, Target: "http://b.com", Severity: "high", Matched: false, TemplateID: "t2"},
		{ID: 3, Target: "http://a.com", Severity: "critical", Matched: true, TemplateID: "t3"},
		{ID: 4, Target: "http://c.com", Severity: "medium", Matched: true, TemplateID: "t4"},
	}

	report := NewReportData(scan, findings)

	if report.Summary.TotalFindings != 4 {
		t.Errorf("TotalFindings = %d, want 4", report.Summary.TotalFindings)
	}
	if report.Summary.Critical != 2 {
		t.Errorf("Critical = %d, want 2", report.Summary.Critical)
	}
	if report.Summary.High != 1 {
		t.Errorf("High = %d, want 1", report.Summary.High)
	}
	if report.Summary.Medium != 1 {
		t.Errorf("Medium = %d, want 1", report.Summary.Medium)
	}
	if report.Summary.Low != 0 {
		t.Errorf("Low = %d, want 0", report.Summary.Low)
	}
	if report.Summary.Info != 0 {
		t.Errorf("Info = %d, want 0", report.Summary.Info)
	}
	if report.Summary.MatchedCount != 3 {
		t.Errorf("MatchedCount = %d, want 3", report.Summary.MatchedCount)
	}
}

func TestNewReportData_FindingGroups_SevOrder(t *testing.T) {
	scan := &ScanJob{ID: 1, Status: ScanStatusCompleted}
	findings := []*Finding{
		{ID: 1, Target: "http://a.com", Severity: "info", TemplateID: "t1"},
		{ID: 2, Target: "http://b.com", Severity: "critical", TemplateID: "t2"},
		{ID: 3, Target: "http://c.com", Severity: "medium", TemplateID: "t3"},
		{ID: 4, Target: "http://d.com", Severity: "high", TemplateID: "t4"},
		{ID: 5, Target: "http://e.com", Severity: "low", TemplateID: "t5"},
	}

	report := NewReportData(scan, findings)

	if len(report.Findings) != 5 {
		t.Errorf("finding groups = %d, want 5", len(report.Findings))
	}

	expectedOrder := []string{"critical", "high", "medium", "low", "info"}
	for i, g := range report.Findings {
		if g.Severity != expectedOrder[i] {
			t.Errorf("group[%d] severity = %s, want %s", i, g.Severity, expectedOrder[i])
		}
		if g.Count != 1 {
			t.Errorf("group[%d] Count = %d, want 1", i, g.Count)
		}
	}
}

func TestNewReportData_GroupCounts(t *testing.T) {
	scan := &ScanJob{ID: 1, Status: ScanStatusCompleted}
	findings := []*Finding{
		{ID: 1, Target: "http://a.com", Severity: "critical", TemplateID: "t1"},
		{ID: 2, Target: "http://b.com", Severity: "critical", TemplateID: "t2"},
		{ID: 3, Target: "http://c.com", Severity: "high", TemplateID: "t3"},
	}

	report := NewReportData(scan, findings)

	if len(report.Findings) != 2 {
		t.Errorf("finding groups = %d, want 2", len(report.Findings))
	}
	if report.Findings[0].Severity != "critical" || report.Findings[0].Count != 2 {
		t.Errorf("critical group: severity=%s count=%d, want critical count=2", report.Findings[0].Severity, report.Findings[0].Count)
	}
	if report.Findings[1].Severity != "high" || report.Findings[1].Count != 1 {
		t.Errorf("high group: severity=%s count=%d, want high count=1", report.Findings[1].Severity, report.Findings[1].Count)
	}
}

func TestNewReportData_SeverityBreakdown(t *testing.T) {
	scan := &ScanJob{ID: 1, Status: ScanStatusCompleted}
	findings := []*Finding{
		{ID: 1, Target: "http://a.com", Severity: "critical", TemplateID: "t1"},
		{ID: 2, Target: "http://b.com", Severity: "high", TemplateID: "t2"},
		{ID: 3, Target: "http://c.com", Severity: "low", TemplateID: "t3"},
	}

	report := NewReportData(scan, findings)

	if report.Summary.SeverityBreakdown["critical"] != 1 {
		t.Errorf("breakdown critical = %d, want 1", report.Summary.SeverityBreakdown["critical"])
	}
	if report.Summary.SeverityBreakdown["high"] != 1 {
		t.Errorf("breakdown high = %d, want 1", report.Summary.SeverityBreakdown["high"])
	}
	if report.Summary.SeverityBreakdown["medium"] != 0 {
		t.Errorf("breakdown medium = %d, want 0", report.Summary.SeverityBreakdown["medium"])
	}
	if report.Summary.SeverityBreakdown["low"] != 1 {
		t.Errorf("breakdown low = %d, want 1", report.Summary.SeverityBreakdown["low"])
	}
	if report.Summary.SeverityBreakdown["info"] != 0 {
		t.Errorf("breakdown info = %d, want 0", report.Summary.SeverityBreakdown["info"])
	}
}

func TestNewReportData_TopTargets(t *testing.T) {
	scan := &ScanJob{ID: 1, Status: ScanStatusCompleted}
	findings := []*Finding{
		{ID: 1, Target: "http://a.com", Severity: "critical", TemplateID: "t1"},
		{ID: 2, Target: "http://a.com", Severity: "high", TemplateID: "t2"},
		{ID: 3, Target: "http://a.com", Severity: "medium", TemplateID: "t3"},
		{ID: 4, Target: "http://b.com", Severity: "low", TemplateID: "t4"},
	}

	report := NewReportData(scan, findings)

	if len(report.Summary.TopTargets) == 0 {
		t.Error("TopTargets should not be empty")
	}
	if report.Summary.TopTargets[0] != "http://a.com" {
		t.Errorf("TopTargets[0] = %s, want http://a.com", report.Summary.TopTargets[0])
	}
}

func TestNewReportData_Duration(t *testing.T) {
	t.Run("completed scan has duration", func(t *testing.T) {
		now := time.Now()
		scan := &ScanJob{
			ID:        1,
			Status:    ScanStatusCompleted,
			CreatedAt: now.Add(-10 * time.Second),
			UpdatedAt: now,
		}
		report := NewReportData(scan, []*Finding{})
		if report.Scan.DurationSec == 0 {
			t.Error("DurationSec should be > 0 for completed scan")
		}
	})

	t.Run("pending scan has zero duration", func(t *testing.T) {
		scan := &ScanJob{
			ID:     1,
			Status: ScanStatusPending,
		}
		report := NewReportData(scan, []*Finding{})
		if report.Scan.DurationSec != 0 {
			t.Errorf("DurationSec = %d, want 0 for pending scan", report.Scan.DurationSec)
		}
	})
}
