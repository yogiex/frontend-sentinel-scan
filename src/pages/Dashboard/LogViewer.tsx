/**
 * SentinelScan — Audit Trails Page
 * Path: src/pages/Dashboard/LogViewer.tsx
 *
 * Light theme using Slate & Indigo palette
 */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, AlertOctagon } from 'lucide-react';
import { StatsPanel } from '@/components/audit/StatsPanel';
import { FilterBar } from '@/components/audit/FilterBar';
import { LogTable } from '@/components/audit/LogTable';
import { auditLogger } from '@/lib/logger';
import { loadEntries, setFilter, setLoading } from '@/store/slices/auditLogSlice';
import { selectFilteredEntries, selectStats, selectLoading } from '@/store/slices/auditLogSlice';
import type { LogLevel, AuditCategory } from '@/lib/logger';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type LogType = 'access' | 'errors';

export function LogViewer() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<LogType>('access');
  const [searchInput, setSearchInput] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory | 'all'>('all');
  
  const filteredEntries = useSelector(selectFilteredEntries);
  const stats = useSelector(selectStats);
  const loading = useSelector(selectLoading);

  // Load logs based on active tab
  const loadLogs = () => {
    dispatch(setLoading(true));
    const entries = activeTab === 'access' 
      ? auditLogger.getAccessLogs() 
      : auditLogger.getErrorLogs();
    dispatch(loadEntries(entries));
    dispatch(setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, [activeTab, dispatch]);

  const handleLevelChange = (level: LogLevel | 'all') => {
    setLevelFilter(level);
    dispatch(setFilter({ level: level as LogLevel | 'all' }));
  };

  const handleCategoryChange = (category: AuditCategory | 'all') => {
    setCategoryFilter(category);
    dispatch(setFilter({ category: category as AuditCategory | 'all' }));
  };

  const handleSearchChange = (search: string) => {
    setSearchInput(search);
    dispatch(setFilter({ search }));
  };

  const handleDateRangeChange = (range: { from?: string; to?: string }) => {
    dispatch(setFilter({ from: range.from || '', to: range.to || '' }));
  };

  const handleRefresh = () => {
    loadLogs();
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (activeTab === 'access') {
      auditLogger.downloadAccessLog(format);
    } else {
      auditLogger.downloadErrorLog(format);
    }
  };

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const handleClear = () => {
    const title = activeTab === 'access' ? 'Clear Access Logs' : 'Clear Error Logs';
    const description = activeTab === 'access' 
      ? 'Are you sure you want to clear all access logs? This cannot be undone.'
      : 'Are you sure you want to clear all error logs? This cannot be undone.';
    
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      onConfirm: () => {
        if (activeTab === 'access') {
          auditLogger.clearAccessLogs();
        } else {
          auditLogger.clearErrorLogs();
        }
        loadLogs();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleCancelConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900">
          {activeTab === 'access' ? (
            <FileText className="w-7 h-7 text-indigo-600" />
          ) : (
            <AlertOctagon className="w-7 h-7 text-red-500" />
          )}
          {activeTab === 'access' ? 'Audit Trail' : 'Error Trail'}
        </h1>
        <p className="mt-1 text-slate-500">
          {activeTab === 'access' 
            ? 'All system activity and user actions' 
            : 'Error and critical issues requiring attention'}
        </p>
      </div>

      {/* Stats Panel */}
      <StatsPanel stats={stats} />

      {/* Tab Selector */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LogType)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="access" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4" />
            Access Log
          </TabsTrigger>
          <TabsTrigger value="errors" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <AlertOctagon className="w-4 h-4" />
            Error Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="access">
          {/* Filter Bar */}
          <FilterBar
            levelFilter={levelFilter}
            categoryFilter={categoryFilter}
            searchInput={searchInput}
            onLevelChange={handleLevelChange}
            onCategoryChange={handleCategoryChange}
            onSearchChange={handleSearchChange}
            onDateRangeChange={handleDateRangeChange}
            onRefresh={handleRefresh}
            onExport={handleExport}
            onClear={handleClear}
            loading={loading}
          />

          {/* Log Table */}
          <LogTable 
            entries={filteredEntries} 
            onExport={handleExport}
            onClear={handleClear}
          />
        </TabsContent>

        <TabsContent value="errors">
          {/* Filter Bar */}
          <FilterBar
            levelFilter={levelFilter}
            categoryFilter={categoryFilter}
            searchInput={searchInput}
            onLevelChange={handleLevelChange}
            onCategoryChange={handleCategoryChange}
            onSearchChange={handleSearchChange}
            onDateRangeChange={handleDateRangeChange}
            onRefresh={handleRefresh}
            onExport={handleExport}
            onClear={handleClear}
            loading={loading}
          />

          {/* Log Table */}
          <LogTable 
            entries={filteredEntries} 
            onExport={handleExport}
            onClear={handleClear}
          />
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onCancel={handleCancelConfirm}
        isDestructive={true}
        confirmText="Clear Logs"
        cancelText="Cancel"
      />
    </div>
  );
}
