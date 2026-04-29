package template

type NucleiTemplate struct {
	ID   string `yaml:"id"`
	Info NucleiTemplateInfo `yaml:"info"`
}

type NucleiTemplateInfo struct {
	Name     string   `yaml:"name"`
	Severity string   `yaml:"severity"`
	Tags     []string `yaml:"tags"`
}
