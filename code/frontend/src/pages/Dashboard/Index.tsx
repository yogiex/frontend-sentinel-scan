/**
 * SentinelScan Dashboard Index Page
 * Path: src/pages/Dashboard/Index.tsx
 *
 * Main dashboard page displaying stats cards, recent scans table,
 * and vulnerability distribution chart.
 * Uses mock data for now - will connect to real API later.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data - will be replaced with API calls later
const statsData = [
  { title: 'Total Assets', value: '1,234', change: '+12%', trend: 'up' },
  { title: 'Active Scans', value: '23', change: '+3', trend: 'up' },
  { title: 'Vulnerabilities', value: '456', change: '-8%', trend: 'down' },
  { title: 'Resolved', value: '89', change: '+15%', trend: 'up' },
];

const recentScans = [
  {
    id: '1',
    target: '192.168.1.0/24',
    status: 'completed',
    vulnerabilities: 23,
    severity: 'high',
    date: '2026-05-01',
  },
  {
    id: '2',
    target: 'example.com',
    status: 'running',
    vulnerabilities: 0,
    severity: 'medium',
    date: '2026-05-01',
  },
  {
    id: '3',
    target: '10.0.0.1',
    status: 'completed',
    vulnerabilities: 8,
    severity: 'low',
    date: '2026-04-30',
  },
  {
    id: '4',
    target: 'api.example.com',
    status: 'failed',
    vulnerabilities: 0,
    severity: 'high',
    date: '2026-04-30',
  },
  {
    id: '5',
    target: '172.16.0.0/16',
    status: 'completed',
    vulnerabilities: 45,
    severity: 'critical',
    date: '2026-04-29',
  },
];

const vulnerabilityData = [
  { name: 'Critical', value: 12, color: '#ef4444' },
  { name: 'High', value: 35, color: '#f97316' },
  { name: 'Medium', value: 58, color: '#eab308' },
  { name: 'Low', value: 89, color: '#22c55e' },
];

const severityBadgeVariant = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'default';
  }
};

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'running':
      return 'secondary';
    case 'failed':
      return 'destructive';
    default:
      return 'default';
  }
};

export function DashboardIndex() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your security scans and vulnerabilities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => (
          <Card key={stat.title} className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span
                  className={`text-sm ${
                    stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scans Table */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Target</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Vulns</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Severity</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentScans.map((scan) => (
                      <tr key={scan.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4 text-white font-mono">{scan.target}</td>
                        <td className="py-3 px-4">
                          <Badge variant={statusBadgeVariant(scan.status)}>
                            {scan.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{scan.vulnerabilities}</td>
                        <td className="py-3 px-4">
                          <Badge variant={severityBadgeVariant(scan.severity)}>
                            {scan.severity}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{scan.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vulnerability Chart */}
        <div>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Vulnerability Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={vulnerabilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {vulnerabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4">
                {vulnerabilityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-400">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
