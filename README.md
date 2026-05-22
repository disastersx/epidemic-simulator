# 🦠 EPIDEMIA - Simulador de Propagación Epidémica

<div align="center">

![EPIDEMIA Logo](https://img.shields.io/badge/EPIDEMIA-Simulador-red?style=for-the-badge&logo=virus&logoColor=white)

**Un simulador interactivo de propagación de enfermedades usando el modelo SIR y grafos**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![D3.js](https://img.shields.io/badge/D3.js-7.0-orange?style=flat-square&logo=d3.js)](https://d3js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[Demo en Vivo](#) • [Documentación](./docs/DOCUMENTO_TECNICO.md) • [Reportar Bug](#)

</div>

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Autores](#-autores)

---

## 🎯 Sobre el Proyecto

**EPIDEMIA** es un simulador de propagación epidémica desarrollado como proyecto final del curso de Estructuras de Datos. Combina el poder de los **grafos** con **arreglos auxiliares** para modelar cómo una enfermedad se propaga a través de una red de contactos sociales.

### ¿Por qué este proyecto?

La pandemia de COVID-19 nos mostró la importancia de entender la propagación de enfermedades. Este simulador permite:

- 🔬 Visualizar en tiempo real cómo se propaga una enfermedad
- 📊 Experimentar con diferentes parámetros epidemiológicos
- 🧮 Entender algoritmos de recorrido de grafos (BFS)
- 📈 Analizar curvas de infección y recuperación

---

## ✨ Características

### Visualización Interactiva
- 🎨 Grafo de contactos con animaciones fluidas
- 🔴 Nodos que pulsan cuando están infectados
- 🖱️ Arrastrar nodos y hacer zoom
- 📱 Diseño responsive

### Simulación Completa
- ⚙️ Modelo SIR (Susceptible-Infectado-Recuperado)
- 📈 BFS por niveles para propagación
- 🎚️ Parámetros configurables (tasa de contagio, días de recuperación)
- ⏯️ Simulación paso a paso o automática

### Análisis de Datos
- 📊 Gráficos de evolución en tiempo real
- 📋 Reportes diarios detallados
- 📉 Estimación de R₀ (número reproductivo)
- 📄 Resumen estadístico final

### Datos Flexibles
- 📁 Carga redes desde archivos JSON
- 🏙️ Redes de ejemplo incluidas
- 🔧 Formato de archivo documentado

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|------------|-----|
| **Next.js 16** | Framework de React |
| **TypeScript** | Tipado estático |
| **D3.js** | Visualización del grafo |
| **Recharts** | Gráficos de evolución |
| **Framer Motion** | Animaciones |
| **Tailwind CSS** | Estilos |
| **shadcn/ui** | Componentes UI |

---

## 🚀 Instalación

### Requisitos

- Node.js 18+
- pnpm, npm o yarn

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/epidemia-simulador.git

# 2. Entrar al directorio
cd epidemia-simulador

# 3. Instalar dependencias
pnpm install

# 4. Ejecutar en desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📖 Uso

### 1️⃣ Cargar una Red de Contactos

Puedes usar la red de ejemplo precargada o cargar tu propio archivo JSON:

```json
{
  "nodes": [
    { "id": "1", "name": "Juan" },
    { "id": "2", "name": "María" }
  ],
  "edges": [
    { "source": "1", "target": "2" }
  ]
}
```

### 2️⃣ Seleccionar Infectados Iniciales

- Haz clic en los nodos del grafo, o
- Usa el selector en el panel de control

### 3️⃣ Configurar Parámetros

- **Tasa de contagio:** Probabilidad de infección por contacto (0-100%)
- **Días de recuperación:** Tiempo hasta la recuperación

### 4️⃣ Ejecutar Simulación

- **+1 Día:** Avanza un día de simulación
- **Auto:** Simula hasta que no queden infectados

### 5️⃣ Analizar Resultados

- Observa la evolución en los gráficos
- Revisa los reportes diarios
- Examina el resumen final

---

## 📁 Estructura del Proyecto

```
epidemia-simulador/
├── app/
│   ├── page.tsx          # Página principal
│   ├── layout.tsx        # Layout root
│   └── globals.css       # Estilos globales
├── components/
│   ├── graph-visualizer.tsx    # Visualización D3
│   ├── evolution-chart.tsx     # Gráficos Recharts
│   ├── control-panel.tsx       # Panel de control
│   ├── stats-cards.tsx         # Tarjetas de estadísticas
│   └── daily-report.tsx        # Reportes diarios
├── lib/
│   ├── epidemic-graph.ts       # Motor del grafo
│   └── types.ts                # Tipos TypeScript
├── data/
│   ├── red_medellin.json       # Red de ejemplo
│   ├── empresa_tech.json       # Red empresarial
│   └── universidad_salon.json  # Red universitaria
└── docs/
    └── DOCUMENTO_TECNICO.md    # Documentación completa
```

---

## 🧮 Estructuras de Datos

### Grafo - Lista de Adyacencia
```typescript
Map<string, Set<string>>
```
- Eficiente para grafos dispersos
- O(1) para verificar aristas
- O(grado) para obtener vecinos

### Arreglos Auxiliares
- `nodesArray`: Almacena información de nodos
- `nodeMap`: Mapeo ID → índice para acceso O(1)
- `infectedQueue`: Cola BFS de infectados
- `historyArray`: Historial de reportes

Ver [documentación completa](./docs/DOCUMENTO_TECNICO.md) para más detalles.

## Presentación del Proyecto

[Ver Presentación Interactiva](https://v0-epidemic-simulator.vercel.app/?_vercel_share=SE2J1DD8a0pBFgYywkUbsqmygmPdIhwW)
https://v0-epidemic-simulator-presentation.vercel.app/
---

## 👥 Autores

**Estudiante de Ingeniería**  
Universidad de Medellín  
Medellín, Antioquia, Colombia 🇨🇴

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

<div align="center">

Hecho con ❤️ en Medellín, Colombia

**Pascualbravo- Estructuras de Datos 2026**

</div>
