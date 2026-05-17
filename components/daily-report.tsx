'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FileText, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { DailyReport } from '@/lib/types';

interface DailyReportPanelProps {
  history: DailyReport[];
  currentDay: number;
}

export function DailyReportPanel({ history, currentDay }: DailyReportPanelProps) {
  if (history.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 h-full flex flex-col">
        <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-mono text-sm font-bold tracking-wider">REPORTES DIARIOS</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
          Inicie la simulación para ver reportes
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-mono text-sm font-bold tracking-wider">REPORTES DIARIOS</h3>
        <span className="ml-auto text-xs font-mono text-muted-foreground">
          {history.length} días registrados
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <AnimatePresence>
          {[...history].reverse().map((report, index) => (
            <motion.div
              key={report.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                bg-secondary/30 rounded-lg p-3 border border-border/50
                ${report.day === currentDay ? 'ring-1 ring-primary/50' : ''}
              `}
            >
              {/* Header del día */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-primary">
                    DÍA {report.day}
                  </span>
                  {report.day === currentDay && (
                    <span className="text-[10px] font-mono bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                      ACTUAL
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {(report.r0Estimate || 0) > 1 ? (
                    <TrendingUp className="w-3 h-3 text-chart-2" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-chart-3" />
                  )}
                  <span className={`text-[10px] font-mono ${
                    (report.r0Estimate || 0) > 1 ? 'text-chart-2' : 'text-chart-3'
                  }`}>
                    R₀: {report.r0Estimate?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              {/* Estadísticas del día */}
              <div className="grid grid-cols-3 gap-2 text-center mb-2">
                <div className="bg-chart-1/10 rounded px-2 py-1">
                  <div className="text-[10px] font-mono text-chart-1">S</div>
                  <div className="text-sm font-mono font-bold text-chart-1">{report.susceptible}</div>
                </div>
                <div className="bg-chart-2/10 rounded px-2 py-1">
                  <div className="text-[10px] font-mono text-chart-2">I</div>
                  <div className="text-sm font-mono font-bold text-chart-2">{report.infected}</div>
                </div>
                <div className="bg-chart-3/10 rounded px-2 py-1">
                  <div className="text-[10px] font-mono text-chart-3">R</div>
                  <div className="text-sm font-mono font-bold text-chart-3">{report.recovered}</div>
                </div>
              </div>

              {/* Cambios del día */}
              {(report.newInfections.length > 0 || report.newRecoveries.length > 0) && (
                <div className="text-[10px] font-mono text-muted-foreground space-y-0.5">
                  {report.newInfections.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-chart-2" />
                      <span>+{report.newInfections.length} nuevas infecciones</span>
                    </div>
                  )}
                  {report.newRecoveries.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-chart-3" />
                      <span>+{report.newRecoveries.length} recuperaciones</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Componente de resumen final
export function SimulationSummary({ history }: { history: DailyReport[] }) {
  if (history.length === 0) return null;

  const lastReport = history[history.length - 1];
  const peakInfected = Math.max(...history.map(r => r.infected));
  const peakDay = history.find(r => r.infected === peakInfected)?.day || 0;
  const totalInfected = lastReport.infected + lastReport.recovered;
  const infectionRate = ((totalInfected / lastReport.totalPopulation) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-primary/30 rounded-lg p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="font-mono text-sm font-bold tracking-wider text-primary">
          RESUMEN DE SIMULACIÓN
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-secondary/30 rounded p-2 text-center">
          <div className="text-[10px] font-mono text-muted-foreground">DURACIÓN</div>
          <div className="text-lg font-mono font-bold">{lastReport.day} días</div>
        </div>
        <div className="bg-secondary/30 rounded p-2 text-center">
          <div className="text-[10px] font-mono text-muted-foreground">PICO INFECTADOS</div>
          <div className="text-lg font-mono font-bold text-chart-2">{peakInfected}</div>
          <div className="text-[10px] font-mono text-muted-foreground">Día {peakDay}</div>
        </div>
        <div className="bg-secondary/30 rounded p-2 text-center">
          <div className="text-[10px] font-mono text-muted-foreground">TOTAL AFECTADOS</div>
          <div className="text-lg font-mono font-bold">{totalInfected}</div>
          <div className="text-[10px] font-mono text-muted-foreground">{infectionRate}% población</div>
        </div>
        <div className="bg-secondary/30 rounded p-2 text-center">
          <div className="text-[10px] font-mono text-muted-foreground">NO INFECTADOS</div>
          <div className="text-lg font-mono font-bold text-chart-1">{lastReport.susceptible}</div>
        </div>
      </div>
    </motion.div>
  );
}
