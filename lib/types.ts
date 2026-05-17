// =====================================
// TIPOS PARA EL SIMULADOR EPIDÉMICO
// Modelo SIR: Susceptible - Infectado - Recuperado
// =====================================

export type NodeState = 'susceptible' | 'infected' | 'recovered';

export interface GraphNode {
  id: string;
  name: string;
  state: NodeState;
  x?: number;
  y?: number;
  dayInfected?: number;  // Día en que se infectó
  dayRecovered?: number; // Día en que se recuperó
}

export interface GraphEdge {
  source: string;
  target: string;
  weight?: number; // Representa la frecuencia de contacto
}

export interface ContactGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SimulationParams {
  infectionRate: number;     // Probabilidad de contagio (0-1)
  recoveryDays: number;      // Días para recuperarse
  initialInfected: string[]; // IDs de los nodos inicialmente infectados
}

export interface DailyReport {
  day: number;
  susceptible: number;
  infected: number;
  recovered: number;
  newInfections: string[];  // IDs de nuevos infectados
  newRecoveries: string[];  // IDs de nuevos recuperados
  totalPopulation: number;
  r0Estimate?: number;      // Número reproductivo básico estimado
}

export interface SimulationState {
  currentDay: number;
  isRunning: boolean;
  isStabilized: boolean;
  graph: ContactGraph;
  params: SimulationParams;
  history: DailyReport[];
}

// Formato del archivo de entrada
export interface NetworkFileFormat {
  metadata?: {
    name: string;
    description: string;
    nodeCount: number;
    edgeCount: number;
  };
  nodes: Array<{
    id: string;
    name: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    weight?: number;
  }>;
}
