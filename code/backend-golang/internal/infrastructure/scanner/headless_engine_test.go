package scanner

import (
	"testing"
)

func TestHeadlessEngine_Type(t *testing.T) {
	e := &HeadlessEngine{}
	if e.Type() != EngineHeadless {
		t.Errorf("Type() = %v, want %v", e.Type(), EngineHeadless)
	}
}

func TestExtractQuoted(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{`"/login"`, "/login"},
		{`'/login'`, "/login"},
		{`/login`, "/login"},
		{`""`, ""},
		{`"test with spaces"`, "test with spaces"},
		{"", ""},
		{`"unclosed`, `unclosed`},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got := extractQuoted(tt.input)
			if got != tt.want {
				t.Errorf("extractQuoted(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}

func TestDetectFrameworks(t *testing.T) {
	e := &HeadlessEngine{}

	tests := []struct {
		name string
		html string
		want []string
	}{
		{
			name: "react detected",
			html: `<div id="root" data-reactroot=""></div>`,
			want: []string{"react"},
		},
		{
			name: "angular detected",
			html: `<html ng-app="myapp" angular></html>`,
			want: []string{"angular"},
		},
		{
			name: "jquery detected",
			html: `<script src="jquery.min.js"></script>`,
			want: []string{"jquery"},
		},
		{
			name: "bootstrap detected",
			html: `<link href="bootstrap.min.css" rel="stylesheet">`,
			want: []string{"bootstrap"},
		},
		{
			name: "tailwind detected",
			html: `<div class="flex justify-center tailwind">`,
			want: []string{"tailwind"},
		},
		{
			name: "vue detected",
			html: `<div id="app" vue>{{ message }}</div>`,
			want: []string{"vue"},
		},
		{
			name: "no frameworks",
			html: `<html><body>plain page</body></html>`,
			want: nil,
		},
		{
			name: "multiple frameworks",
			html: `<html react jquery bootstrap tailwind>`,
			want: []string{"bootstrap", "jquery", "react", "tailwind"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := e.detectFrameworks(tt.html)
			if len(got) != len(tt.want) {
				t.Errorf("detectFrameworks() = %v, want %v", got, tt.want)
				return
			}
			wantSet := make(map[string]struct{}, len(tt.want))
			for _, w := range tt.want {
				wantSet[w] = struct{}{}
			}
			for _, v := range got {
				if _, ok := wantSet[v]; !ok {
					t.Errorf("detectFrameworks() = %v, want %v (unexpected %s)", got, tt.want, v)
				}
			}
		})
	}
}

func TestExtractForms(t *testing.T) {
	e := &HeadlessEngine{}

	tests := []struct {
		name string
		html string
		want int
	}{
		{
			name: "single form with action",
			html: `<form action="/login" method="POST"><input name="user"/></form>`,
			want: 1,
		},
		{
			name: "form without action is skipped",
			html: `<form method="GET"><input name="q"/></form>`,
			want: 0,
		},
		{
			name: "multiple forms",
			html: `<form action="/login" method="POST"></form><form action="/search" method="GET"></form>`,
			want: 2,
		},
		{
			name: "no forms",
			html: `<html><body>no forms here</body></html>`,
			want: 0,
		},
		{
			name: "form with single-quoted action",
			html: `<form action='/signup' method='POST'></form>`,
			want: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			forms := e.extractForms(tt.html)
			if len(forms) != tt.want {
				t.Errorf("extractForms() returned %d forms, want %d", len(forms), tt.want)
			}
		})
	}
}

func TestExtractForms_Actions(t *testing.T) {
	e := &HeadlessEngine{}
	html := `<form action="/login" method="POST"><input name="user"/></form>`
	forms := e.extractForms(html)

	if len(forms) != 1 {
		t.Fatalf("expected 1 form, got %d", len(forms))
	}
	if forms[0]["action"] != "/login" {
		t.Errorf("form action = %s, want /login", forms[0]["action"])
	}
	if forms[0]["method"] != "POST" {
		t.Errorf("form method = %s, want POST", forms[0]["method"])
	}
}

func TestAnalyzePage_XSS(t *testing.T) {
	e := &HeadlessEngine{}

	t.Run("xss detected from console logs", func(t *testing.T) {
		details := map[string]interface{}{}
		matched := e.analyzePage("xss-detection", `<html></html>`, []string{"alert('xss')", "other log"}, details)
		if !matched {
			t.Error("analyzePage() should detect XSS from console logs")
		}
		if details["xss_detected"] != true {
			t.Error("details should contain xss_detected=true")
		}
	})

	t.Run("xss not detected without console logs", func(t *testing.T) {
		details := map[string]interface{}{}
		matched := e.analyzePage("xss-detection", `<html></html>`, []string{"normal log"}, details)
		if matched {
			t.Error("analyzePage() should not detect XSS without suspicious console logs")
		}
	})

	t.Run("non-xss template does not check console", func(t *testing.T) {
		details := map[string]interface{}{}
		matched := e.analyzePage("tech-detect", `<html><script>alert(1)</script></html>`, []string{"alert('xss')"}, details)
		if details["xss_detected"] != nil {
			t.Error("xss_detected should not be set for non-xss template")
		}
		_ = matched
	})
}

func TestAnalyzePage_FrameworkDetection(t *testing.T) {
	e := &HeadlessEngine{}

	t.Run("framework detected", func(t *testing.T) {
		details := map[string]interface{}{}
		e.analyzePage("tech-detect", `<div id="root" data-reactroot=""></div>`, nil, details)
		if details["frameworks"] == nil {
			t.Error("frameworks should be detected")
		}
	})

	t.Run("no framework for plain html", func(t *testing.T) {
		details := map[string]interface{}{}
		e.analyzePage("tech-detect", `<html><body>plain</body></html>`, nil, details)
		if details["frameworks"] != nil {
			t.Error("frameworks should be nil for plain HTML")
		}
	})
}

func TestAnalyzePage_OpenRedirect(t *testing.T) {
	e := &HeadlessEngine{}

	t.Run("open redirect detected", func(t *testing.T) {
		details := map[string]interface{}{}
		matched := e.analyzePage("open-redirect", `<script>window.location='http://evil.com'</script>`, nil, details)
		if !matched {
			t.Error("analyzePage() should detect open redirect")
		}
	})

	t.Run("no open redirect on clean page", func(t *testing.T) {
		details := map[string]interface{}{}
		matched := e.analyzePage("open-redirect", `<html>safe</html>`, nil, details)
		if matched {
			t.Error("analyzePage() should not detect open redirect on clean page")
		}
	})
}

func TestAnalyzePage_FormExtraction(t *testing.T) {
	e := &HeadlessEngine{}

	t.Run("forms found", func(t *testing.T) {
		details := map[string]interface{}{}
		e.analyzePage("csrf-detection", `<html><form action="/submit" method="POST"></form></html>`, nil, details)
		if details["form_count"] != 1 {
			t.Errorf("form_count = %d, want 1", details["form_count"])
		}
	})

	t.Run("no forms", func(t *testing.T) {
		details := map[string]interface{}{}
		e.analyzePage("csrf-detection", `<html>no forms</html>`, nil, details)
		if details["form_count"] != nil {
			t.Error("form_count should not be set when no forms")
		}
	})
}

func TestAnalyzePage_CombinedSignals(t *testing.T) {
	e := &HeadlessEngine{}
	details := map[string]interface{}{}
	matched := e.analyzePage("xss-csrf-mixed", `<html><form action="/submit"></form></html>`, []string{"alert('xss')"}, details)

	if !matched {
		t.Error("analyzePage() should match for xss template with alert in console")
	}
	if details["form_count"] != 1 {
		t.Errorf("form_count = %d, want 1", details["form_count"])
	}
	if details["xss_detected"] != true {
		t.Error("xss_detected should be true")
	}
}
