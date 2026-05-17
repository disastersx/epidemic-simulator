# Diagramas del Simulador EPIDEMIA

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EPIDEMIA - Frontend                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐           │
│  │   Control Panel │   │ Graph Visualizer│   │  Daily Reports  │           │
│  │   (React)       │   │   (D3.js)       │   │   (React)       │           │
│  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘           │
│           │                     │                     │                     │
│           └─────────────────────┼─────────────────────┘                     │
│                                 │                                           │
│                                 ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                        EpidemiaSimulator                          │      │
│  │                     (Componente Principal)                        │      │
│  │                                                                   │      │
│  │   state: {                                                        │      │
│  │     nodes: GraphNode[]                                            │      │
│  │     edges: GraphEdge[]                                            │      │
│  │     history: DailyReport[]                                        │      │
│  │     currentDay: number                                            │      │
│  │     isRunning: boolean                                            │      │
│  │   }                                                               │      │
│  └──────────────────────────────────┬───────────────────────────────┘      │
│                                     │                                       │
│                                     ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                         EpidemicGraph                             │      │
│  │                      (Motor de Simulación)                        │      │
│  │                                                                   │      │
│  │   - adjacencyList: Map<string, Set<string>>                       │      │
│  │   - nodesArray: GraphNode[]                                       │      │
│  │   - nodeMap: Map<string, number>                                  │      │
│  │   - infectedQueue: string[]                                       │      │
│  │   - historyArray: DailyReport[]                                   │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Diagrama del Modelo SIR

```
                    ┌──────────────────┐
                    │   SUSCEPTIBLE    │
                    │      (S)         │
                    │    🔵 Azul       │
                    └────────┬─────────┘
                             │
                             │ Probabilidad de
                             │ Infección (β)
                             │
                             ▼
                    ┌──────────────────┐
                    │    INFECTADO     │
                    │       (I)        │
                    │    🔴 Rojo       │
                    │   (Pulsante)     │
                    └────────┬─────────┘
                             │
                             │ Después de
                             │ γ días
                             │
                             ▼
                    ┌──────────────────┐
                    │   RECUPERADO     │
                    │       (R)        │
                    │    🟢 Verde      │
                    │    (Inmune)      │
                    └──────────────────┘
```

---

## Diagrama del Algoritmo BFS

```
                    Día 0: Paciente Cero
                    
                          [1]🔴
                         / | \
                       /   |   \
                     [2]  [3]  [4]
                     🔵   🔵   🔵

                    ─────────────────────
                    
                    Día 1: Primera ola de contagio
                    (BFS nivel 1)
                    
                          [1]🔴
                         / | \
                       /   |   \
                     [2]  [3]  [4]    <- Posibles contagios
                     🔴   🔵   🔴        (según probabilidad)
                    / \       / \
                  [5] [6]   [7] [8]
                  🔵  🔵    🔵  🔵

                    ─────────────────────
                    
                    Día 2: Segunda ola
                    (BFS nivel 2)
                    
                          [1]🔴
                         / | \
                       /   |   \
                     [2]  [3]  [4]
                     🔴   🔵   🔴
                    / \       / \
                  [5] [6]   [7] [8]  <- Nueva frontera
                  🔴  🔴    🔴  🔵
```

---

## Flujo del Algoritmo de Simulación

```
┌─────────────────────────────────────────────────────────────────┐
│                     INICIO DE SIMULACIÓN                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Cargar Red de Contactos                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  loadFromFile(json)                                      │   │
│  │  - Crear nodos en nodesArray                             │   │
│  │  - Construir lista de adyacencia                         │   │
│  │  - Calcular layout inicial                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│               Seleccionar Infectados Iniciales                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  setInitialInfected([ids])                               │   │
│  │  - Marcar nodos como 'infected'                          │   │
│  │  - Agregar a infectedQueue                               │   │
│  │  - Generar reporte día 0                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Configurar Parámetros                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  setParams(infectionRate, recoveryDays)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │   currentDay++   │
                    └────────┬─────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
         ▼                                       ▼
┌─────────────────────┐              ┌─────────────────────┐
│  FASE 1: RECUPERAR  │              │ FASE 2: PROPAGAR    │
│                     │              │                     │
│ Para cada infectado:│              │ Para cada infectado:│
│ if (días >= γ)      │              │   Para cada vecino: │
│   estado = 'R'      │              │   if (estado == 'S')│
│   sacar de cola     │              │     if (rand < β)   │
│                     │              │       infectar      │
└─────────┬───────────┘              └─────────┬───────────┘
          │                                    │
          └──────────────┬─────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │ Generar Reporte  │
              │ del Día          │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ ¿Hay infectados? │
              └────────┬─────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
           Sí                    No
            │                     │
            ▼                     ▼
    ┌───────────────┐     ┌───────────────┐
    │ Repetir ciclo │     │ Estabilizado  │
    │               │     │ FIN           │
    └───────────────┘     └───────────────┘
```

---

## Estructura de Datos del Grafo

```
adjacencyList (Map<string, Set<string>>):
┌─────────┬───────────────────────────┐
│   Key   │          Value            │
├─────────┼───────────────────────────┤
│   "1"   │  Set { "2", "3", "5" }    │
│   "2"   │  Set { "1", "4", "6" }    │
│   "3"   │  Set { "1", "4", "7" }    │
│   "4"   │  Set { "2", "3", "8" }    │
│   ...   │  ...                      │
└─────────┴───────────────────────────┘

nodesArray (GraphNode[]):
┌───────┬────────────────────────────────────────────────┐
│ Index │                   GraphNode                    │
├───────┼────────────────────────────────────────────────┤
│   0   │ { id:"1", name:"Juan", state:"S", x:100, y:50 }│
│   1   │ { id:"2", name:"María", state:"I", dayInf:0 }  │
│   2   │ { id:"3", name:"Carlos", state:"R", dayRec:7 } │
│  ...  │ ...                                            │
└───────┴────────────────────────────────────────────────┘

nodeMap (Map<string, number>):
┌─────────┬───────┐
│   ID    │ Index │
├─────────┼───────┤
│   "1"   │   0   │
│   "2"   │   1   │
│   "3"   │   2   │
│  ...    │  ...  │
└─────────┴───────┘
```

---

## Curva Típica SIR

```
Población
    │
100%│ ════════════════════════════════════════
    │    ╲                               ╱
    │     ╲  Susceptibles (S)           ╱ Recuperados (R)
    │      ╲                           ╱
    │       ╲                         ╱
    │        ╲                       ╱
    │         ╲          ╱╲         ╱
    │          ╲        ╱  ╲       ╱
    │           ╲      ╱    ╲     ╱
    │            ╲    ╱      ╲   ╱
    │             ╲  ╱   I    ╲ ╱
    │              ╲╱          ╲
    │              ╱╲          ╱
  0%│─────────────────────────────────────────── Tiempo
    │           Pico de
    │         Infección
```

---

## Leyenda de Estados

| Estado | Color | Símbolo | Descripción |
|--------|-------|---------|-------------|
| Susceptible | 🔵 Azul | S | Puede ser infectado |
| Infectado | 🔴 Rojo | I | Activamente contagioso |
| Recuperado | 🟢 Verde | R | Inmune, no contagia |

---

*Diagramas creados para el documento técnico del proyecto EPIDEMIA*
