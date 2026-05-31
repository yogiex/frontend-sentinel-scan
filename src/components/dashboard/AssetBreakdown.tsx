/**
 * SentinelScan Asset Breakdown Component
 * Donut chart showing asset distribution by type
 */
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AssetCategory {
  name: string;
  count: number;
  color: string;
}

interface AssetBreakdownProps {
  categories: AssetCategory[];
}

export function AssetBreakdown({ categories }: AssetBreakdownProps) {
  const total = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div>
      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="count"
            >
              {categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
              }}
              // @ts-expect-error - Recharts type definition issue
              formatter={(value: number) => [`${value} assets`, 'Count']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            <div>
              <p style={{ color: 'var(--text-muted)' }} className="text-xs">{cat.name}</p>
              <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">
                {cat.count}{' '}
                <span style={{ color: 'var(--text-secondary)' }} className="text-xs">
                  ({Math.round((cat.count / total) * 100)}%)
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
