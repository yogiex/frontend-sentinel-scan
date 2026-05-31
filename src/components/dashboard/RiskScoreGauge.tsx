/**
 * SentinelScan Risk Score Gauge Component
 * Displays security posture score (0-100) with grade and trend
 */
import { ResponsiveContainer, RadialBarChart, RadialBar, Cell } from 'recharts';

interface RiskScoreGaugeProps {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  trend: 'up' | 'down' | 'stable';
}

// Grade colors using CSS variables for theme support
const getGradeColor = (grade: string) => {
  const gradeColors: Record<string, string> = {
    'A': 'var(--success)',
    'B': 'var(--primary)',
    'C': 'var(--warning)',
    'D': 'var(--danger)',
    'F': 'var(--danger)',
  };
  return gradeColors[grade] || 'var(--text-muted)';
};

const gradeDescriptions: Record<string, string> = {
  A: 'Excellent',
  B: 'Good',
  C: 'Fair',
  D: 'Poor',
  F: 'Critical',
};

export function RiskScoreGauge({ score, grade, trend }: RiskScoreGaugeProps) {
  const data = [{ name: 'Score', value: score }];
  const gradeColor = getGradeColor(grade);

  return (
    <div className="flex items-center gap-6">
      {/* Gauge Chart */}
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={180}
            endAngle={-180}
          >
            <RadialBar
              background={{ fill: 'var(--bg-secondary)' }}
              // @ts-expect-error - Recharts type definitions missing clockwise prop
              clockwise
              dataKey="value"
              cornerRadius={10}
            >
              <Cell fill={gradeColor} />
            </RadialBar>
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="text-3xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {score}
          </span>
          <span 
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            /100
          </span>
        </div>
      </div>

      {/* Score Details */}
      <div className="space-y-2">
        <div>
          <p 
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Security Posture
          </p>
          <div className="flex items-center gap-2">
            <span
              className="text-2xl font-bold"
              style={{ color: gradeColor }}
            >
              Grade {grade}
            </span>
            <span 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              ({gradeDescriptions[grade]})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Trend:
          </span>
          <span
            className="text-sm font-medium"
            style={{ 
              color: trend === 'up' ? 'var(--success)' : trend === 'down' ? 'var(--danger)' : 'var(--text-muted)'
            }}
          >
            {trend === 'up' ? '↑ Improving' : trend === 'down' ? '↓ Declining' : '→ Stable'}
          </span>
        </div>
      </div>
    </div>
  );
}
