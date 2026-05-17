'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { DailyReport } from '@/lib/types';

interface EvolutionChartProps {
  history: DailyReport[];
  chartType?: 'line' | 'area' | 'stacked';
}

const COLORS = {
  susceptible: '#60a5fa',
  infected: '#f87171',
  recovered: '#4ade80'
};

export function EvolutionChart({ history, chartType = 'area' }: EvolutionChartProps) {
  const chartData = useMemo(() => {
    return history.map(report => ({
      día: report.day,
      Susceptibles: report.susceptible,
      Infectados: report.infected,
      Recuperados: report.recovered,
      'R0 Est.': report.r0Estimate ? parseFloat(report.r0Estimate.toFixed(2)) : 0
    }));
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
        Esperando datos de simulación...
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-popover border border-border rounded-lg p-3 shadow-xl"
        >
          <p className="font-mono text-sm font-bold mb-2">Día {label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs font-mono">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-bold">{entry.value}</span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  if (chartType === 'stacked') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorSusceptible" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.susceptible} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.susceptible} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorInfected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.infected} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.infected} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.recovered} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.recovered} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            dataKey="día" 
            stroke="#64748b" 
            fontSize={10} 
            fontFamily="monospace"
            tickLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={10} 
            fontFamily="monospace"
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              fontFamily: 'monospace', 
              fontSize: '11px',
              paddingTop: '10px'
            }} 
          />
          <Area
            type="monotone"
            dataKey="Susceptibles"
            stackId="1"
            stroke={COLORS.susceptible}
            fill="url(#colorSusceptible)"
          />
          <Area
            type="monotone"
            dataKey="Infectados"
            stackId="1"
            stroke={COLORS.infected}
            fill="url(#colorInfected)"
          />
          <Area
            type="monotone"
            dataKey="Recuperados"
            stackId="1"
            stroke={COLORS.recovered}
            fill="url(#colorRecovered)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.susceptible} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.susceptible} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.infected} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.infected} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.recovered} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.recovered} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            dataKey="día" 
            stroke="#64748b" 
            fontSize={10} 
            fontFamily="monospace"
            tickLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={10} 
            fontFamily="monospace"
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              fontFamily: 'monospace', 
              fontSize: '11px',
              paddingTop: '10px'
            }} 
          />
          <Area
            type="monotone"
            dataKey="Susceptibles"
            stroke={COLORS.susceptible}
            fill="url(#colorS)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Infectados"
            stroke={COLORS.infected}
            fill="url(#colorI)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Recuperados"
            stroke={COLORS.recovered}
            fill="url(#colorR)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis 
          dataKey="día" 
          stroke="#64748b" 
          fontSize={10} 
          fontFamily="monospace"
          tickLine={false}
        />
        <YAxis 
          stroke="#64748b" 
          fontSize={10} 
          fontFamily="monospace"
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ 
            fontFamily: 'monospace', 
            fontSize: '11px',
            paddingTop: '10px'
          }} 
        />
        <Line
          type="monotone"
          dataKey="Susceptibles"
          stroke={COLORS.susceptible}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: COLORS.susceptible }}
        />
        <Line
          type="monotone"
          dataKey="Infectados"
          stroke={COLORS.infected}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: COLORS.infected }}
        />
        <Line
          type="monotone"
          dataKey="Recuperados"
          stroke={COLORS.recovered}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: COLORS.recovered }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Gráfico de nuevas infecciones por día
export function NewCasesChart({ history }: { history: DailyReport[] }) {
  const chartData = useMemo(() => {
    return history.map(report => ({
      día: report.day,
      'Nuevas Infecciones': report.newInfections.length,
      'Recuperaciones': report.newRecoveries.length
    }));
  }, [history]);

  if (history.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis 
          dataKey="día" 
          stroke="#64748b" 
          fontSize={10} 
          fontFamily="monospace"
          tickLine={false}
        />
        <YAxis 
          stroke="#64748b" 
          fontSize={10} 
          fontFamily="monospace"
          tickLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--popover))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '11px'
          }} 
        />
        <Legend 
          wrapperStyle={{ 
            fontFamily: 'monospace', 
            fontSize: '11px',
            paddingTop: '10px'
          }} 
        />
        <Bar dataKey="Nuevas Infecciones" fill={COLORS.infected} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Recuperaciones" fill={COLORS.recovered} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
