'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { GraphNode, GraphEdge, NodeState } from '@/lib/types';

interface GraphVisualizerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (nodeId: string) => void;
  selectedNodes?: string[];
  highlightInfectionPath?: boolean;
}

const STATE_COLORS: Record<NodeState, string> = {
  susceptible: '#60a5fa', // Azul
  infected: '#f87171',    // Rojo
  recovered: '#4ade80'    // Verde
};

const STATE_GLOW: Record<NodeState, string> = {
  susceptible: '0 0 8px #60a5fa',
  infected: '0 0 15px #f87171, 0 0 30px #f87171',
  recovered: '0 0 8px #4ade80'
};

export function GraphVisualizer({
  nodes,
  edges,
  onNodeClick,
  selectedNodes = [],
  highlightInfectionPath = false
}: GraphVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Actualizar dimensiones del contenedor
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  // Configurar la simulación D3
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Crear grupo principal con zoom
    const g = svg.append('g');

    // Configurar zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Crear definiciones para efectos
    const defs = svg.append('defs');
    
    // Gradiente para las aristas
    const gradient = defs.append('linearGradient')
      .attr('id', 'edge-gradient')
      .attr('gradientUnits', 'userSpaceOnUse');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#334155')
      .attr('stop-opacity', 0.3);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#334155')
      .attr('stop-opacity', 0.3);

    // Filtros de glow para cada estado
    ['susceptible', 'infected', 'recovered'].forEach(state => {
      const filter = defs.append('filter')
        .attr('id', `glow-${state}`)
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');

      filter.append('feGaussianBlur')
        .attr('stdDeviation', state === 'infected' ? '4' : '2')
        .attr('result', 'coloredBlur');

      const merge = filter.append('feMerge');
      merge.append('feMergeNode').attr('in', 'coloredBlur');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');
    });

    // Preparar datos para D3
    const nodeData: GraphNode[] = nodes.map(n => ({ ...n }));
    const edgeData: GraphEdge[] = edges.map(e => ({ ...e }));

    // Crear mapa de nodos para acceso rápido
    const nodeMap = new Map(nodeData.map(n => [n.id, n]));

    // Calcular parámetros adaptativos según el tamaño de la red
    const n = nodeData.length;
    const linkDistance = n > 30 ? 60 : n > 20 ? 75 : 90;
    const chargeStrength = n > 30 ? -320 : n > 20 ? -260 : -200;
    const collideRadius = n > 30 ? 26 : 30;

    // Crear simulación de fuerzas con parámetros adaptativos
    const simulation = d3.forceSimulation(nodeData)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(edgeData)
        .id(d => d.id)
        .distance(linkDistance)
        .strength(0.6)
      )
      .force('charge', d3.forceManyBody()
        .strength(chargeStrength)
        .distanceMin(20)
        .distanceMax(400)
      )
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.08))
      .force('collision', d3.forceCollide().radius(collideRadius).strength(0.9))
      .force('x', d3.forceX(width / 2).strength(0.04))
      .force('y', d3.forceY(height / 2).strength(0.04))
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    simulationRef.current = simulation;

    // Dibujar aristas
    const links = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edgeData)
      .join('line')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.4);

    // Grupo para los nodos
    const nodeGroups = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodeData)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Radio adaptativo según tamaño de la red
    const nodeRadius = n > 30 ? 10 : 12;
    const pulseRadius = nodeRadius + 8;
    const labelOffset = nodeRadius + 16;
    const labelFontSize = n > 30 ? '9px' : '10px';

    // Círculo de fondo para efecto de pulsación
    nodeGroups.append('circle')
      .attr('class', 'pulse-ring')
      .attr('r', pulseRadius)
      .attr('fill', 'none')
      .attr('stroke', d => STATE_COLORS[d.state])
      .attr('stroke-width', 2)
      .attr('opacity', d => d.state === 'infected' ? 0.5 : 0);

    // Círculo principal del nodo
    nodeGroups.append('circle')
      .attr('class', 'node-circle')
      .attr('r', nodeRadius)
      .attr('fill', d => STATE_COLORS[d.state])
      .attr('stroke', d => selectedNodes.includes(d.id) ? '#fff' : 'transparent')
      .attr('stroke-width', 2.5)
      .attr('filter', d => `url(#glow-${d.state})`);

    // Etiqueta del nodo — solo primer nombre para que no se solapen
    nodeGroups.append('text')
      .attr('class', 'node-label')
      .attr('dy', labelOffset)
      .attr('text-anchor', 'middle')
      .attr('font-size', labelFontSize)
      .attr('fill', '#94a3b8')
      .attr('font-family', 'Geist Mono, monospace')
      .text(d => d.name.split(' ')[0]);

    // Eventos de interacción
    nodeGroups
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick?.(d.id);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        d3.select(event.currentTarget)
          .select('.node-circle')
          .transition()
          .duration(200)
          .attr('r', nodeRadius + 4);
      })
      .on('mouseleave', (event) => {
        setHoveredNode(null);
        d3.select(event.currentTarget)
          .select('.node-circle')
          .transition()
          .duration(200)
          .attr('r', nodeRadius);
      });

    // Animación de pulsación para infectados con radio adaptativo
    const pulseAnimation = () => {
      nodeGroups.selectAll('.pulse-ring')
        .filter((d: any) => d.state === 'infected')
        .transition()
        .duration(1000)
        .attr('r', pulseRadius + 12)
        .attr('opacity', 0)
        .transition()
        .duration(0)
        .attr('r', pulseRadius)
        .attr('opacity', 0.5)
        .on('end', pulseAnimation);
    };
    
    pulseAnimation();

    // Actualizar posiciones en cada tick
    simulation.on('tick', () => {
      links
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroups.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes, edges, dimensions, onNodeClick, selectedNodes]);

  // Actualizar colores cuando cambia el estado de los nodos
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    svg.selectAll('.node-circle')
      .data(nodes, (d: any) => d.id)
      .transition()
      .duration(500)
      .attr('fill', (d: GraphNode) => STATE_COLORS[d.state])
      .attr('filter', (d: GraphNode) => `url(#glow-${d.state})`);

    svg.selectAll('.pulse-ring')
      .data(nodes, (d: any) => d.id)
      .attr('stroke', (d: GraphNode) => STATE_COLORS[d.state])
      .attr('opacity', (d: GraphNode) => d.state === 'infected' ? 0.5 : 0);

  }, [nodes]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[400px] bg-card rounded-lg border border-border overflow-hidden">
      {/* Grid de fondo */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      
      {/* Línea de escaneo animada */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scan" />
      </div>

      {/* SVG del grafo */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="relative z-10"
      />

      {/* Tooltip del nodo */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 bg-popover border border-border rounded-lg p-3 shadow-xl z-20"
          >
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: STATE_COLORS[hoveredNode.state] }}
              />
              <span className="font-mono text-sm font-bold">{hoveredNode.name}</span>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              <div>ID: {hoveredNode.id}</div>
              <div>Estado: <span className="uppercase">{hoveredNode.state}</span></div>
              {hoveredNode.dayInfected !== undefined && (
                <div>Día de infección: {hoveredNode.dayInfected}</div>
              )}
              {hoveredNode.dayRecovered !== undefined && (
                <div>Día de recuperación: {hoveredNode.dayRecovered}</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-popover/90 backdrop-blur border border-border rounded-lg p-3 z-20">
        <div className="text-xs font-mono text-muted-foreground mb-2">LEYENDA</div>
        <div className="space-y-2">
          {Object.entries(STATE_COLORS).map(([state, color]) => (
            <div key={state} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color, boxShadow: STATE_GLOW[state as NodeState] }}
              />
              <span className="text-xs font-mono uppercase">{state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground font-mono bg-popover/80 backdrop-blur px-2 py-1 rounded">
        Arrastra para mover • Scroll para zoom
      </div>
    </div>
  );
}
