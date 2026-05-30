/**
 * SentinelScan Settings Page
 * Path: src/pages/Dashboard/Settings/Settings.tsx
 *
 * MVP page for system configuration and preferences.
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type SettingsTab = 'general' | 'notifications' | 'security' | 'integrations';

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Configure system preferences and integrations</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border rounded-lg p-1 w-fit" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={activeTab === tab.id
              ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }
              : { color: 'var(--text-muted)', '--tw-hover-color': 'var(--text-primary)', '--tw-hover-bg': 'var(--bg-hover)' } as React.CSSProperties
            }
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && <GeneralSettings />}
      {activeTab === 'notifications' && <NotificationSettings />}
      {activeTab === 'security' && <SecuritySettings />}
      {activeTab === 'integrations' && <IntegrationSettings />}
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-4">
      <Card className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg" style={{ color: 'var(--text-primary)' }}>System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-1" style={{ color: 'var(--text-muted)' }}>System Name</label>
              <input
                type="text"
                defaultValue="SentinelScan"
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="text-sm block mb-1" style={{ color: 'var(--text-muted)' }}>Default Scan Profile</label>
              <select className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                <option>Quick</option>
                <option selected>Standard</option>
                <option>Full</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-1" style={{ color: 'var(--text-muted)' }}>Max Concurrent Scans</label>
              <input
                type="number"
                defaultValue={5}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="text-sm block mb-1" style={{ color: 'var(--text-muted)' }}>Scan Timeout (minutes)</label>
              <input
                type="number"
                defaultValue={120}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Auto-delete completed scans</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Automatically remove scans older than specified days</p>
            </div>
            <ToggleSwitch defaultChecked={false} />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Retention Period</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Days to keep scan results before auto-deletion</p>
            </div>
            <input
              type="number"
              defaultValue={90}
              className="w-24 px-3 py-2 rounded-lg border text-sm text-center focus:outline-none"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          Reset Defaults
        </Button>
        <Button className="" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-4">
      <Card className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg" style={{ color: 'var(--text-primary)' }}>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Scan Complete</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Notify when a scan finishes</p>
            </div>
            <ToggleSwitch defaultChecked={true} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Critical Vulnerability Found</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Immediate alert for critical findings</p>
            </div>
            <ToggleSwitch defaultChecked={true} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Scan Failed</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Notify when a scan encounters errors</p>
            </div>
            <ToggleSwitch defaultChecked={true} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Weekly Summary</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Weekly digest of all scan activities</p>
            </div>
            <ToggleSwitch defaultChecked={false} />
          </div>
        </CardContent>
      </Card>

      <Card className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg" style={{ color: 'var(--text-primary)' }}>Webhook Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm block mb-1" style={{ color: 'var(--text-muted)' }}>Webhook URL</label>
            <input
              type="text"
              placeholder="https://hooks.slack.com/services/..."
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)', '--tw-placeholder-opacity': 1 } as React.CSSProperties}
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Enable Webhooks</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Send notifications to external services</p>
            </div>
            <ToggleSwitch defaultChecked={false} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          Test Notification
        </Button>
        <Button className="" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-4">
      <Card className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg" style={{ color: 'var(--text-primary)' }}>Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Two-Factor Authentication</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Require 2FA for all admin users</p>
            </div>
            <ToggleSwitch defaultChecked={true} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Session Timeout</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Minutes of inactivity before auto-logout</p>
            </div>
            <input
              type="number"
              defaultValue={30}
              className="w-24 px-3 py-2 rounded-lg border text-sm text-center focus:outline-none"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Password Policy</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Enforce strong password requirements</p>
            </div>
            <ToggleSwitch defaultChecked={true} />
          </div>
        </CardContent>
      </Card>

      <Card className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg" style={{ color: 'var(--text-primary)' }}>API Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>API Rate Limiting</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Requests per minute per API key</p>
            </div>
            <input
              type="number"
              defaultValue={100}
              className="w-24 px-3 py-2 rounded-lg border text-sm text-center focus:outline-none"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>CORS Allowed Origins</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Comma-separated list of allowed domains</p>
            </div>
            <input
              type="text"
              defaultValue="*"
              className="w-48 px-3 py-2 rounded-lg border text-sm text-center focus:outline-none"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          Regenerate API Keys
        </Button>
        <Button className="" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function IntegrationSettings() {
  const integrations = [
    { name: 'Slack', icon: '💬', description: 'Send scan notifications to Slack channels', connected: true },
    { name: 'Jira', icon: '📋', description: 'Create tickets for critical vulnerabilities', connected: false },
    { name: 'Splunk', icon: '📊', description: 'Forward scan results to Splunk SIEM', connected: false },
    { name: 'DefectDojo', icon: '🛡️', description: 'Sync findings with DefectDojo', connected: true },
    { name: 'AWS Security Hub', icon: '☁️', description: 'Push findings to AWS Security Hub', connected: false },
    { name: 'PagerDuty', icon: '', description: 'Alert on critical findings via PagerDuty', connected: false },
  ];

  return (
    <div className="space-y-4">
      <Card className="border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg" style={{ color: 'var(--text-primary)' }}>Connected Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between p-3 rounded-lg border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{integration.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{integration.description}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                style={integration.connected
                  ? { borderColor: 'var(--success)', color: 'var(--success)' }
                  : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                }
                onMouseEnter={(e) => {
                  if (!integration.connected) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!integration.connected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {integration.connected ? 'Connected' : 'Connect'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button className="" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          + Add Integration
        </Button>
      </div>
    </div>
  );
}

function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      type="button"
      onClick={() => setChecked(!checked)}
      className="relative w-10 h-5 rounded-full transition-colors focus:outline-none"
      style={{ backgroundColor: checked ? 'var(--primary)' : 'var(--bg-hover)' }}
    >
      <div
        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}
