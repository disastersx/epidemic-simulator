'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Play, 
  Pause, 
  SkipForward, 
  RefreshCw, 
  Sliders,
  FileJson,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { NetworkFileFormat } from '@/lib/types';

interface ControlPanelProps {
  onLoadNetwork: (data: NetworkFileFormat) => void;
  onSetInitialInfected: (nodeIds: string[]) => void;
  onSetParams: (infectionRate: number, recoveryDays: number) => void;
  onSimulateDay: () => void;
  onSimulateAll: () => void;
  onReset: () => void;
  isRunning: boolean;
  isStabilized: boolean;
  hasData: boolean;
  availableNodes: Array<{ id: string; name: string }>;
  selectedInfected: string[];
  currentParams: { infectionRate: number; recoveryDays: number };
}

export function ControlPanel({
  onLoadNetwork,
  onSetInitialInfected,
  onSetParams,
  onSimulateDay,
  onSimulateAll,
  onReset,
  isRunning,
  isStabilized,
  hasData,
  availableNodes,
  selectedInfected,
  currentParams
}: ControlPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [infectionRate, setInfectionRate] = useState(currentParams.infectionRate);
  const [recoveryDays, setRecoveryDays] = useState(currentParams.recoveryDays);
  const [showNodeSelector, setShowNodeSelector] = useState(false);
  const [fileStatus, setFileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileStatus('loading');
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data: NetworkFileFormat = JSON.parse(content);
        
        // Validar estructura básica
        if (!data.nodes || !Array.isArray(data.nodes) || !data.edges || !Array.isArray(data.edges)) {
          throw new Error('El archivo debe contener arrays "nodes" y "edges"');
        }

        onLoadNetwork(data);
        setFileStatus('success');
        setTimeout(() => setFileStatus('idle'), 2000);
      } catch (err) {
        setFileStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Error al procesar archivo');
        setTimeout(() => setFileStatus('idle'), 3000);
      }
    };

    reader.onerror = () => {
      setFileStatus('error');
      setErrorMessage('Error al leer el archivo');
      setTimeout(() => setFileStatus('idle'), 3000);
    };

    reader.readAsText(file);
    
    // Limpiar input para permitir recargar el mismo archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onLoadNetwork]);

  const handleApplyParams = useCallback(() => {
    onSetParams(infectionRate, recoveryDays);
  }, [infectionRate, recoveryDays, onSetParams]);

  const toggleNodeSelection = useCallback((nodeId: string) => {
    const newSelection = selectedInfected.includes(nodeId)
      ? selectedInfected.filter(id => id !== nodeId)
      : [...selectedInfected, nodeId];
    onSetInitialInfected(newSelection);
  }, [selectedInfected, onSetInitialInfected]);

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="font-mono text-sm font-bold tracking-wider text-foreground">
          PANEL DE CONTROL
        </h2>
        <Sliders className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Cargar archivo */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-muted-foreground tracking-wider">
          1. CARGAR RED DE CONTACTOS
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          className="w-full justify-start gap-2 font-mono text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={fileStatus === 'loading'}
        >
          {fileStatus === 'loading' && (
            <RefreshCw className="w-4 h-4 animate-spin" />
          )}
          {fileStatus === 'success' && (
            <CheckCircle className="w-4 h-4 text-chart-3" />
          )}
          {fileStatus === 'error' && (
            <AlertCircle className="w-4 h-4 text-destructive" />
          )}
          {fileStatus === 'idle' && (
            <Upload className="w-4 h-4" />
          )}
          <span>
            {fileStatus === 'loading' && 'Cargando...'}
            {fileStatus === 'success' && 'Red cargada'}
            {fileStatus === 'error' && 'Error'}
            {fileStatus === 'idle' && 'Seleccionar archivo JSON'}
          </span>
        </Button>
        {fileStatus === 'error' && (
          <p className="text-xs text-destructive font-mono">{errorMessage}</p>
        )}
      </div>

      {/* Seleccionar infectados iniciales */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-muted-foreground tracking-wider">
          2. SELECCIONAR INFECTADOS INICIALES
        </label>
        <Button
          variant="outline"
          className="w-full justify-between font-mono text-xs"
          onClick={() => setShowNodeSelector(!showNodeSelector)}
          disabled={!hasData}
        >
          <span>{selectedInfected.length} nodo(s) seleccionado(s)</span>
          <span className="text-muted-foreground">
            {showNodeSelector ? '▲' : '▼'}
          </span>
        </Button>
        
        <AnimatePresence>
          {showNodeSelector && availableNodes.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="max-h-32 overflow-y-auto bg-secondary/50 rounded-md p-2 space-y-1">
                {availableNodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => toggleNodeSelection(node.id)}
                    className={`
                      w-full text-left px-2 py-1 rounded text-xs font-mono
                      transition-colors
                      ${selectedInfected.includes(node.id)
                        ? 'bg-chart-2/20 text-chart-2'
                        : 'hover:bg-secondary text-foreground'
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        selectedInfected.includes(node.id) ? 'bg-chart-2' : 'bg-muted'
                      }`} />
                      {node.name}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Parámetros */}
      <div className="space-y-3">
        <label className="text-xs font-mono text-muted-foreground tracking-wider">
          3. CONFIGURAR PARÁMETROS
        </label>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span>Tasa de contagio</span>
            <span className="text-primary">{(infectionRate * 100).toFixed(0)}%</span>
          </div>
          <Slider
            value={[infectionRate]}
            onValueChange={([v]) => setInfectionRate(v)}
            min={0}
            max={1}
            step={0.05}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span>Días de recuperación</span>
            <span className="text-primary">{recoveryDays} días</span>
          </div>
          <Slider
            value={[recoveryDays]}
            onValueChange={([v]) => setRecoveryDays(v)}
            min={1}
            max={30}
            step={1}
            className="w-full"
          />
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="w-full font-mono text-xs"
          onClick={handleApplyParams}
          disabled={!hasData}
        >
          Aplicar parámetros
        </Button>
      </div>

      {/* Controles de simulación */}
      <div className="space-y-2 pt-2 border-t border-border">
        <label className="text-xs font-mono text-muted-foreground tracking-wider">
          4. EJECUTAR SIMULACIÓN
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onSimulateDay}
            disabled={!hasData || selectedInfected.length === 0 || isStabilized}
            className="font-mono text-xs gap-2"
          >
            <SkipForward className="w-4 h-4" />
            +1 Día
          </Button>
          
          <Button
            onClick={onSimulateAll}
            disabled={!hasData || selectedInfected.length === 0 || isStabilized}
            variant="default"
            className="font-mono text-xs gap-2 bg-primary hover:bg-primary/90"
          >
            <Play className="w-4 h-4" />
            Auto
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={onReset}
          disabled={!hasData}
          className="w-full font-mono text-xs gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reiniciar simulación
        </Button>
      </div>

      {/* Info rápida */}
      <div className="text-[10px] font-mono text-muted-foreground bg-secondary/30 rounded p-2 space-y-1">
        <p>• Modelo SIR: Susceptible → Infectado → Recuperado</p>
        <p>• BFS por niveles para propagación</p>
        <p>• Click en nodos del grafo para seleccionar</p>
      </div>
    </div>
  );
}
