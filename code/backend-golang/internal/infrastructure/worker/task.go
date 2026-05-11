package worker

import (
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/internal/infrastructure/authscan"
	"github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/template"
)

type Task struct {
	ID         string
	ScanID     uint
	Target     string
	TemplateID string
	Template   *template.NucleiTemplate
	Retries    int
	Session    *authscan.Session
}

type Finding struct {
	Target     string
	TemplateID string
	Matched    bool
	Severity   string
	Details    map[string]interface{}
}

type Result struct {
	TaskID  string
	ScanID  uint
	Finding *Finding
	Error   error
}
