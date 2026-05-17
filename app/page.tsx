'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Github, 
  BookOpen, 
  Zap,
  ChevronDown,
  BarChart3,
  Network,
  FileText
} from 'lucide-react';
import { EpidemicGraph } from '@/lib/epidemic-graph';
import { NetworkFileFormat, GraphNode, GraphEdge, DailyReport } from '@/lib/types';
import { GraphVisualizer } from '@/components/graph-visualizer';
import { EvolutionChart, NewCasesChart } from '@/components/evolution-chart';
import { ControlPanel } from '@/components/control-panel';
import { StatsCards, SystemStatus } from '@/components/stats-cards';
import { DailyReportPanel, SimulationSummary } from '@/components/daily-report';
import { Button } from '@/components/ui/button';

// Red de ejemplo precargada
const SAMPLE_NETWORK: NetworkFileFormat = {
  metadata: {
    name: "Red Social de Medellín",
    description: "Red de contactos simulada para demostración",
    nodeCount: 20,
    edgeCount: 35
  },
  nodes: [
    { id: "1", name: "Juan" },
    { id: "2", name: "María" },
    { id: "3", name: "Carlos" },
    { id: "4", name: "Ana" },
    { id: "5", name: "Pedro" },
    { id: "6", name: "Laura" },
    { id: "7", name: "Diego" },
    { id: "8", name: "Sofía" },
    { id: "9", name: "Andrés" },
    { id: "10", name: "Camila" },
    { id: "11", name: "Luis" },
    { id: "12", name: "Valentina" },
    { id: "13", name: "Miguel" },
    { id: "14", name: "Isabella" },
    { id: "15", name: "David" },
    { id: "16", name: "Daniela" },
    { id: "17", name: "Santiago" },
    { id: "18", name: "Paula" },
    { id: "19", name: "Felipe" },
    { id: "20", name: "Gabriela" }
  ],
  edges: [
    { source: "1", target: "2" },
    { source: "1", target: "3" },
    { source: "1", target: "5" },
    { source: "2", target: "4" },
    { source: "2", target: "6" },
    { source: "3", target: "4" },
    { source: "3", target: "7" },
    { source: "4", target: "8" },
    { source: "5", target: "6" },
    { source: "5", target: "9" },
    { source: "6", target: "10" },
    { source: "7", target: "8" },
    { source: "7", target: "11" },
    { source: "8", target: "12" },
    { source: "9", target: "10" },
    { source: "9", target: "13" },
    { source: "10", target: "14" },
    { source: "11", target: "12" },
    { source: "11", target: "15" },
    { source: "12", target: "16" },
    { source: "13", target: "14" },
    { source: "13", target: "17" },
    { source: "14", target: "18" },
    { source: "15", target: "16" },
    { source: "15", target: "19" },
    { source: "16", target: "20" },
    { source: "17", target: "18" },
    { source: "17", target: "19" },
    { source: "18", target: "20" },
    { source: "19", target: "20" },
    { source: "1", target: "10" },
    { source: "2", target: "11" },
    { source: "5", target: "15" },
    { source: "7", target: "17" },
    { source: "3", target: "13" }
  ]
};

export default function EpidemiaSimulator() {
  // Motor de simulación
  const engineRef = useRef<EpidemicGraph>(new EpidemicGraph());
  
  // Estados
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [history, setHistory] = useState<DailyReport[]>([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [selectedInfected, setSelectedInfected] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isStabilized, setIsStabilized] = useState(false);
  const [params, setParams] = useState({ infectionRate: 0.3, recoveryDays: 7 });
  const [graphStats, setGraphStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'evolution' | 'cases'>('graph');

  // Cargar red de ejemplo al inicio
  useEffect(() => {
    handleLoadNetwork(SAMPLE_NETWORK);
  }, []);

  // Cargar red desde archivo
  const handleLoadNetwork = useCallback((data: NetworkFileFormat) => {
    const engine = engineRef.current;
    engine.loadFromFile(data);
    
    setNodes(engine.getNodes());
    setEdges(engine.getEdges());
    setGraphStats(engine.getStatistics());
    setHistory([]);
    setCurrentDay(0);
    setSelectedInfected([]);
    setIsStabilized(false);
    setIsRunning(false);
  }, []);

  // Establecer infectados iniciales
  const handleSetInitialInfected = useCallback((nodeIds: string[]) => {
    setSelectedInfected(nodeIds);
    
    if (nodeIds.length > 0) {
      const engine = engineRef.current;
      engine.setInitialInfected(nodeIds);
      setNodes(engine.getNodes());
      setHistory(engine.getHistory());
      setCurrentDay(engine.getCurrentDay());
      setIsStabilized(false);
    }
  }, []);

  // Configurar parámetros
  const handleSetParams = useCallback((infectionRate: number, recoveryDays: number) => {
    const engine = engineRef.current;
    engine.setParams(infectionRate, recoveryDays);
    setParams({ infectionRate, recoveryDays });
  }, []);

  // Simular un día
  const handleSimulateDay = useCallback(() => {
    const engine = engineRef.current;
    const report = engine.simulateOneDay();
    
    if (report) {
      setNodes([...engine.getNodes()]);
      setHistory([...engine.getHistory()]);
      setCurrentDay(engine.getCurrentDay());
    }
    
    setIsStabilized(engine.isStabilized());
  }, []);

  // Simular hasta estabilización (con animación)
  const handleSimulateAll = useCallback(async () => {
    setIsRunning(true);
    const engine = engineRef.current;
    
    const simulateStep = () => {
      if (!engine.isStabilized()) {
        engine.simulateOneDay();
        setNodes([...engine.getNodes()]);
        setHistory([...engine.getHistory()]);
        setCurrentDay(engine.getCurrentDay());
        
        setTimeout(simulateStep, 300); // 300ms entre cada día
      } else {
        setIsRunning(false);
        setIsStabilized(true);
      }
    };
    
    simulateStep();
  }, []);

  // Reiniciar simulación
  const handleReset = useCallback(() => {
    const engine = engineRef.current;
    if (selectedInfected.length > 0) {
      engine.setInitialInfected(selectedInfected);
    }
    setNodes(engine.getNodes());
    setHistory(engine.getHistory());
    setCurrentDay(engine.getCurrentDay());
    setIsStabilized(false);
    setIsRunning(false);
  }, [selectedInfected]);

  // Click en nodo del grafo
  const handleNodeClick = useCallback((nodeId: string) => {
    if (currentDay === 0 || history.length <= 1) {
      // Solo permitir selección en el día 0
      const newSelection = selectedInfected.includes(nodeId)
        ? selectedInfected.filter(id => id !== nodeId)
        : [...selectedInfected, nodeId];
      handleSetInitialInfected(newSelection);
    }
  }, [currentDay, history.length, selectedInfected, handleSetInitialInfected]);

  const currentReport = history[history.length - 1] || null;
  const hasData = nodes.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: isRunning ? 360 : 0 }}
                transition={{ duration: 2, repeat: isRunning ? Infinity : 0, ease: "linear" }}
              >
                <Activity className="w-6 h-6 text-primary" />
              </motion.div>
              <div>
                <h1 className="font-mono text-lg font-bold tracking-wider">
                  EPIDEMIA
                </h1>
                <p className="text-xs font-mono text-muted-foreground">
                  Simulador de Propagación Epidémica
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <SystemStatus 
                isRunning={isRunning} 
                isStabilized={isStabilized}
                hasData={hasData}
              />
              <Button variant="outline" size="sm" className="font-mono text-xs gap-2" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </Button>
              <Button variant="outline" size="sm" className="font-mono text-xs gap-2" asChild>
                <a href="/docs" target="_blank">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Docs</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <StatsCards 
          currentDay={currentDay}
          report={currentReport}
          graphStats={graphStats}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de Control */}
          <div className="lg:col-span-1 space-y-4">
            <ControlPanel
              onLoadNetwork={handleLoadNetwork}
              onSetInitialInfected={handleSetInitialInfected}
              onSetParams={handleSetParams}
              onSimulateDay={handleSimulateDay}
              onSimulateAll={handleSimulateAll}
              onReset={handleReset}
              isRunning={isRunning}
              isStabilized={isStabilized}
              hasData={hasData}
              availableNodes={nodes.map(n => ({ id: n.id, name: n.name }))}
              selectedInfected={selectedInfected}
              currentParams={params}
            />

            {/* Botón de red de ejemplo */}
            <Button
              variant="outline"
              className="w-full font-mono text-xs gap-2"
              onClick={() => handleLoadNetwork(SAMPLE_NETWORK)}
            >
              <Zap className="w-4 h-4" />
              Cargar red de ejemplo
            </Button>
          </div>

          {/* Visualización principal */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs de visualización */}
            <div className="flex gap-2 bg-card border border-border rounded-lg p-1">
              <button
                onClick={() => setActiveTab('graph')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded font-mono text-xs transition-colors ${
                  activeTab === 'graph' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Network className="w-4 h-4" />
                Grafo
              </button>
              <button
                onClick={() => setActiveTab('evolution')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded font-mono text-xs transition-colors ${
                  activeTab === 'evolution' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Evolución
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded font-mono text-xs transition-colors ${
                  activeTab === 'cases' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="w-4 h-4" />
                Casos/día
              </button>
            </div>

            {/* Contenido de visualización */}
            <div className="h-[500px]">
              <AnimatePresence mode="wait">
                {activeTab === 'graph' && (
                  <motion.div
                    key="graph"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <GraphVisualizer
                      nodes={nodes}
                      edges={edges}
                      onNodeClick={handleNodeClick}
                      selectedNodes={selectedInfected}
                    />
                  </motion.div>
                )}
                {activeTab === 'evolution' && (
                  <motion.div
                    key="evolution"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full bg-card border border-border rounded-lg p-4"
                  >
                    <EvolutionChart history={history} chartType="area" />
                  </motion.div>
                )}
                {activeTab === 'cases' && (
                  <motion.div
                    key="cases"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full bg-card border border-border rounded-lg p-4"
                  >
                    <NewCasesChart history={history} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Resumen de simulación */}
            {isStabilized && <SimulationSummary history={history} />}
          </div>

          {/* Panel de reportes */}
          <div className="lg:col-span-1 h-[600px]">
            <DailyReportPanel history={history} currentDay={currentDay} />
          </div>
        </div>

        {/* Footer info */}
        <footer className="border-t border-border pt-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono text-muted-foreground">
            <div>
              <h4 className="font-bold text-foreground mb-2">SOBRE EL PROYECTO</h4>
              <p>Simulador de propagación epidémica usando el modelo SIR (Susceptible-Infectado-Recuperado) con visualización de grafos en tiempo real.</p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-2">ESTRUCTURAS DE DATOS</h4>
              <ul className="space-y-1">
                <li>• Grafo: Lista de adyacencia</li>
                <li>• Arreglos: Nodos, historial, cola BFS</li>
                <li>• Map: Índices y búsqueda O(1)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-2">ALGORITMOS</h4>
              <ul className="space-y-1">
                <li>• BFS por niveles para propagación</li>
                <li>• Force-directed layout (D3.js)</li>
                <li>• Simulación estocástica</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border text-center text-xs font-mono text-muted-foreground">
            Desarrollado para el curso de Estructuras de Datos • Universidad de Medellín • 2026
          </div>
        </footer>
      </main>
    </div>
  );
}
