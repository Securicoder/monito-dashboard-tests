import { Component, signal, computed, ElementRef, ViewChild, effect, AfterViewInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, AccessProfile, ResourceProfile, ThreatScenario } from '../services/data.service';

declare const d3: any;

@Component({
  selector: 'app-access-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full w-full bg-slate-50 flex flex-col font-sans relative">
      
      <!-- Top Bar: Navigation & Context -->
      <div class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm z-20 relative">
         <div class="flex items-center gap-6">
           <div class="flex items-center gap-2">
             <div class="p-2 bg-cydenti-blue/10 rounded-lg">
               <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-cydenti-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
             </div>
             <div>
               <h2 class="text-lg font-bold text-slate-900 leading-tight">Access Explorer</h2>
               <p class="text-[10px] text-slate-500 font-mono tracking-wide uppercase">Cydenti Graph Platform</p>
             </div>
           </div>
           
           <div class="h-8 w-px bg-slate-200"></div>
           
           <!-- Tab Switcher -->
           <div class="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
             <button (click)="activeTab.set('identity')" 
               [class.bg-white]="activeTab() === 'identity'" [class.shadow-sm]="activeTab() === 'identity'" [class.text-cydenti-blue]="activeTab() === 'identity'"
               class="px-4 py-1.5 rounded-md text-sm font-semibold text-slate-500 transition-all flex items-center gap-2">
               <span>Identité</span>
             </button>
             <button (click)="activeTab.set('resource')"
               [class.bg-white]="activeTab() === 'resource'" [class.shadow-sm]="activeTab() === 'resource'" [class.text-cydenti-teal]="activeTab() === 'resource'"
               class="px-4 py-1.5 rounded-md text-sm font-semibold text-slate-500 transition-all flex items-center gap-2">
               <span>Ressource</span>
             </button>
             <button (click)="activeTab.set('threat')"
               [class.bg-white]="activeTab() === 'threat'" [class.shadow-sm]="activeTab() === 'threat'" [class.text-red-600]="activeTab() === 'threat'"
               class="px-4 py-1.5 rounded-md text-sm font-semibold text-slate-500 transition-all flex items-center gap-2">
               <span>Menaces</span>
             </button>
           </div>
         </div>
         
         <!-- Context Selector -->
         <div class="flex gap-4 items-center">
             
            <!-- View Toggle -->
            @if (activeTab() === 'identity') {
              <div class="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <span class="text-xs font-bold px-2 text-slate-500">View:</span>
                  <button (click)="setViewMode('detailed')" 
                     [class.bg-white]="viewMode() === 'detailed'" [class.shadow-sm]="viewMode() === 'detailed'" [class.text-cydenti-blue]="viewMode() === 'detailed'"
                     class="text-xs px-3 py-1 rounded transition-all font-medium text-slate-500">Granular</button>
                  <button (click)="setViewMode('effective')" 
                     [class.bg-white]="viewMode() === 'effective'" [class.shadow-sm]="viewMode() === 'effective'" [class.text-cydenti-blue]="viewMode() === 'effective'"
                     class="text-xs px-3 py-1 rounded transition-all font-medium text-slate-500">Effective Access</button>
              </div>
            }

            @if (activeTab() === 'identity') {
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-500 uppercase">Profile:</span>
                <select class="text-sm border border-slate-300 rounded px-2 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-cydenti-blue"
                        [ngModel]="selectedIdentityId()" (ngModelChange)="selectedIdentityId.set($event)">
                   @for(id of availableIdentities; track id.id) {
                     <option [value]="id.id">{{ id.label }}</option>
                   }
                </select>
              </div>
            }
            @if (activeTab() === 'resource') {
               <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-500 uppercase">Target:</span>
                <select class="text-sm border border-slate-300 rounded px-2 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-cydenti-teal"
                        [ngModel]="selectedResourceId()" (ngModelChange)="selectedResourceId.set($event)">
                   @for(res of availableResources; track res.id) {
                     <option [value]="res.id">{{ res.label }}</option>
                   }
                </select>
              </div>
            }
            @if (activeTab() === 'threat') {
               <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-500 uppercase">Target:</span>
                <select class="text-sm border border-slate-300 rounded px-2 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-red-500"
                        [ngModel]="selectedThreatId()" (ngModelChange)="selectedThreatId.set($event)">
                   @for(th of availableThreats; track th.id) {
                     <option [value]="th.id">{{ th.label }}</option>
                   }
                </select>
              </div>
            }
         </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 overflow-hidden relative">
        
        <!-- 1. IDENTITY VIEW -->
        @if (activeTab() === 'identity') {
          <div class="h-full bg-slate-50 p-6 overflow-hidden flex flex-col">
             
               <!-- Visualization Container -->
               <div class="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden relative">
                  
                  <!-- Vis Header -->
                  <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                    <div>
                      <h3 class="font-bold text-slate-800 text-lg">Identity Entitlement & Access Graph</h3>
                      <p class="text-xs text-slate-500">Visualization of Identity > Groups > Roles > Resources.</p>
                    </div>
                    
                    <!-- LEGEND -->
                    <div class="flex items-center gap-4 text-xs font-medium bg-white p-2 border border-slate-100 rounded-lg shadow-sm">
                        <div class="flex items-center gap-1"><span class="w-2.5 h-2.5 bg-red-100 border border-red-500 rounded-full"></span> High Risk Identity</div>
                        <div class="flex items-center gap-1"><span class="w-2.5 h-2.5 bg-amber-100 border border-amber-500 rounded-full"></span> Crown Jewel</div>
                        <div class="w-px h-4 bg-slate-200 mx-1"></div>
                        <div class="flex items-center gap-1 text-slate-400 italic">Click node to isolate Blast Radius</div>
                    </div>

                    <div class="flex gap-2">
                       <button class="px-3 py-1 text-xs bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 active:bg-slate-100 transition-colors" (click)="resetGraph()">Reset View</button>
                    </div>
                  </div>

                  <!-- D3 Container -->
                  <div class="flex-1 relative bg-slate-50 overflow-hidden cursor-grab active:cursor-grabbing">
                     <div #identityGraph class="w-full h-full"></div>
                  </div>
               </div>
          </div>
        }

        <!-- 2. RESOURCE VIEW -->
        @if (activeTab() === 'resource') {
          <div class="h-full flex flex-col p-6 overflow-y-auto">
             <div class="mb-6">
                <!-- Breadcrumbs -->
                <div class="flex items-center gap-2 text-xs text-slate-500 mb-2 font-mono">
                  @for (item of resource().hierarchy; track item.name) {
                     <span class="hover:text-cydenti-blue cursor-pointer">{{ item.name }}</span>
                     @if (!$last) { <span>/</span> }
                  }
                </div>
                <div class="flex justify-between items-start">
                  <div>
                    <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      {{ resource().resource.name }}
                    </h2>
                    <div class="flex gap-4 mt-1 text-sm">
                      <span class="text-slate-600">Owner: <strong>{{ resource().resource.owner }}</strong></span>
                    </div>
                  </div>
                </div>
             </div>

             <!-- Access Table -->
             <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                   <h3 class="font-bold text-slate-700">Access Control List</h3>
                </div>
                <table class="w-full text-sm text-left">
                   <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                      <tr>
                        <th class="px-6 py-3">Identity</th>
                        <th class="px-6 py-3">Access Level</th>
                        <th class="px-6 py-3">Via (Source)</th>
                      </tr>
                   </thead>
                   <tbody class="divide-y divide-slate-100">
                      @for (row of resource().accessList; track row.identity) {
                        <tr class="hover:bg-slate-50 transition-colors">
                          <td class="px-6 py-4 font-medium text-slate-900">{{ row.identity }}</td>
                          <td class="px-6 py-4">{{ row.accessLevel }}</td>
                          <td class="px-6 py-4 text-slate-600">{{ row.via }}</td>
                        </tr>
                      }
                   </tbody>
                </table>
             </div>
          </div>
        }

        <!-- 3. THREAT SIMULATION VIEW -->
        @if (activeTab() === 'threat') {
          <div class="h-full grid grid-cols-12 p-6 gap-6 overflow-y-auto">
             
             <!-- Sidebar Scenario Config -->
             <div class="col-span-12 lg:col-span-4 space-y-6">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <h3 class="font-bold text-slate-800 mb-4">Simulation Configuration</h3>
                   
                   <div class="space-y-4">
                      <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Scenario Name</label>
                        <div class="font-bold text-slate-900 text-lg leading-tight">{{ threat().name }}</div>
                      </div>

                      <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                        <p class="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {{ threat().description }}
                        </p>
                      </div>
                      
                      <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Compromised Entry Point</label>
                        <div class="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                           <div class="w-8 h-8 rounded bg-red-200 flex items-center justify-center text-red-800 font-bold">EP</div>
                           <div class="text-sm font-medium text-red-900 break-all">{{ threat().entryPoint }}</div>
                        </div>
                      </div>
                   </div>
                </div>

                <!-- Exposure Heatmap -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <h3 class="font-bold text-slate-800 mb-4">Potential Business Impact</h3>
                   <div class="space-y-4">
                      <div class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                         <div class="text-xs text-red-600 font-bold uppercase">PII Records Exposed</div>
                         <div class="text-2xl font-bold text-slate-900">{{ threat().exposure.piiRecords | number }}</div>
                      </div>
                      <div class="p-3 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
                         <div class="text-xs text-orange-600 font-bold uppercase">Financial Records</div>
                         <div class="text-2xl font-bold text-slate-900">{{ threat().exposure.financialRecords | number }}</div>
                      </div>
                   </div>
                </div>
             </div>

             <!-- Main Vis: Attack Path (Kill Chain) -->
             <div class="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[600px] overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 class="font-bold text-slate-800 flex items-center gap-2">
                     <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                     Attack Kill Chain Visualization
                  </h3>
                  <p class="text-xs text-slate-400">Calculated path of least resistance to critical assets.</p>
                </div>
                
                <div class="flex-1 relative">
                   <div #threatGraph class="w-full h-full bg-slate-50"></div>
                </div>
                
                <!-- Mitigations -->
                <div class="px-6 py-4 bg-slate-50 border-t border-slate-200">
                   <h4 class="font-bold text-sm text-slate-700 mb-2">Recommended Mitigations</h4>
                   <div class="flex flex-wrap gap-2">
                      @for (mit of threat().mitigations; track mit) {
                         <span class="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-600 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                            {{ mit }}
                         </span>
                      }
                   </div>
                </div>
             </div>
          </div>
        }

      </div>
      
      <!-- Hover Tooltip / Popover -->
      @if (hoveredNode()) {
        <div class="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-lg p-3 w-64 animate-fade-in"
             [style.left.px]="tooltipPos()?.x"
             [style.top.px]="tooltipPos()?.y"
             (mouseenter)="keepTooltipOpen()"
             (mouseleave)="hideTooltip()">
          <h4 class="font-bold text-sm mb-2 text-slate-800 border-b border-slate-100 pb-1 flex justify-between items-center">
            <span class="truncate">{{ hoveredNode().label }}</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">{{ hoveredNode().category }}</span>
          </h4>
          
          <div class="text-xs text-slate-500 font-semibold mb-1">Contains ({{ hoveredNode().members?.length || 0 }}):</div>
          
          <ul class="text-xs text-slate-600 space-y-1.5 mb-3">
            @if (hoveredNode().members && hoveredNode().members.length > 0) {
              @for (item of hoveredNode().members.slice(0, 5); track item) {
                <li class="flex items-center gap-2">
                   <div class="w-1.5 h-1.5 rounded-full bg-cydenti-blue/60"></div> {{ item }}
                </li>
              }
              @if (hoveredNode().members.length > 5) {
                <div class="text-[10px] text-slate-400 italic pl-3">+ {{ hoveredNode().members.length - 5 }} more...</div>
              }
            } @else {
              <li class="italic text-slate-400 pl-3">No direct members</li>
            }
          </ul>
          
          <button class="w-full py-1.5 bg-cydenti-blue hover:bg-blue-700 text-white text-xs font-bold rounded transition-colors shadow-sm flex items-center justify-center gap-2">
             <span>View Full List</span>
             <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.15s ease-out forwards; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(2px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AccessExplorerComponent implements AfterViewInit {
  initialContext = input<{id: string, type: string} | null>(null);
  activeTab = signal<'identity' | 'resource' | 'threat'>('identity');
  viewMode = signal<'detailed' | 'effective'>('detailed');
  
  selectedIdentityId = signal('U-M365-1'); 
  selectedResourceId = signal('S-M365-1'); 
  selectedThreatId = signal('U-M365-1'); 

  // Interaction State
  hoveredNode = signal<any>(null);
  tooltipPos = signal<{x: number, y: number} | null>(null);
  blastRadiusNodeId = signal<string | null>(null);
  
  private hoverTimeout: any;

  // Computed Data
  identity = computed(() => this.dataService.getIdentityProfile(this.selectedIdentityId()));
  resource = computed(() => this.dataService.getResourceProfile(this.selectedResourceId()));
  threat = computed(() => this.dataService.getThreatScenario(this.selectedThreatId()));
  
  availableIdentities = this.dataService.getAvailableIdentities();
  availableResources = this.dataService.getAvailableResources();
  availableThreats = this.dataService.getAvailableThreats();

  @ViewChild('identityGraph') private graphContainer!: ElementRef;
  @ViewChild('threatGraph') private threatContainer!: ElementRef;

  private zoom: any;
  private svg: any;

  constructor(private dataService: DataService) {
    effect(() => {
      const context = this.initialContext();
      if (context) {
        if (context.type === 'identity') {
          this.activeTab.set('identity');
          const exists = this.availableIdentities.some(i => i.id === context.id);
          this.selectedIdentityId.set(exists ? context.id : 'U-M365-1');
        } else if (context.type === 'threat') {
          this.activeTab.set('threat');
          const exists = this.availableThreats.some(t => t.id === context.id);
          this.selectedThreatId.set(exists ? context.id : 'U-M365-1');
        } else if (context.type.includes('sharepoint') || context.type.includes('record') || context.type.includes('file')) {
          this.activeTab.set('resource');
          const exists = this.availableResources.some(r => r.id === context.id);
          this.selectedResourceId.set(exists ? context.id : 'S-M365-1');
        } 
      }
    });

    effect(() => {
       const tab = this.activeTab();
       const mode = this.viewMode(); // Trigger re-render on toggle
       if (tab === 'identity') setTimeout(() => this.renderLocalizedGraph(), 100);
       if (tab === 'threat') setTimeout(() => this.renderThreatGraph(), 100);
    });
  }

  ngAfterViewInit() {
    if (this.activeTab() === 'identity') this.renderLocalizedGraph();
  }

  setViewMode(mode: 'detailed' | 'effective') {
    this.viewMode.set(mode);
    this.blastRadiusNodeId.set(null); // Reset focus
  }

  resetGraph() {
     this.blastRadiusNodeId.set(null);
     this.updateBlastRadiusVisuals();
     if (this.svg && this.zoom) {
       this.svg.transition().duration(750).call(
          this.zoom.transform, 
          d3.zoomIdentity.translate(50, 50).scale(0.8)
       );
     }
  }

  // --- TOOLTIP LOGIC ---
  showTooltip(event: MouseEvent, node: any) {
    clearTimeout(this.hoverTimeout);
    this.hoveredNode.set(node);
    const x = event.clientX + 15;
    const y = event.clientY - 10;
    this.tooltipPos.set({ x, y });
  }

  hideTooltip() {
    this.hoverTimeout = setTimeout(() => {
      this.hoveredNode.set(null);
    }, 200); 
  }

  keepTooltipOpen() {
    clearTimeout(this.hoverTimeout);
  }

  toggleBlastRadius(node: any) {
    if (this.blastRadiusNodeId() === node.id) {
        this.blastRadiusNodeId.set(null);
    } else {
        this.blastRadiusNodeId.set(node.id);
    }
    this.updateBlastRadiusVisuals();
  }

  updateBlastRadiusVisuals() {
    const rootId = this.blastRadiusNodeId();
    if (!this.svg) return;

    if (!rootId) {
        // Reset opacities
        this.svg.selectAll('g.node').transition().style('opacity', 1);
        this.svg.selectAll('path.link').transition().style('opacity', 0.6).attr('stroke', '#94a3b8');
        return;
    }

    // Calculate reachability (simple BFS for visual feedback)
    const graphData = this.identity().graphData;
    const connectedIds = new Set([rootId]);
    const connectedLinks = new Set();
    
    // Bidirectional Traversal for context
    const queue = [rootId];
    // A simple approach for this dataset: find everything touching current set
    // Repeating a few times to propagate
    for(let i=0; i<4; i++) {
        graphData.links.forEach((l: any) => {
             if (connectedIds.has(l.source) && !connectedIds.has(l.target)) {
                 connectedIds.add(l.target);
                 connectedLinks.add(l);
             }
             if (connectedIds.has(l.target) && !connectedIds.has(l.source)) {
                 connectedIds.add(l.source);
                 connectedLinks.add(l);
             }
             if (connectedIds.has(l.source) && connectedIds.has(l.target)) {
                 connectedLinks.add(l);
             }
        });
    }

    // Apply Dimming
    this.svg.selectAll('g.node')
        .transition()
        .style('opacity', (d: any) => connectedIds.has(d.id) ? 1 : 0.1);

    this.svg.selectAll('path.link')
        .transition()
        .style('opacity', (d: any) => connectedLinks.has(d) ? 1 : 0.05)
        .attr('stroke', (d: any) => connectedLinks.has(d) ? '#ef4444' : '#94a3b8');
  }

  // --- IDENTITY GRAPH (Structured Column Layout) ---
  private renderLocalizedGraph() {
    if (!this.graphContainer) return;
    
    const element = this.graphContainer.nativeElement;
    d3.select(element).selectAll('*').remove();
    
    const width = element.clientWidth;
    const height = element.clientHeight || 600;

    this.svg = d3.select(element).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height]);

    const g = this.svg.append('g');

    this.zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: any) => {
        g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    let graphData = JSON.parse(JSON.stringify(this.identity().graphData)); // Deep copy

    // --- EFFECTIVE ACCESS MODE TRANSFORM ---
    if (this.viewMode() === 'effective') {
        const identities = graphData.nodes.filter((n:any) => n.category === 'Identity');
        const resources = graphData.nodes.filter((n:any) => n.category === 'Resource');
        // Synthetic simple links for demo
        const simpleLinks = [];
        let i = 0;
        for (const id of identities) {
             for (const res of resources) {
                 if ((i++) % 3 === 0) continue; // Random sparsity
                 simpleLinks.push({ source: id.id, target: res.id, label: 'Effective Access' });
             }
        }
        graphData.nodes = [...identities, ...resources];
        graphData.links = simpleLinks;
    }

    // --- CONFIGURATION ---
    const nodeWidth = 220;
    const nodeHeight = 50;
    const colSpacing = this.viewMode() === 'effective' ? 600 : 300; 
    const nodeYSpacing = 70; 

    const categories = this.viewMode() === 'effective' 
       ? ['Identity', 'Resource']
       : ['Identity', 'IdentitySet', 'Entitlement', 'Resource', 'DataObject'];
    
    // Group nodes by category
    const nodesByCategory: Record<string, any[]> = {};
    categories.forEach(c => nodesByCategory[c] = []);
    
    graphData.nodes.forEach((n: any) => {
      if (nodesByCategory[n.category]) {
        nodesByCategory[n.category].push(n);
      }
    });

    // Calculate positions
    const nodes = graphData.nodes.map((n: any) => {
      const colIndex = categories.indexOf(n.category);
      const nodesInCol = nodesByCategory[n.category] || [];
      const nodeIndex = nodesInCol.indexOf(n);
      
      const totalColHeight = nodesInCol.length * nodeYSpacing;
      const startY = (height / 2) - (totalColHeight / 2);

      return {
        ...n,
        _x: colIndex * colSpacing,
        _y: startY + (nodeIndex * nodeYSpacing),
        _width: nodeWidth,
        _height: nodeHeight
      };
    });

    // --- DRAW DASHED BOX FOR IDENTITY SET (Column 2) ---
    // Only in Detailed Mode
    if (this.viewMode() === 'detailed') {
        const identitySetNodes = nodes.filter((n: any) => n.category === 'IdentitySet');
        if (identitySetNodes.length > 0) {
          const minY = Math.min(...identitySetNodes.map((n: any) => n._y));
          const maxY = Math.max(...identitySetNodes.map((n: any) => n._y));
          const xPos = identitySetNodes[0]._x; 
          
          g.append('rect')
            .attr('x', xPos - 20)
            .attr('y', minY - 20)
            .attr('width', nodeWidth + 40)
            .attr('height', (maxY - minY) + nodeHeight + 40)
            .attr('fill', 'none')
            .attr('stroke', '#60a5fa') // Blue-400
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '8 4')
            .attr('rx', 12)
            .attr('opacity', 0.5);
        }
    }

    const nodeMap = new Map(nodes.map((n: any) => [n.id, n]));

    // --- DRAW LINKS ---
    g.append('g')
      .selectAll('g') // Groups for path + label
      .data(graphData.links)
      .enter().append('g')
      .each(function(this: any, d: any) {
        const source = nodeMap.get(d.source) as any;
        const target = nodeMap.get(d.target) as any;
        if (!source || !target) return;

        const sx = source._x + nodeWidth;
        const sy = source._y + nodeHeight / 2;
        const tx = target._x;
        const ty = target._y + nodeHeight / 2;

        const pathData = d3.linkHorizontal()
          .x((d: any) => d.x)
          .y((d: any) => d.y)
          ({source: {x: sx, y: sy}, target: {x: tx, y: ty}});

        const el = d3.select(this);
        
        el.append('path')
          .attr('class', 'link')
          .attr('d', pathData)
          .attr('fill', 'none')
          .attr('stroke', '#94a3b8')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.6);

        if (d.label) {
            // Label on the path center
            el.append('rect')
               .attr('x', (sx + tx)/2 - 40)
               .attr('y', (sy + ty)/2 - 8)
               .attr('width', 80)
               .attr('height', 16)
               .attr('rx', 4)
               .attr('fill', '#fff')
               .attr('stroke', '#cbd5e1')
               .attr('class', 'link-label-bg')
               .attr('opacity', 1);

            el.append('text')
               .attr('x', (sx + tx)/2)
               .attr('y', (sy + ty)/2 + 3)
               .text(d.label)
               .attr('text-anchor', 'middle')
               .attr('font-size', '9px')
               .attr('fill', '#64748b')
               .attr('class', 'link-label');
        }
      });

    // --- DRAW NODES ---
    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d._x},${d._y})`)
      .attr('cursor', 'pointer')
      .on('click', (event: any, d: any) => {
         event.stopPropagation();
         this.toggleBlastRadius(d);
      })
      .on('mouseenter', (event: any, d: any) => this.showTooltip(event, d))
      .on('mouseleave', () => this.hideTooltip());

    // Node Rect
    nodeGroup.append('rect')
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('rx', 8)
      .attr('fill', (d: any) => {
         if (d.riskLevel === 'critical' && d.category === 'Identity') return '#fef2f2'; // light red
         if (d.riskLevel === 'critical' && d.category === 'Resource') return '#fffbeb'; // light gold
         return this.getNodeStyle(d.category).fill;
      })
      .attr('stroke', (d: any) => {
         if (d.riskLevel === 'critical' && d.category === 'Identity') return '#ef4444'; // Red
         if (d.riskLevel === 'critical' && d.category === 'Resource') return '#f59e0b'; // Gold
         return this.getNodeStyle(d.category).stroke;
      })
      .attr('stroke-width', (d: any) => d.riskLevel === 'critical' ? 2 : 1)
      .attr('class', 'shadow-sm transition-all');

    // Risk Indicator (Red Dot for Critical)
    nodeGroup.filter((d: any) => d.riskLevel === 'critical')
      .append('circle')
      .attr('cx', nodeWidth - 8)
      .attr('cy', 8)
      .attr('r', 4)
      .attr('fill', '#ef4444')
      .attr('class', 'animate-pulse');

    // Node Label
    nodeGroup.append('text')
      .attr('x', 10)
      .attr('y', nodeHeight / 2 + 4)
      .text((d: any) => d.label.length > 28 ? d.label.substring(0, 26) + '...' : d.label)
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('fill', '#1e293b');

    // Connector Dots
    nodeGroup.filter((d: any) => d.category !== 'Identity')
      .append('circle')
      .attr('cx', 0)
      .attr('cy', nodeHeight / 2)
      .attr('r', 3)
      .attr('fill', '#64748b');

    nodeGroup.filter((d: any) => d.category !== 'DataObject')
      .append('circle')
      .attr('cx', nodeWidth)
      .attr('cy', nodeHeight / 2)
      .attr('r', 3)
      .attr('fill', '#64748b');
      
    // Initial Zoom
    this.svg.call(this.zoom.transform, d3.zoomIdentity.translate(50, 50).scale(0.85));
    
    // Check if we need to restore blast radius visual state
    if (this.blastRadiusNodeId()) {
        this.updateBlastRadiusVisuals();
    }
  }

  private getNodeStyle(category: string): { fill: string, stroke: string } {
    switch(category) {
      case 'Identity': return { fill: '#dbeafe', stroke: '#3b82f6' }; // Blue
      case 'IdentitySet': return { fill: '#e0f2fe', stroke: '#0ea5e9' }; // Sky
      case 'Entitlement': return { fill: '#fef3c7', stroke: '#d97706' }; // Amber
      case 'Resource': return { fill: '#dcfce7', stroke: '#22c55e' }; // Green
      case 'DataObject': return { fill: '#ecfccb', stroke: '#84cc16' }; // Lime
      default: return { fill: '#f1f5f9', stroke: '#94a3b8' };
    }
  }

  // --- THREAT GRAPH ---
  private renderThreatGraph() {
    if (!this.threatContainer) return;
    
    const element = this.threatContainer.nativeElement;
    d3.select(element).selectAll('*').remove();
    
    const width = element.clientWidth;
    const height = element.clientHeight || 500;

    const svg = d3.select(element).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height]);

    const graphData = this.threat().graphData;

    svg.append('defs').append('marker')
      .attr('id', 'threat-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 32)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#ef4444');

    graphData.nodes.forEach((n: any, i) => {
      n.x = 100 + (i * 180); 
      n.y = height / 2;
    });

    svg.append('g').selectAll('path')
      .data(graphData.links)
      .enter().append('path')
      .attr('d', (d: any) => {
        const src = graphData.nodes.find(n => n.id === d.source) as any;
        const tgt = graphData.nodes.find(n => n.id === d.target) as any;
        return `M${src.x},${src.y} L${tgt.x},${tgt.y}`;
      })
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 3)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#threat-arrow)');

    svg.append('g').selectAll('text')
      .data(graphData.links)
      .enter().append('text')
      .attr('x', (d: any) => {
        const src = graphData.nodes.find(n => n.id === d.source) as any;
        const tgt = graphData.nodes.find(n => n.id === d.target) as any;
        return (src.x + tgt.x) / 2;
      })
      .attr('y', height / 2 - 10)
      .attr('text-anchor', 'middle')
      .text((d: any) => d.label)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#ef4444')
      .style('background', '#fff');

    const nodeGroup = svg.append('g').selectAll('g')
      .data(graphData.nodes)
      .enter().append('g')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

    nodeGroup.append('circle')
      .attr('r', 25)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('opacity', 0.5)
      .append('animate')
      .attr('attributeName', 'r')
      .attr('from', 25)
      .attr('to', 40)
      .attr('dur', '1.5s')
      .attr('repeatCount', 'indefinite');
    
    nodeGroup.append('circle').attr('r', 25)
      .attr('fill', (d: any) => d.type === 'threat-actor' ? '#1f2937' : this.getNodeColor(d))
      .attr('stroke', '#ef4444').attr('stroke-width', 3);

    nodeGroup.append('path').attr('d', (d: any) => this.getIconPath(d.type))
      .attr('fill', '#fff').attr('transform', 'translate(-9,-9) scale(0.75)');

    nodeGroup.append('text').text((d: any) => d.label)
       .attr('dy', 45).attr('text-anchor', 'middle')
       .attr('font-size', '11px').attr('font-weight', 'bold').attr('fill', '#1f2937');
  }

  private getNodeColor(d: any): string {
    if (d.type.startsWith('sf-')) return '#00a1e0'; 
    if (d.type.startsWith('gws-')) return '#ea4335';
    if (d.type.startsWith('slack-')) return '#e01e5a';
    if (d.type.startsWith('sharepoint-')) return '#0078d4';
    if (d.type === 'identity') return '#06b6d4';
    if (d.type === 'threat-actor') return '#1f2937';
    if (d.type === 'impact-node') return '#ef4444';
    return '#cbd5e1';
  }

  private getIconPath(type: string): string {
    if (type === 'threat-actor') return "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 13a4 4 0 0 1 0-8"; 
    if (type === 'impact-node') return "M12 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z"; 
    
    if (type.includes('profile') || type.includes('role')) return "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z";
    if (type.includes('perm')) return "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z";
    if (type.includes('drive')) return "M4 14h6v6H4z M14 4h6v6h-6z M4 4h6v6H4z M14 14h6v6h-6z";
    if (type === 'identity') return "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z";
    
    return "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z";
  }
}