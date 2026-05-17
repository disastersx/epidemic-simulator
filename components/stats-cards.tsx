'use client';

import { motion } from 'framer-motion';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  Heart, 
  TrendingUp,
  Clock
} from 'lucide-react';
import { DailyReport } from '@/lib/types';

interface StatsCardsProps {
  currentDay: number;
  report: DailyReport | null;
  graphStats?: {
    nodeCount: number;
    edgeCount: number;
    avgDegree: number;
  };
}

export function StatsCards({ currentDay, report, graphStats }: StatsCardsProps) {
  const stats = [
    {
      label: 'DÍA ACTUAL',
      value: currentDay,
      icon: Clock,
      color: 'text-foreground',
      bgColor: 'bg-secondary',
      description: 'Tiempo de simulación'
    },
    {
      label: 'POBLACIÓN TOTAL',
      value: report?.totalPopulation || graphStats?.nodeCount || 0,
      icon: Users,
      color: 'text-foreground',
      bgColor: 'bg-secondary',
      description: `${graphStats?.edgeCount || 0} contactos`
    },
    {
      label: 'SUSCEPTIBLES',
      value: report?.susceptible || 0,
      icon: Users,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
      description: 'En riesgo de infección',
      glow: 'shadow-[0_0_15px_rgba(96,165,250,0.2)]'
    },
    {
      label: 'INFECTADOS',
      value: report?.infected || 0,
      icon: AlertTriangle,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
      description: `+${report?.newInfections.length || 0} hoy`,
      glow: 'shadow-[0_0_15px_rgba(248,113,113,0.3)]',
      pulse: (report?.infected || 0) > 0
    },
    {
      label: 'RECUPERADOS',
      value: report?.recovered || 0,
      icon: Heart,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
      description: `+${report?.newRecoveries.length || 0} hoy`,
      glow: 'shadow-[0_0_15px_rgba(74,222,128,0.2)]'
    },
    {
      label: 'R₀ ESTIMADO',
      value: report?.r0Estimate?.toFixed(2) || '0.00',
      icon: TrendingUp,
      color: (report?.r0Estimate || 0) > 1 ? 'text-chart-2' : 'text-chart-3',
      bgColor: (report?.r0Estimate || 0) > 1 ? 'bg-chart-2/10' : 'bg-chart-3/10',
      description: (report?.r0Estimate || 0) > 1 ? 'Epidemia en expansión' : 'Epidemia controlada'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`
            relative overflow-hidden rounded-lg border border-border p-4
            ${stat.bgColor} ${stat.glow || ''}
            transition-all duration-300 hover:scale-[1.02]
          `}
        >
          {/* Efecto de pulsación para infectados activos */}
          {stat.pulse && (
            <motion.div
              className="absolute inset-0 bg-chart-2/10"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
                {stat.label}
              </span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            
            <div className={`text-2xl font-bold font-mono ${stat.color}`}>
              {stat.value}
            </div>
            
            <div className="text-[10px] font-mono text-muted-foreground mt-1">
              {stat.description}
            </div>
          </div>

          {/* Línea decorativa */}
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${stat.color} opacity-30`} />
        </motion.div>
      ))}
    </div>
  );
}

// Componente de indicador de estado del sistema
export function SystemStatus({ 
  isRunning, 
  isStabilized,
  hasData
}: { 
  isRunning: boolean; 
  isStabilized: boolean;
  hasData: boolean;
}) {
  let status: 'idle' | 'running' | 'stabilized' | 'no-data' = 'idle';
  
  if (!hasData) status = 'no-data';
  else if (isRunning) status = 'running';
  else if (isStabilized) status = 'stabilized';

  const statusConfig = {
    'no-data': {
      label: 'SIN DATOS',
      color: 'bg-muted-foreground',
      textColor: 'text-muted-foreground',
      description: 'Cargue una red de contactos'
    },
    'idle': {
      label: 'PREPARADO',
      color: 'bg-chart-1',
      textColor: 'text-chart-1',
      description: 'Listo para simular'
    },
    'running': {
      label: 'SIMULANDO',
      color: 'bg-chart-2',
      textColor: 'text-chart-2',
      description: 'Propagación en curso',
      pulse: true
    },
    'stabilized': {
      label: 'ESTABILIZADO',
      color: 'bg-chart-3',
      textColor: 'text-chart-3',
      description: 'Simulación completada'
    }
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2">
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${config.color}`} />
        {config.pulse && (
          <motion.div
            className={`absolute inset-0 w-3 h-3 rounded-full ${config.color}`}
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
      <div>
        <div className={`text-xs font-mono font-bold ${config.textColor}`}>
          {config.label}
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">
          {config.description}
        </div>
      </div>
    </div>
  );
}
