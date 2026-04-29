export interface Template {
  id: number;
  name: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  content: string;
  version: string;
  createdAt: string;
}

export interface TemplateMatcher {
  type: 'status_code' | 'body' | 'header' | 'regex' | 'binary';
  condition: 'equals' | 'contains' | 'matches' | 'gt' | 'lt';
  value: string;
}

export interface TemplateExtractor {
  type: 'regex' | 'header' | 'body' | 'json';
  name: string;
  value: string;
}

export interface NucleiTemplate {
  id: string;
  info: {
    name: string;
    severity: Template['severity'];
    tags: string[];
    reference?: string[];
    cve?: string[];
  };
  requests?: TemplateRequest[];
  matchers?: TemplateMatcher[];
  extractors?: TemplateExtractor[];
}

export interface TemplateRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  headers?: Record<string, string>;
  body?: string;
  matchers?: TemplateMatcher[];
}
