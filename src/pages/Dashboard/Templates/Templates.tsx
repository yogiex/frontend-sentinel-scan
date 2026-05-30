/**
 * SentinelScan Templates Page - Enhanced
 * Path: src/pages/Dashboard/Templates/Templates.tsx
 *
 * Comprehensive template management with:
 * - Modern UI with gradients and animations (CSS-based)
 * - CRUD operations (Create, Read, Update, Delete)
 * - Advanced filtering and search
 * - Template preview and quick actions
 * - frontend-design skill compliant
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { StatsCard } from '@/components/StatsCard';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Play, 
  Star, 
  Shield,
  Zap,
  Globe,
  Lock,
  CheckCircle,
  Clock,
  type LucideIcon,
} from 'lucide-react';

// Types
interface ScanConfig {
  target: string;
  useCredentials: boolean;
  authType?: string;
  userAgentMode: string;
  customUserAgent?: string;
  enableCookies: boolean;
  humanLikeDelay: boolean;
  delayMin: number;
  delayMax: number;
  randomizeOrder: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string;
  scanType: 'basic' | 'advanced' | 'web' | 'credentialed' | 'compliance' | 'discovery';
  profile: 'quick' | 'standard' | 'full' | 'custom';
  credentials: boolean;
  category: 'web' | 'network' | 'compliance';
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  lastUsed?: string;
  successRate: number;
  tags: string[];
  isFavorite: boolean;
  scanConfig: ScanConfig;
}

interface CategoryOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface ScanTypeOption {
  value: string;
  label: string;
}

interface ProfileOption {
  value: string;
  label: string;
}

interface ScanTypeConfig {
  color: string;
  icon: LucideIcon;
}

interface ProfileConfig {
  color: string;
  label: string;
}

// Mock data
const initialTemplates: Template[] = [
  {
    id: '1',
    name: 'Quick Network Scan',
    description: 'Fast vulnerability scan — common CVEs, top 1000 ports',
    scanType: 'basic',
    profile: 'quick',
    credentials: false,
    category: 'network',
    createdAt: '2026-04-15',
    updatedAt: '2026-04-15',
    usageCount: 42,
    lastUsed: '2026-05-01',
    successRate: 98,
    tags: ['quick', 'network', 'cve'],
    isFavorite: true,
    scanConfig: {
      target: '',
      useCredentials: false,
      userAgentMode: 'random',
      enableCookies: true,
      humanLikeDelay: true,
      delayMin: 1,
      delayMax: 5,
      randomizeOrder: true,
    }
  },
  {
    id: '2',
    name: 'Full Credentialed Audit',
    description: 'Deep scan with SSH/Windows credentials — missing patches, local vulns',
    scanType: 'credentialed',
    profile: 'full',
    credentials: true,
    category: 'network',
    createdAt: '2026-04-10',
    updatedAt: '2026-04-20',
    usageCount: 18,
    lastUsed: '2026-04-28',
    successRate: 95,
    tags: ['credentialed', 'patch-audit', 'deep-scan'],
    isFavorite: false,
    scanConfig: {
      target: '',
      useCredentials: true,
      authType: 'ssh-key',
      userAgentMode: 'chrome',
      enableCookies: true,
      humanLikeDelay: false,
      delayMin: 0,
      delayMax: 0,
      randomizeOrder: false,
    }
  },
  {
    id: '3',
    name: 'Web App Security Check',
    description: 'OWASP Top 10, SQLi, XSS, authentication flaws',
    scanType: 'web',
    profile: 'standard',
    credentials: true,
    category: 'web',
    createdAt: '2026-04-20',
    updatedAt: '2026-04-25',
    usageCount: 31,
    lastUsed: '2026-05-02',
    successRate: 92,
    tags: ['owasp', 'web', 'sqli', 'xss'],
    isFavorite: true,
    scanConfig: {
      target: '',
      useCredentials: true,
      authType: 'username-password',
      userAgentMode: 'random',
      enableCookies: true,
      humanLikeDelay: true,
      delayMin: 2,
      delayMax: 8,
      randomizeOrder: true,
    }
  },
  {
    id: '4',
    name: 'Host Discovery',
    description: 'Network mapping, port scanning, OS fingerprinting only',
    scanType: 'discovery',
    profile: 'quick',
    credentials: false,
    category: 'network',
    createdAt: '2026-04-25',
    updatedAt: '2026-04-25',
    usageCount: 67,
    lastUsed: '2026-05-02',
    successRate: 99,
    tags: ['discovery', 'network-mapping', 'port-scan'],
    isFavorite: false,
    scanConfig: {
      target: '',
      useCredentials: false,
      userAgentMode: 'random',
      enableCookies: false,
      humanLikeDelay: false,
      delayMin: 0,
      delayMax: 0,
      randomizeOrder: false,
    }
  },
  {
    id: '5',
    name: 'PCI-DSS Compliance',
    description: 'PCI-DSS policy checks, CIS benchmarks, configuration audit',
    scanType: 'compliance',
    profile: 'full',
    credentials: true,
    category: 'compliance',
    createdAt: '2026-03-01',
    updatedAt: '2026-04-15',
    usageCount: 9,
    lastUsed: '2026-04-20',
    successRate: 88,
    tags: ['pci-dss', 'compliance', 'cis-benchmark'],
    isFavorite: false,
    scanConfig: {
      target: '',
      useCredentials: true,
      authType: 'api-token',
      userAgentMode: 'custom',
      customUserAgent: 'PCI-Compliance-Scanner/1.0',
      enableCookies: true,
      humanLikeDelay: true,
      delayMin: 5,
      delayMax: 15,
      randomizeOrder: true,
    }
  },
  {
    id: '6',
    name: 'Advanced Targeted Scan',
    description: 'Custom plugin selection, specific ports, targeted checks',
    scanType: 'advanced',
    profile: 'standard',
    credentials: false,
    category: 'network',
    createdAt: '2026-04-05',
    updatedAt: '2026-04-30',
    usageCount: 25,
    lastUsed: '2026-04-29',
    successRate: 94,
    tags: ['advanced', 'custom', 'targeted'],
    isFavorite: true,
    scanConfig: {
      target: '',
      useCredentials: false,
      userAgentMode: 'firefox',
      enableCookies: true,
      humanLikeDelay: true,
      delayMin: 3,
      delayMax: 10,
      randomizeOrder: true,
    }
  },
];

const categories: CategoryOption[] = [
  { value: 'all', label: 'All Categories', icon: Filter },
  { value: 'web', label: 'Web Applications', icon: Globe },
  { value: 'network', label: 'Network Infrastructure', icon: Shield },
  { value: 'compliance', label: 'Compliance & Audit', icon: CheckCircle },
];

const scanTypes: ScanTypeOption[] = [
  { value: 'all', label: 'All Types' },
  { value: 'basic', label: 'Basic Network Scan' },
  { value: 'advanced', label: 'Advanced Scan' },
  { value: 'web', label: 'Web Application' },
  { value: 'credentialed', label: 'Credentialed Audit' },
  { value: 'compliance', label: 'Compliance Check' },
  { value: 'discovery', label: 'Host Discovery' },
];

const profiles: ProfileOption[] = [
  { value: 'all', label: 'All Profiles' },
  { value: 'quick', label: 'Quick' },
  { value: 'standard', label: 'Standard' },
  { value: 'full', label: 'Full' },
  { value: 'custom', label: 'Custom' },
];

const scanTypeConfig: Record<string, ScanTypeConfig> = {
  basic: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Shield },
  advanced: { color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: Zap },
  web: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: Globe },
  credentialed: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Lock },
  compliance: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: CheckCircle },
  discovery: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Shield },
};

const profileConfig: Record<string, ProfileConfig> = {
  quick: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Quick' },
  standard: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Standard' },
  full: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Full' },
  custom: { color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', label: 'Custom' },
};

export function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [filter, setFilter] = useState('all');
  const [scanTypeFilter, setScanTypeFilter] = useState('all');
  const [profileFilter, setProfileFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scanType: 'basic',
    profile: 'quick',
    credentials: false,
    category: 'network',
    tags: '',
  });

  const filtered = templates.filter((t) => {
    const matchCategory = filter === 'all' || t.category === filter;
    const matchScanType = scanTypeFilter === 'all' || t.scanType === scanTypeFilter;
    const matchProfile = profileFilter === 'all' || t.profile === profileFilter;
    const matchFavorite = !showFavorites || t.isFavorite;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchScanType && matchProfile && matchFavorite && matchSearch;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, scanTypeFilter, profileFilter, showFavorites, search]);

  const paginatedTemplates = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreateTemplate = () => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      scanType: formData.scanType as Template['scanType'],
      profile: formData.profile as Template['profile'],
      credentials: formData.credentials,
      category: formData.category as Template['category'],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      usageCount: 0,
      successRate: 0,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isFavorite: false,
      scanConfig: {
        target: '',
        useCredentials: formData.credentials,
        userAgentMode: 'random',
        enableCookies: true,
        humanLikeDelay: true,
        delayMin: 1,
        delayMax: 5,
        randomizeOrder: true,
      }
    };
    setTemplates([newTemplate, ...templates]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;
    const updated = templates.map(t =>
      t.id === editingTemplate.id
        ? {
            ...t,
            ...formData,
            scanType: formData.scanType as Template['scanType'],
            profile: formData.profile as Template['profile'],
            category: formData.category as Template['category'],
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : t
    );
    setTemplates(updated);
    setEditingTemplate(null);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleToggleFavorite = (id: string) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const openEditModal = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      scanType: template.scanType,
      profile: template.profile,
      credentials: template.credentials,
      category: template.category,
      tags: template.tags.join(', '),
    });
    setIsCreateModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      scanType: 'basic',
      profile: 'quick',
      credentials: false,
      category: 'network',
      tags: '',
    });
    setEditingTemplate(null);
  };

  const handleRunTemplate = (template: Template) => {
    navigate(`/dashboard/scans/new?template=${template.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Scan Templates</h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">Manage reusable scan configurations for quick deployment</p>
        </div>
        <Button
          className=""
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard icon={CheckCircle} label="Total" value={templates.length} color="var(--primary)" />
        <StatsCard icon={Star} label="Favorites" value={templates.filter(t => t.isFavorite).length} color="var(--warning)" />
        <StatsCard icon={Zap} label="Most Used" value={Math.max(...templates.map(t => t.usageCount))} color="var(--primary)" />
        <StatsCard icon={CheckCircle} label="Avg Success" value={`${Math.round(templates.reduce((acc, t) => acc + t.successRate, 0) / templates.length)}%`} color="var(--success)" />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <Input
              type="text"
              placeholder="Search templates by name, description, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={filter === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat.value)}
              className={filter === cat.value ? '' : 'hover:text-white'}
              style={filter === cat.value
                ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }
                : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
              }
            >
              <cat.icon className="w-4 h-4 mr-2" />
              {cat.label}
              {cat.value !== 'all' && (
                <Badge className="ml-2" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                  {templates.filter(t => cat.value === 'all' || t.category === cat.value).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <Select value={scanTypeFilter} onValueChange={setScanTypeFilter}>
          <SelectTrigger className="w-[200px] border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <SelectValue placeholder="Filter by scan type" />
          </SelectTrigger>
          <SelectContent className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            {scanTypes.map(type => (
              <SelectItem key={type.value} value={type.value} className="hover:bg-slate-700" style={{ color: 'var(--text-primary)' }}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={profileFilter} onValueChange={setProfileFilter}>
          <SelectTrigger className="w-[200px] border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <SelectValue placeholder="Filter by profile" />
          </SelectTrigger>
          <SelectContent className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            {profiles.map(prof => (
              <SelectItem key={prof.value} value={prof.value} className="hover:bg-slate-700" style={{ color: 'var(--text-primary)' }}>
                {prof.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showFavorites ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFavorites(!showFavorites)}
          className={showFavorites ? '' : 'hover:text-white'}
          style={showFavorites
            ? { backgroundColor: 'var(--warning)', color: 'var(--primary-foreground)' }
            : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
          }
        >
          <Star className="w-4 h-4 mr-2" />
          Favorites Only
        </Button>

        <div className="ml-auto text-sm" style={{ color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {templates.length} templates
        </div>
      </div>

      {/* Template Cards */}
      {filtered.length === 0 ? (
        <Card className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No templates found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedTemplates.map((template, index) => {
            const ScanTypeIcon = scanTypeConfig[template.scanType]?.icon || Shield;
            return (
              <div
                key={template.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card className="backdrop-blur-sm border hover:border-slate-700 transition-all duration-300 group relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                            {template.name}
                          </CardTitle>
                          {template.isFavorite && (
                            <Star className="w-4 h-4 fill-amber-400" style={{ color: 'var(--warning)' }} />
                          )}
                        </div>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          Created {template.createdAt} • Used {template.usageCount} times
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleToggleFavorite(template.id)}
                        >
                          <Star className={`w-4 h-4 ${template.isFavorite ? 'fill-amber-400' : ''}`} style={{ color: template.isFavorite ? 'var(--warning)' : 'var(--text-muted)' }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => openEditModal(template)}
                        >
                          <Edit2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" style={{ color: 'var(--danger)' }} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 relative z-10">
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{template.description}</p>

                    <div className="flex gap-2 flex-wrap">
                      <Badge className="border" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                        <ScanTypeIcon className="w-3 h-3 mr-1" />
                        {template.scanType}
                      </Badge>
                      <Badge className="border" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                        {profileConfig[template.profile]?.label}
                      </Badge>
                      {template.credentials && (
                        <Badge className="border" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                          <Lock className="w-3 h-3 mr-1" />
                          Auth
                        </Badge>
                      )}
                    </div>

                    {/* Tags */}
                    {template.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {template.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-2 border-t text-xs" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                          <Zap className="w-3 h-3" />
                          {template.successRate}% success
                        </span>
                        {template.lastUsed && (
                          <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            <Clock className="w-3 h-3" />
                            {template.lastUsed}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: 'rgba(37, 99, 235, 0.8)', color: 'var(--primary-foreground)' }}
                        onClick={() => handleRunTemplate(template)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Run
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}
          />
          {/* Modal Content */}
          <div className="relative border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  style={{ color: 'var(--text-muted)' }}
                  className="hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label style={{ color: 'var(--text-secondary)' }}>Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    placeholder="Enter template name"
                  />
                </div>
                <div className="space-y-2">
                  <Label style={{ color: 'var(--text-secondary)' }}>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="border"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    placeholder="Describe what this template does"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label style={{ color: 'var(--text-secondary)' }}>Scan Type</Label>
                    <Select value={formData.scanType} onValueChange={(v) => setFormData({...formData, scanType: v})}>
                      <SelectTrigger className="border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        {scanTypes.filter(t => t.value !== 'all').map(type => (
                          <SelectItem key={type.value} value={type.value} className="hover:bg-slate-700" style={{ color: 'var(--text-primary)' }}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: 'var(--text-secondary)' }}>Profile</Label>
                    <Select value={formData.profile} onValueChange={(v) => setFormData({...formData, profile: v})}>
                      <SelectTrigger className="border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        {profiles.filter(p => p.value !== 'all').map(prof => (
                          <SelectItem key={prof.value} value={prof.value} className="hover:bg-slate-700" style={{ color: 'var(--text-primary)' }}>
                            {prof.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label style={{ color: 'var(--text-secondary)' }}>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger className="border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        {categories.filter(c => c.value !== 'all').map(cat => (
                          <SelectItem key={cat.value} value={cat.value} className="hover:bg-slate-700" style={{ color: 'var(--text-primary)' }}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: 'var(--text-secondary)' }}>Tags (comma-separated)</Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="border"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      placeholder="e.g., quick, network, cve"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.credentials}
                    onCheckedChange={(checked) => setFormData({...formData, credentials: checked})}
                  />
                  <Label style={{ color: 'var(--text-secondary)' }}>Requires Credentials</Label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      resetForm();
                    }}
                    className=""
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                    className=""
                    style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
