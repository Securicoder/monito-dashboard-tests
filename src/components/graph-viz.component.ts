import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, input, output } from '@angular/core';
import { DataService, GraphNode, GraphLink } from '../services/data.service';

declare const d3: any;

@Component({
  selector: 'app-graph-viz',
  standalone: true,
  template: `
    <div class="relative w-full h-full overflow-hidden bg-white">
      <div #graphContainer class="graph-container w-full h-full bg-slate-50 cursor-grab active:cursor-grabbing"></div>
      
      <!-- Background Grid (Visual Sugar) -->
      <div class="absolute inset-0 pointer-events-none" 
           style="background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 24px 24px; opacity: 0.5;">
      </div>

      <div class="absolute bottom-4 right-4 flex flex-col gap-2">
        <button (click)="resetZoom()" class="p-2 bg-white text-slate-700 border border-slate-200 rounded shadow hover:bg-slate-100 transition-colors" title="Reset View">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/></svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .node-card {
      transition: all 0.2s;
    }
    :host ::ng-deep .node-card:hover rect.card-bg {
      stroke: #2563eb;
      stroke-width: 2px;
      filter: drop-shadow(0 4px 6px rgb(0 0 0 / 0.1));
    }
    :host ::ng-deep text {
      font-family: 'Inter', sans-serif;
    }
  `]
})
export class GraphVizComponent implements AfterViewInit, OnDestroy {
  @ViewChild('graphContainer') private container!: ElementRef;
  
  graphMode = input<'full' | 'nhi'>('full');
  filterPlatform = input<string>('all');
  filterRisk = input<string>('all');
  searchQuery = input<string>('');
  
  nodeSelect = output<GraphNode | null>();

  private svg: any;
  private g: any;
  private zoom: any;
  private simulation: any;
  private width = 0;
  private height = 0;
  
  private nodes: any[] = [];
  private links: any[] = [];
  
  private linkSelection: any;
  private nodeSelection: any;
  private linkLabelSelection: any;

  // Layout Config
  private readonly CARD_WIDTH = 220;
  private readonly CARD_HEIGHT = 60;
  private readonly COLUMN_SPACING = 380; 
  private readonly NODE_RADIUS = 18; 

  constructor(private dataService: DataService) {
    effect(() => {
      // React to mode changes or filters
      const mode = this.graphMode();
      this.filterPlatform();
      this.filterRisk();
      this.searchQuery();
      
      this.reloadGraphData(mode);
    });
  }

  ngAfterViewInit() {
    this.initGraph();
  }

  ngOnDestroy() {
    if (this.simulation) this.simulation.stop();
  }

  private initGraph() {
    const element = this.container.nativeElement;
    this.width = element.clientWidth;
    this.height = element.clientHeight;

    this.svg = d3.select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, this.width, this.height])
      .style('background', 'transparent'); 

    this.g = this.svg.append('g');

    this.zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: any) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);
    
    // Initial Load
    this.reloadGraphData(this.graphMode());
  }

  private reloadGraphData(mode: 'full' | 'nhi') {
    if (!this.svg) return;

    // 1. Fetch filtered data from service
    const rawNodes = this.dataService.getNodes(mode);
    const rawLinks = this.dataService.getLinks(mode);

    // Apply Client-side filtering if needed (Platform/Search)
    const platform = this.filterPlatform().toLowerCase();
    const search = this.searchQuery().toLowerCase();
    
    let filteredNodes = rawNodes;
    if (platform !== 'all') {
      filteredNodes = filteredNodes.filter(n => n.platform.toLowerCase().includes(platform));
    }
    if (search) {
      filteredNodes = filteredNodes.filter(n => n.label.toLowerCase().includes(search));
    }
    
    // Ensure we keep links valid
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    let filteredLinks = rawLinks.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

    this.nodes = JSON.parse(JSON.stringify(filteredNodes));
    this.links = JSON.parse(JSON.stringify(filteredLinks));

    // Clear previous
    this.g.selectAll('*').remove();

    // 2. Setup Simulation for Layered Layout
    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id((d: any) => d.id).strength(0.1)) 
      .force('charge', d3.forceManyBody().strength(-400))
      .force('collide', d3.forceCollide().radius(this.CARD_HEIGHT * 1.2).strength(0.8))
      .force('x', d3.forceX((d: any) => {
         // Layer 0 is left, Layer 3 is right
         return 100 + (d.layer || 0) * this.COLUMN_SPACING;
      }).strength(3)) 
      .force('y', d3.forceY(this.height / 2).strength(0.08)); 

    // 3. Render Elements
    this.render();
  }

  private render() {
    // --- MARKERS (Arrows) ---
    this.svg.append('defs').append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 0)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#64748b');

    // --- LINKS ---
    this.linkSelection = this.g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .selectAll('path')
      .data(this.links)
      .enter().append('path')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow)');

    // --- LINK LABELS ---
    this.linkLabelSelection = this.g.append('g')
      .selectAll('g')
      .data(this.links)
      .enter().append('g');
      
    this.linkLabelSelection.append('rect')
       .attr('fill', '#ffffff')
       .attr('rx', 4)
       .attr('height', 14);

    this.linkLabelSelection.append('text')
       .attr('text-anchor', 'middle')
       .attr('dy', '0.35em')
       .attr('font-size', '8px')
       .attr('font-weight', 'bold')
       .attr('fill', '#475569')
       .text((d: any) => d.label);

    // --- NODES (CARDS) ---
    this.nodeSelection = this.g.append('g')
      .selectAll('g.node-card')
      .data(this.nodes)
      .enter().append('g')
      .attr('class', 'node-card')
      .call(d3.drag()
        .on('start', (e:any, d:any) => {
           if (!e.active) this.simulation.alphaTarget(0.3).restart();
           d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (e:any, d:any) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e:any, d:any) => {
           if (!e.active) this.simulation.alphaTarget(0);
           d.fx = null; d.fy = null;
        }))
      .on('click', (e: any, d: any) => this.nodeSelect.emit(d));

    // Card Background
    this.nodeSelection.append('rect')
      .attr('class', 'card-bg')
      .attr('width', this.CARD_WIDTH)
      .attr('height', this.CARD_HEIGHT)
      .attr('rx', 8)
      .attr('fill', (d: any) => this.getCardColor(d.layer).fill)
      .attr('stroke', (d: any) => this.getCardColor(d.layer).stroke)
      .attr('stroke-width', 1);

    // Icon Circle
    this.nodeSelection.append('circle')
      .attr('cx', 24)
      .attr('cy', this.CARD_HEIGHT / 2)
      .attr('r', 16)
      .attr('fill', (d: any) => this.getIconColor(d.layer, d.platform));

    // Icon (Platform Specific)
    this.nodeSelection.append('foreignObject')
      .attr('x', 12)
      .attr('y', (this.CARD_HEIGHT / 2) - 12)
      .attr('width', 24)
      .attr('height', 24)
      .html((d: any) => this.getIconHTML(d));

    // Title
    this.nodeSelection.append('text')
      .attr('x', 50)
      .attr('y', 24)
      .text((d: any) => d.label.length > 22 ? d.label.substring(0, 20) + '...' : d.label)
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .attr('fill', '#1e293b');

    // Subtitle
    this.nodeSelection.append('text')
      .attr('x', 50)
      .attr('y', 42)
      .text((d: any) => `${d.platform} • ${d.type}`)
      .attr('font-size', '10px')
      .attr('font-weight', '400')
      .attr('fill', '#64748b');

    // --- SIMULATION TICK ---
    this.simulation.on('tick', () => {
      this.nodeSelection.attr('transform', (d: any) => `translate(${d.x - this.CARD_WIDTH/2}, ${d.y - this.CARD_HEIGHT/2})`);

      this.linkSelection.attr('d', (d: any) => {
        const sourceX = d.source.x + this.CARD_WIDTH / 2;
        const sourceY = d.source.y;
        const targetX = d.target.x - this.CARD_WIDTH / 2;
        const targetY = d.target.y;

        const path = d3.linkHorizontal()
          .x((p: any) => p[0])
          .y((p: any) => p[1])
          ({ source: [sourceX, sourceY], target: [targetX, targetY] });
        
        return path;
      });

      this.linkLabelSelection.attr('transform', (d: any) => {
         const sourceX = d.source.x + this.CARD_WIDTH / 2;
         const sourceY = d.source.y;
         const targetX = d.target.x - this.CARD_WIDTH / 2;
         const targetY = d.target.y;
         
         const midX = (sourceX + targetX) / 2;
         const midY = (sourceY + targetY) / 2;
         return `translate(${midX}, ${midY})`;
      });
      
      this.linkLabelSelection.select('rect')
         .attr('width', (d: any) => (d.label.length * 5) + 10)
         .attr('x', (d: any) => -((d.label.length * 5) + 10) / 2)
         .attr('y', -7);
    });
  }

  resetZoom() {
     this.svg.transition().duration(750).call(
       this.zoom.transform, 
       d3.zoomIdentity.translate(50, this.height/2 - 200).scale(0.8)
     );
  }

  private getCardColor(layer: number): { fill: string, stroke: string } {
    switch (layer) {
      case 0: return { fill: '#eff6ff', stroke: '#3b82f6' }; // Blue (Identity)
      case 1: return { fill: '#f0fdfa', stroke: '#14b8a6' }; // Teal (Group/Set)
      case 2: return { fill: '#fff7ed', stroke: '#f97316' }; // Orange (Entitlement/Role)
      case 3: return { fill: '#f8fafc', stroke: '#64748b' }; // Slate (Resource)
      default: return { fill: '#ffffff', stroke: '#e2e8f0' };
    }
  }
  
  private getIconColor(layer: number, platform: string): string {
     if (layer === 0 && platform === 'Salesforce') return '#00a1e0';
     if (layer === 0 && platform === 'Google Workspace') return '#ea4335';
     if (layer === 0 && (platform === 'Azure' || platform === 'Entra ID')) return '#0078d4';
     
     switch (layer) {
      case 0: return '#1d4ed8'; // Dark Blue
      case 1: return '#f59e0b'; // Orange
      case 2: return '#f59e0b'; // Orange
      case 3: return '#475569'; // Slate
      default: return '#cbd5e1';
    }
  }

  private getIconHTML(d: GraphNode): string {
    const p = d.platform.toLowerCase();
    
    // Cloud Logos
    const salesforceIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M17 10c0-2.2-1.8-4-4-4-.7 0-1.4.2-2 .5C10.4 4.1 7.9 4 6 6c-2.2 2.2-2.2 5.8 0 8 1.5 1.5 3.9 1.8 5.7 1 .6 1.1 1.9 1.8 3.3 1.5 2.5-.5 4-2.9 3.5-5.3.3-.3.5-.7.5-1.2z"/></svg>`;
    const azureIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M11.5 2l-9 16h8l3.5-7 3.5 7h5l-11-16z"/></svg>`;
    const googleIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/></svg>`;
    const spIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/><path d="M12 7l-5 5 5 5 5-5-5-5z" fill="#0078d4"/></svg>`;

    // Generic Type Icons
    const userIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>`;
    const groupIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>`;
    const resourceIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" /></svg>`;
    
    // Priority: Platform Brand -> Type -> Generic
    if (d.type === 'identity' || d.type === 'credential') {
        if (p.includes('salesforce')) return salesforceIcon;
        if (p.includes('google')) return googleIcon;
        if (p.includes('azure') || p.includes('entra')) return azureIcon;
        return userIcon;
    }

    if (d.type === 'group' || d.type === 'entitlement') return groupIcon;
    
    if (d.type === 'resource') {
        if (p.includes('sharepoint')) return spIcon;
        if (p.includes('salesforce')) return salesforceIcon;
        if (p.includes('google')) return googleIcon;
    }

    return resourceIcon;
  }
}
