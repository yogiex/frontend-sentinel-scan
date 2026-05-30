/**
 * SentinelScan Scan Trend Chart Component
 * Line chart showing scan activity over the last 7 days
 */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ScanTrendData {
  day: string;
  scans: number;
  vulnerabilities: number;
}

interface ScanTrendChartProps {
  data: ScanTrendData[];
}

export function ScanTrendChart({ data }: ScanTrendChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="day"
            stroke="var(--text-secondary)"
            fontSize={12}
          />
          <YAxis stroke="var(--text-secondary)" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
          />
          <Line
            type="monotone"
            dataKey="scans"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ fill: 'var(--primary)', r: 4 }}
            name="Scans"
          />
          <Line
            type="monotone"
            dataKey="vulnerabilities"
            stroke="var(--danger)"
            strokeWidth={2}
            dot={{ fill: 'var(--danger)', r: 4 }}
            name="Vulnerabilities"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
