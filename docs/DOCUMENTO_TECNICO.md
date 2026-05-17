# 🦠 EPIDEMIA - Simulador de Propagación Epidémica

## Descripción del Problema y Motivación

### ¿Qué es EPIDEMIA?

EPIDEMIA es un simulador interactivo de propagación de enfermedades que modela cómo un virus o bacteria se propaga a través de una red de contactos sociales. Utiliza el **modelo epidemiológico SIR** (Susceptible-Infectado-Recuperado) combinado con **grafos no dirigidos** para representar las conexiones entre individuos.

### ¿Por qué es importante?

La pandemia de COVID-19 nos mostró lo crucial que es entender cómo se propagan las enfermedades. Este simulador permite:

- 📊 **Visualizar** en tiempo real cómo una enfermedad se expande en una población
- 🧪 **Experimentar** con diferentes tasas de contagio y tiempos de recuperación
- 🔬 **Analizar** el impacto de las redes de contacto en la propagación
- 📈 **Predecir** picos de infección y duración de brotes

### Motivación Personal

Como estudiante de ingeniería en Medellín, vi de primera mano cómo la pandemia afectó a mi comunidad. Este proyecto combina mi pasión por la programación con un tema de relevancia social, aplicando estructuras de datos avanzadas para resolver problemas del mundo real.

---

## Modelado del Problema

### El Grafo de Contactos

El problema se modela como un **grafo no dirigido** donde:

```
G = (V, E)
```

- **V (Vértices/Nodos)**: Representan individuos de la población
- **E (Aristas)**: Representan contactos entre individuos (relaciones bidireccionales)

### Diagrama del Grafo

```
        [Juan]
       /      \
    [María]--[Carlos]
      |         |
    [Ana]    [Diego]
      |         |
   [Pedro]--[Sofía]
```

Cada nodo tiene un **estado** que puede ser:
- 🔵 **Susceptible (S)**: Puede infectarse
- 🔴 **Infectado (I)**: Está enfermo y puede contagiar
- 🟢 **Recuperado (R)**: Ya se curó y es inmune

### Propiedades del Grafo

| Propiedad | Valor |
|-----------|-------|
| Tipo | No dirigido |
| Ponderado | Opcional (frecuencia de contacto) |
| Conexo | Generalmente sí |
| Dinámico | Estados cambian con el tiempo |

---

## Estructuras de Datos Utilizadas

### 1. Grafo - Lista de Adyacencia

```typescript
private adjacencyList: Map<string, Set<string>>;
```

**¿Por qué esta estructura?**

- ✅ Eficiente para grafos dispersos (pocas conexiones por nodo)
- ✅ O(1) para verificar si existe una arista
- ✅ O(grado) para obtener todos los vecinos
- ✅ Memoria: O(V + E)

**Alternativas consideradas:**
- Matriz de adyacencia: Descartada porque usaría O(V²) memoria
- Lista de aristas: Descartada porque buscar vecinos sería O(E)

### 2. Arreglo de Nodos

```typescript
private nodesArray: GraphNode[];
private nodeMap: Map<string, number>;
```

**Estructura de un nodo:**
```typescript
interface GraphNode {
  id: string;
  name: string;
  state: 'susceptible' | 'infected' | 'recovered';
  x?: number;  // Posición para visualización
  y?: number;
  dayInfected?: number;
  dayRecovered?: number;
}
```

**¿Por qué usar un arreglo + mapa?**

- El arreglo permite iterar sobre todos los nodos en O(n)
- El Map permite acceso por ID en O(1)
- Combinación óptima para nuestras operaciones

### 3. Cola BFS de Infectados

```typescript
private infectedQueue: string[];
```

**Uso:** Mantiene la lista de nodos actualmente infectados para el algoritmo BFS de propagación.

### 4. Arreglo de Historial

```typescript
private historyArray: DailyReport[];
```

**Estructura de un reporte:**
```typescript
interface DailyReport {
  day: number;
  susceptible: number;
  infected: number;
  recovered: number;
  newInfections: string[];
  newRecoveries: string[];
  r0Estimate?: number;
}
```

### Diagrama de Estructuras

```
┌─────────────────────────────────────────────────────────────┐
│                    EpidemicGraph                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  adjacencyList   │    │    nodesArray    │              │
│  │  Map<id, Set>    │    │    GraphNode[]   │              │
│  ├──────────────────┤    ├──────────────────┤              │
│  │ "1" → {2,3,5}    │    │ [0] Juan, S      │              │
│  │ "2" → {1,4,6}    │    │ [1] María, I     │              │
│  │ "3" → {1,4,7}    │    │ [2] Carlos, R    │              │
│  │ ...              │    │ ...              │              │
│  └──────────────────┘    └──────────────────┘              │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  infectedQueue   │    │   historyArray   │              │
│  │    string[]      │    │  DailyReport[]   │              │
│  ├──────────────────┤    ├──────────────────┤              │
│  │ ["2", "5", "8"]  │    │ [Day 0, Day 1..] │              │
│  └──────────────────┘    └──────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Operaciones Implementadas

### 1. Cargar Red desde Archivo

```typescript
loadFromFile(data: NetworkFileFormat): void
```

**Descripción:** Carga una red de contactos desde un archivo JSON.

**Complejidad:** O(n + m) donde n = nodos, m = aristas

**Algoritmo:**
```
1. Resetear estructuras
2. Para cada nodo en data.nodes:
   - Crear GraphNode con estado 'susceptible'
   - Agregar al arreglo y al mapa
   - Inicializar lista de adyacencia vacía
3. Para cada arista en data.edges:
   - Agregar conexión bidireccional
4. Calcular layout inicial
```

---

### 2. Definir Infectados Iniciales

```typescript
setInitialInfected(nodeIds: string[]): void
```

**Descripción:** Marca uno o varios nodos como infectados iniciales.

**Complejidad:** O(k) donde k = número de infectados iniciales

**Algoritmo:**
```
1. Resetear todos los estados a 'susceptible'
2. Limpiar cola de infectados e historial
3. Para cada ID en nodeIds:
   - Cambiar estado a 'infected'
   - Marcar día de infección = 0
   - Agregar a la cola
4. Generar reporte del día 0
```

---

### 3. Configurar Parámetros

```typescript
setParams(infectionRate: number, recoveryDays: number): void
```

**Descripción:** Configura la tasa de contagio y días de recuperación.

**Complejidad:** O(1)

**Parámetros:**
- `infectionRate`: Probabilidad de contagio por contacto (0-1)
- `recoveryDays`: Días hasta la recuperación

---

### 4. Simular Un Día (BFS de un nivel)

```typescript
simulateOneDay(): DailyReport | null
```

**Descripción:** Avanza la simulación un día usando BFS por niveles.

**Complejidad:** O(I × d) donde I = infectados actuales, d = grado promedio

**Algoritmo BFS:**
```
simulateOneDay():
    if estabilizado: return null
    
    currentDay++
    newInfections = []
    newRecoveries = []
    
    // Fase 1: Recuperaciones
    para cada nodo en nodesArray:
        if estado == 'infected' AND 
           currentDay - dayInfected >= recoveryDays:
            estado = 'recovered'
            newRecoveries.add(nodo.id)
    
    // Actualizar cola (remover recuperados)
    infectedQueue = filtrar(recuperados)
    
    // Fase 2: BFS - Propagación
    currentInfected = copiar(infectedQueue)
    
    para cada infectado en currentInfected:
        para cada vecino en adjacencyList[infectado]:
            if vecino.estado == 'susceptible':
                if random() < infectionRate:
                    vecino.estado = 'infected'
                    vecino.dayInfected = currentDay
                    newInfections.add(vecino.id)
    
    // Agregar nuevos infectados a la cola
    infectedQueue.addAll(newInfections)
    
    return generarReporte(newInfections, newRecoveries)
```

---

### 5. Simular Hasta Estabilización

```typescript
simulateUntilStable(maxDays?: number): DailyReport[]
```

**Descripción:** Ejecuta la simulación hasta que no haya infectados.

**Complejidad:** O(D × I × d) donde D = días totales

**Condición de estabilización:** `infectedQueue.length === 0`

---

### 6. Generar Reporte Diario

```typescript
generateDailyReport(newInfections, newRecoveries): DailyReport
```

**Descripción:** Genera estadísticas del día actual.

**Complejidad:** O(n)

**Métricas calculadas:**
- Conteo por estado (S, I, R)
- Nuevas infecciones y recuperaciones
- Estimación de R₀ (número reproductivo básico)

---

## Resumen de Complejidades

| Operación | Complejidad Temporal | Complejidad Espacial |
|-----------|---------------------|---------------------|
| Cargar red | O(n + m) | O(n + m) |
| Set infectados | O(k) | O(k) |
| Set parámetros | O(1) | O(1) |
| Simular día | O(I × d) | O(I) |
| Simular todo | O(D × I × d) | O(D) |
| Generar reporte | O(n) | O(1) |
| Obtener vecinos | O(1) | O(d) |
| Buscar nodo | O(1) | O(1) |

Donde:
- n = número de nodos
- m = número de aristas
- k = infectados iniciales
- I = infectados actuales
- d = grado promedio
- D = duración en días

---

## Casos de Prueba

### Caso 1: Red Pequeña - Propagación Básica

**Entrada:**
```json
{
  "nodes": [
    {"id": "A", "name": "Alice"},
    {"id": "B", "name": "Bob"},
    {"id": "C", "name": "Charlie"}
  ],
  "edges": [
    {"source": "A", "target": "B"},
    {"source": "B", "target": "C"}
  ]
}
```

**Configuración:**
- Infectado inicial: A
- Tasa de contagio: 100%
- Días de recuperación: 3

**Salida esperada:**

| Día | S | I | R |
|-----|---|---|---|
| 0 | 2 | 1 | 0 |
| 1 | 1 | 2 | 0 |
| 2 | 0 | 3 | 0 |
| 3 | 0 | 2 | 1 |
| 4 | 0 | 1 | 2 |
| 5 | 0 | 0 | 3 |

---

### Caso 2: Red con Inmunidad Parcial

**Entrada:** Red de 20 nodos (red_medellin.json)

**Configuración:**
- Infectados iniciales: 2 nodos
- Tasa de contagio: 30%
- Días de recuperación: 7

**Comportamiento esperado:**
- La epidemia no infecta a toda la población
- Algunos nodos permanecen susceptibles
- Pico de infección entre días 5-10

---

### Caso 3: Superpropagador

**Escenario:** Un nodo con alto grado de conexión como infectado inicial.

**Entrada:** Red empresa_tech.json, infectado inicial: CEO

**Observación esperada:** Propagación más rápida que si el infectado inicial fuera un nodo periférico.

---

## Instrucciones de Ejecución

### Requisitos Previos

- Node.js 18+ 
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/epidemia-simulador.git
cd epidemia-simulador

# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev
```

### Uso de la Aplicación

1. **Cargar Red:** Click en "Seleccionar archivo JSON" o usar la red de ejemplo
2. **Seleccionar Infectados:** Click en los nodos del grafo o usar el selector
3. **Configurar Parámetros:** Ajustar tasa de contagio y días de recuperación
4. **Simular:** 
   - "+1 Día" para avanzar paso a paso
   - "Auto" para simular hasta estabilización
5. **Analizar:** Ver gráficos de evolución y reportes diarios

### Formato del Archivo de Entrada

```json
{
  "metadata": {
    "name": "Nombre de la red",
    "description": "Descripción opcional"
  },
  "nodes": [
    { "id": "identificador_unico", "name": "Nombre visible" }
  ],
  "edges": [
    { "source": "id_nodo_1", "target": "id_nodo_2" }
  ]
}
```

---

## Capturas del Demo

### Vista Principal
La interfaz principal muestra:
- Panel de control a la izquierda
- Visualización del grafo en el centro
- Reportes diarios a la derecha
- Estadísticas en la parte superior

### Grafo Interactivo
- Nodos azules: Susceptibles
- Nodos rojos con pulsación: Infectados
- Nodos verdes: Recuperados
- Arrastra para mover nodos
- Scroll para zoom

### Gráficos de Evolución
- Curvas SIR en tiempo real
- Barras de nuevos casos por día
- Tooltips con información detallada

---

## Limitaciones y Mejoras Futuras

### Limitaciones Actuales

1. **Modelo simplificado:** No considera:
   - Período de incubación
   - Reinfección
   - Mortalidad
   - Vacunación

2. **Probabilidad uniforme:** La tasa de contagio es igual para todos los contactos

3. **Red estática:** No cambia durante la simulación

4. **Sin clustering:** No agrupa por comunidades

### Posibles Mejoras

1. **Modelo SEIR:** Agregar estado "Expuesto" (periodo de incubación)

2. **Pesos en aristas:** Implementar frecuencia de contacto variable

3. **Medidas de control:**
   - Cuarentena de nodos
   - Vacunación selectiva
   - Distanciamiento social

4. **Análisis avanzado:**
   - Detección de superpropagadores
   - Cálculo de R₀ real
   - Predicción de picos

5. **Importar redes reales:**
   - Integración con redes sociales
   - Datos de movilidad

---

---

## Guia para la Sustentacion Oral (8-10 minutos)

### Estructura de la Presentacion

#### Minuto 0-1: Introduccion (1 min)
**Que decir:**
> "Buenas, somos [nombres] y les vamos a presentar EPIDEMIA, un simulador de propagacion de enfermedades. Despues de vivir la pandemia de COVID, quisimos entender como se propagan las enfermedades en una poblacion usando estructuras de datos."

**Mostrar:** La pantalla principal del simulador ya cargada.

---

#### Minuto 1-3: Explicacion del Modelo (2 min)
**Que decir:**
> "Modelamos el problema como un grafo no dirigido donde cada nodo es una persona y cada arista representa un contacto fisico. Cada persona puede estar en uno de tres estados: Susceptible (azul), Infectado (rojo) o Recuperado (verde). Esto se llama el modelo SIR."

**Mostrar:** 
- Senalar los nodos de diferentes colores en el grafo
- Explicar que las lineas son los contactos entre personas

**Estructuras de datos (IMPORTANTE - esto es lo que evaluan):**
> "Usamos una lista de adyacencia implementada con un Map de JavaScript donde cada nodo apunta a un Set de sus vecinos. Esto nos da O(1) para buscar conexiones. Tambien usamos un arreglo para almacenar los nodos y otro arreglo como cola para el algoritmo BFS."

---

#### Minuto 3-7: Demostracion en Vivo (4 min)

**Paso 1 - Cargar la red:**
> "Primero cargamos una red de contactos. Tenemos una red de ejemplo con 40 personas divididas en 5 grupos: una familia, una empresa, un salon de universidad, un barrio y un gimnasio."

*Click en "Cargar red ejemplo (40 nodos)"*

**Paso 2 - Seleccionar infectados:**
> "Ahora seleccionamos quien se infecta primero. Vamos a infectar a Juan Garcia de la familia."

*Click en el nodo de Juan Garcia*

**Paso 3 - Configurar parametros:**
> "Configuramos la tasa de contagio en 40% y los dias de recuperacion en 5. Esto significa que cada infectado tiene 40% de probabilidad de contagiar a cada vecino por dia."

*Mover los sliders*

**Paso 4 - Simular paso a paso:**
> "Ahora simulamos dia por dia. Vean como el virus se propaga usando BFS - primero infecta a los vecinos directos y luego va expandiendose."

*Click en "+1 Dia" varias veces, mostrando como se propaga*

> "Miren como el virus salto de la familia a la empresa por el nodo puente que los conecta."

**Paso 5 - Simular automatico:**
> "Podemos dejarlo correr automaticamente hasta que no queden infectados."

*Click en "Auto"*

**Paso 6 - Mostrar graficos:**
> "Aqui vemos la curva SIR clasica de epidemiologia. El pico de infectados fue en el dia X y el R0 estimado fue de Y."

*Senalar los graficos de evolucion*

---

#### Minuto 7-9: Analisis Tecnico (2 min)

**Complejidad del algoritmo:**
> "El algoritmo principal simulateOneDay usa BFS y tiene complejidad O(I por d) donde I es el numero de infectados y d es el grado promedio. Esto es eficiente porque no recorremos toda la red, solo los infectados y sus vecinos."

**Por que estas estructuras:**
> "Elegimos lista de adyacencia en vez de matriz porque nuestra red es dispersa - cada persona tiene pocos contactos comparado con el total. Una matriz usaria O(n cuadrado) memoria mientras que nosotros usamos O(n + m)."

---

#### Minuto 9-10: Conclusiones (1 min)

**Que decir:**
> "En conclusion, logramos implementar todas las operaciones pedidas: cargar red desde archivo, definir infectados iniciales, configurar parametros, simular dia a dia con BFS, simular hasta estabilizacion y generar reportes con graficos."

> "Como mejoras futuras podriamos agregar el periodo de incubacion, vacunacion, o importar redes reales de contactos."

> "Gracias, quedamos atentos a preguntas."

---

### Tips para la Sustentacion

1. **Practica la demo antes:** Asegurate de que todo funcione. Ten la red cargada de antemano.

2. **Si algo falla:** Recarga la pagina y vuelve a cargar la red de ejemplo. Siempre funciona.

3. **Preguntas comunes que te pueden hacer:**
   - "Por que usaron lista de adyacencia?" → Porque es eficiente para grafos dispersos
   - "Cual es la complejidad del BFS?" → O(V + E) pero nosotros solo recorremos desde los infectados
   - "Que pasa si la tasa es 100%?" → Todos se infectan eventualmente si la red es conexa
   - "Como calculan R0?" → Promedio de nuevos infectados dividido por los infectados que los causaron

4. **Divide la presentacion:** Uno explica el modelo y estructuras, el otro hace la demo en vivo.

5. **Habla con confianza:** Vos hiciste el codigo, vos lo entendes.

---

## Referencias

- Kermack, W. O., & McKendrick, A. G. (1927). A contribution to the mathematical theory of epidemics.
- Newman, M. E. J. (2010). Networks: An Introduction. Oxford University Press.
- Documentación de D3.js: https://d3js.org/
- Documentación de React: https://react.dev/

---

## Autores

**Estudiante de Ingeniería**  
Universidad de Medellín  
Estructuras de Datos - 2026

---

*"Entender cómo se propagan las enfermedades es el primer paso para detenerlas"* 🦠
