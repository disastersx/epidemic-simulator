// =====================================
// MOTOR DEL GRAFO - Simulador Epidémico
// Implementación con Lista de Adyacencia + Arreglos Auxiliares
// =====================================

import { 
  GraphNode, 
  GraphEdge, 
  ContactGraph, 
  SimulationParams, 
  DailyReport,
  NodeState,
  NetworkFileFormat
} from './types';

/**
 * Clase principal del motor de simulación epidémica
 * 
 * Estructuras de datos utilizadas:
 * 1. GRAFO (Lista de Adyacencia): Map<string, Set<string>>
 *    - Representa la red de contactos
 *    - O(1) para verificar si existe una arista
 *    - O(grado) para obtener vecinos
 * 
 * 2. ARREGLOS AUXILIARES:
 *    - nodesArray: GraphNode[] - Almacena información de cada nodo
 *    - nodeMap: Map<string, number> - Mapeo ID -> índice en el arreglo
 *    - infectedQueue: string[] - Cola BFS de infectados actuales
 *    - historyArray: DailyReport[] - Historial de reportes diarios
 */
export class EpidemicGraph {
  // Lista de adyacencia del grafo
  private adjacencyList: Map<string, Set<string>>;
  
  // Arreglo principal de nodos con su información
  private nodesArray: GraphNode[];
  
  // Mapeo rápido de ID a índice en el arreglo
  private nodeMap: Map<string, number>;
  
  // Cola de infectados actuales (para BFS por niveles)
  private infectedQueue: string[];
  
  // Historial de reportes diarios
  private historyArray: DailyReport[];
  
  // Parámetros de simulación
  private params: SimulationParams;
  
  // Día actual de la simulación
  private currentDay: number;

  constructor() {
    this.adjacencyList = new Map();
    this.nodesArray = [];
    this.nodeMap = new Map();
    this.infectedQueue = [];
    this.historyArray = [];
    this.currentDay = 0;
    this.params = {
      infectionRate: 0.3,
      recoveryDays: 7,
      initialInfected: []
    };
  }

  // =====================================
  // OPERACIÓN 1: Cargar red desde archivo
  // Complejidad: O(n + m) donde n=nodos, m=aristas
  // =====================================
  loadFromFile(data: NetworkFileFormat): void {
    this.reset();
    
    // Cargar nodos en el arreglo
    data.nodes.forEach((node, index) => {
      const graphNode: GraphNode = {
        id: node.id,
        name: node.name,
        state: 'susceptible'
      };
      this.nodesArray.push(graphNode);
      this.nodeMap.set(node.id, index);
      this.adjacencyList.set(node.id, new Set());
    });

    // Cargar aristas (grafo no dirigido)
    data.edges.forEach(edge => {
      if (this.adjacencyList.has(edge.source) && this.adjacencyList.has(edge.target)) {
        this.adjacencyList.get(edge.source)!.add(edge.target);
        this.adjacencyList.get(edge.target)!.add(edge.source);
      }
    });

    // Calcular posiciones iniciales para visualización (layout de fuerza simple)
    this.calculateInitialLayout();
  }

  // Calcula posiciones usando un layout circular con perturbación
  private calculateInitialLayout(): void {
    const n = this.nodesArray.length;
    const radius = Math.min(300, 50 + n * 5);
    
    this.nodesArray.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / n;
      node.x = 400 + radius * Math.cos(angle) + (Math.random() - 0.5) * 50;
      node.y = 300 + radius * Math.sin(angle) + (Math.random() - 0.5) * 50;
    });
  }

  // =====================================
  // OPERACIÓN 2: Definir infectados iniciales
  // Complejidad: O(k) donde k=número de infectados iniciales
  // =====================================
  setInitialInfected(nodeIds: string[]): void {
    // Resetear estados previos
    this.nodesArray.forEach(node => {
      node.state = 'susceptible';
      node.dayInfected = undefined;
      node.dayRecovered = undefined;
    });
    
    this.infectedQueue = [];
    this.historyArray = [];
    this.currentDay = 0;
    
    // Marcar nodos iniciales como infectados
    nodeIds.forEach(id => {
      const index = this.nodeMap.get(id);
      if (index !== undefined) {
        this.nodesArray[index].state = 'infected';
        this.nodesArray[index].dayInfected = 0;
        this.infectedQueue.push(id);
      }
    });

    this.params.initialInfected = [...nodeIds];
    
    // Generar reporte del día 0
    this.generateDailyReport([...nodeIds], []);
  }

  // =====================================
  // OPERACIÓN 3: Configurar parámetros
  // Complejidad: O(1)
  // =====================================
  setParams(infectionRate: number, recoveryDays: number): void {
    this.params.infectionRate = Math.max(0, Math.min(1, infectionRate));
    this.params.recoveryDays = Math.max(1, recoveryDays);
  }

  // =====================================
  // OPERACIÓN 4: Simular un día (BFS de un nivel)
  // Complejidad: O(I * d) donde I=infectados, d=grado promedio
  // =====================================
  simulateOneDay(): DailyReport | null {
    if (this.isStabilized()) {
      return null;
    }

    this.currentDay++;
    const newInfections: string[] = [];
    const newRecoveries: string[] = [];

    // Fase 1: Procesar recuperaciones
    // Los que llevan suficientes días infectados se recuperan
    this.nodesArray.forEach(node => {
      if (
        node.state === 'infected' && 
        node.dayInfected !== undefined &&
        this.currentDay - node.dayInfected >= this.params.recoveryDays
      ) {
        node.state = 'recovered';
        node.dayRecovered = this.currentDay;
        newRecoveries.push(node.id);
      }
    });

    // Actualizar cola de infectados (remover recuperados)
    this.infectedQueue = this.infectedQueue.filter(id => {
      const index = this.nodeMap.get(id);
      return index !== undefined && this.nodesArray[index].state === 'infected';
    });

    // Fase 2: BFS de un nivel - Propagación del contagio
    const currentInfected = [...this.infectedQueue];
    
    currentInfected.forEach(infectedId => {
      const neighbors = this.adjacencyList.get(infectedId);
      if (!neighbors) return;

      neighbors.forEach(neighborId => {
        const neighborIndex = this.nodeMap.get(neighborId);
        if (neighborIndex === undefined) return;

        const neighbor = this.nodesArray[neighborIndex];
        
        // Solo los susceptibles pueden infectarse
        if (neighbor.state === 'susceptible') {
          // Aplicar probabilidad de infección
          if (Math.random() < this.params.infectionRate) {
            neighbor.state = 'infected';
            neighbor.dayInfected = this.currentDay;
            newInfections.push(neighborId);
          }
        }
      });
    });

    // Agregar nuevos infectados a la cola
    this.infectedQueue.push(...newInfections);

    // Generar y retornar reporte del día
    return this.generateDailyReport(newInfections, newRecoveries);
  }

  // =====================================
  // OPERACIÓN 5: Simular hasta estabilización
  // Complejidad: O(D * I * d) donde D=días totales
  // =====================================
  simulateUntilStable(maxDays: number = 365): DailyReport[] {
    const reports: DailyReport[] = [];
    
    while (!this.isStabilized() && this.currentDay < maxDays) {
      const report = this.simulateOneDay();
      if (report) {
        reports.push(report);
      }
    }

    return reports;
  }

  // =====================================
  // OPERACIÓN 6: Generar reporte diario
  // Complejidad: O(n)
  // =====================================
  private generateDailyReport(newInfections: string[], newRecoveries: string[]): DailyReport {
    let susceptible = 0;
    let infected = 0;
    let recovered = 0;

    this.nodesArray.forEach(node => {
      switch (node.state) {
        case 'susceptible': susceptible++; break;
        case 'infected': infected++; break;
        case 'recovered': recovered++; break;
      }
    });

    // Calcular R0 estimado (nuevas infecciones / infectados actuales)
    const previousReport = this.historyArray[this.historyArray.length - 1];
    const previousInfected = previousReport?.infected || this.params.initialInfected.length;
    const r0Estimate = previousInfected > 0 ? newInfections.length / previousInfected : 0;

    const report: DailyReport = {
      day: this.currentDay,
      susceptible,
      infected,
      recovered,
      newInfections,
      newRecoveries,
      totalPopulation: this.nodesArray.length,
      r0Estimate
    };

    this.historyArray.push(report);
    return report;
  }

  // Verificar si la simulación se ha estabilizado
  isStabilized(): boolean {
    // Estabilizado cuando no hay más infectados
    return this.infectedQueue.length === 0 && this.currentDay > 0;
  }

  // =====================================
  // GETTERS para acceder a los datos
  // =====================================
  
  getNodes(): GraphNode[] {
    return [...this.nodesArray];
  }

  getEdges(): GraphEdge[] {
    const edges: GraphEdge[] = [];
    const seen = new Set<string>();

    this.adjacencyList.forEach((neighbors, source) => {
      neighbors.forEach(target => {
        const key = [source, target].sort().join('-');
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ source, target });
        }
      });
    });

    return edges;
  }

  getGraph(): ContactGraph {
    return {
      nodes: this.getNodes(),
      edges: this.getEdges()
    };
  }

  getHistory(): DailyReport[] {
    return [...this.historyArray];
  }

  getCurrentDay(): number {
    return this.currentDay;
  }

  getParams(): SimulationParams {
    return { ...this.params };
  }

  getNeighbors(nodeId: string): string[] {
    return Array.from(this.adjacencyList.get(nodeId) || []);
  }

  getNodeById(id: string): GraphNode | undefined {
    const index = this.nodeMap.get(id);
    return index !== undefined ? this.nodesArray[index] : undefined;
  }

  // Resetear la simulación
  reset(): void {
    this.adjacencyList = new Map();
    this.nodesArray = [];
    this.nodeMap = new Map();
    this.infectedQueue = [];
    this.historyArray = [];
    this.currentDay = 0;
  }

  // Estadísticas del grafo
  getStatistics() {
    const n = this.nodesArray.length;
    let totalDegree = 0;
    let maxDegree = 0;
    let minDegree = n;

    this.adjacencyList.forEach(neighbors => {
      const degree = neighbors.size;
      totalDegree += degree;
      maxDegree = Math.max(maxDegree, degree);
      minDegree = Math.min(minDegree, degree);
    });

    return {
      nodeCount: n,
      edgeCount: totalDegree / 2,
      avgDegree: n > 0 ? totalDegree / n : 0,
      maxDegree,
      minDegree: n > 0 ? minDegree : 0,
      density: n > 1 ? totalDegree / (n * (n - 1)) : 0
    };
  }
}

// Instancia singleton para usar en la aplicación
export const epidemicEngine = new EpidemicGraph();
