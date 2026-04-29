package worker

import "github.com/inkubasi-btp-cybersecurity/vulnerability-scanner/template"

type Task struct {
	ID         string
	ScanID     uint
	Target     string
	TemplateID string
	Template   *template.NucleiTemplate
	Retries    int
}

type Finding struct {
	Target     string
	TemplateID string
	Matched    bool
	Details    map[string]interface{}
}

type Result struct {
	TaskID  string
	Finding *Finding
	Error   error
}
