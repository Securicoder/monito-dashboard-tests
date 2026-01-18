import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar.component';
import { HeaderComponent } from './components/header.component';
import { GraphVizComponent } from './components/graph-viz.component';
import { DetailsPanelComponent } from './components/details-panel.component';
import { DataPipelineComponent } from './components/data-pipeline.component';
import { AccessExplorerComponent } from './components/access-explorer.component';
import { DashboardComponent } from './components/dashboard.component';
import { IntegrationsComponent } from './components/integrations.component';
import { ComplianceComponent } from './components/compliance.component';
import { PoliciesComponent } from './components/policies.component';
import { DataService, GraphNode, GraphLink } from './services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, GraphVizComponent, DetailsPanelComponent, DataPipelineComponent, AccessExplorerComponent, DashboardComponent, IntegrationsComponent, ComplianceComponent, PoliciesComponent],
  template: `
    <div class="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      <!-- Sidebar -->
      <app-sidebar 
        class="flex-shrink-0 z-20 shadow-xl transition-all duration-300 ease-in-out overflow-hidden bg-white"
        [ngClass]="{
          'w-20': isSidebarOpen(),
          'md:w-64': isSidebarOpen(),
          'w-0': !isSidebarOpen(),
          'opacity-0': !isSidebarOpen()
        }"
        [currentView]="currentView()"
        (navigate)="onNavigate($event)">
      </app-sidebar>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col relative h-full overflow-hidden">
        
        <!-- Sidebar Toggle (Global) -->
        <button (click)="toggleSidebar()" 
                class="absolute top-4 left-4 z-50 p-2 rounded-lg bg-white/80 hover:bg-slate-100 text-slate-500 hover:text-cydenti-blue border border-slate-200 transition-colors backdrop-blur-sm shadow-md group"
                title="Toggle Sidebar">
           <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             @if (isSidebarOpen()) {
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
             } @else {
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
             }
           </svg>
        </button>

        <!-- Show Header only on Explorer View -->
        @if (currentView() === 'explorer') {
          <app-header 
            class="h-20 bg-white border-b border-slate-200 z-10 flex-shrink-0 pl-16 transition-all duration-300"
            [totalIdentities]="totalIdentities()"
            [highRiskCount]="highRiskCount()"
            [totalRelationships]="totalRelationships()"
            [resourceCount]="resourceCount()"
            (filterPlatform)="onPlatformFilterChange($event)"
            (filterRisk)="onRiskFilterChange($event)"
            (search)="onSearch($event)"
            (modeChange)="onGraphModeChange($event)">
          </app-header>
        }

        <!-- View Switcher -->
        <div class="flex-1 relative overflow-hidden bg-slate-50">
          
          @if (currentView() === 'dashboard') {
            <app-dashboard class="w-full h-full block overflow-y-auto"></app-dashboard>
          }

          @if (currentView() === 'integrations') {
            <app-integrations class="w-full h-full block overflow-y-auto"></app-integrations>
          }

          @if (currentView() === 'compliance') {
            <app-compliance class="w-full h-full block overflow-y-auto"></app-compliance>
          }

          @if (currentView() === 'policies') {
            <app-policies class="w-full h-full block overflow-y-auto"></app-policies>
          }

          @if (currentView() === 'explorer') {
            <app-graph-viz 
              class="absolute inset-0 w-full h-full"
              [graphMode]="graphMode()"
              [filterPlatform]="filterPlatform()"
              [filterRisk]="filterRisk()"
              [searchQuery]="searchQuery()"
              (nodeSelect)="onNodeSelected($event)">
            </app-graph-viz>
            
            <!-- Legend Overlay -->
            <div class="absolute bottom-4 left-4 bg-white/95 backdrop-blur border border-slate-200 p-3 rounded-lg shadow-lg text-xs z-10 pointer-events-none select-none text-slate-700">
              <h4 class="font-bold mb-2 text-slate-900">Identity & Access Map</h4>
              <div class="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-cyan-500"></div> <span>Identity (NHI/User)</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-blue-600"></div> <span>Okta (IDP)</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-violet-500"></div> <span>Group</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-amber-500"></div> <span>Role (Permissions)</span>
                </div>
                <div class="flex items-center gap-2 col-span-2">
                  <div class="w-3 h-3 rounded-full bg-emerald-500"></div> <span>Resource (DB/Drive)</span>
                </div>
              </div>

              <h4 class="font-bold mb-2 text-slate-900 pt-2 border-t border-slate-200">Blast Radius</h4>
              <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full border-2 border-red-500"></div> <span>Critical Risk</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex items-center justify-center w-5 h-5 bg-slate-100 rounded-full border border-slate-300"><div class="w-1.5 h-1.5 bg-slate-400 rounded-full"></div></div> 
                  <span>Node Size = Impact</span>
                </div>
              </div>
            </div>
          }

          @if (currentView() === 'pipeline') {
            <app-data-pipeline class="w-full h-full block"></app-data-pipeline>
          }

          @if (currentView() === 'access') {
            <app-access-explorer 
               class="w-full h-full block"
               [initialContext]="accessContext()">
            </app-access-explorer>
          }

        </div>

      </main>

      <!-- Right Details Panel (Only in Explorer) -->
      @if (selectedNode() && currentView() === 'explorer') {
        <app-details-panel 
          class="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-slate-200 z-30 transform transition-transform duration-300"
          [node]="selectedNode()!"
          (close)="onNodeSelected(null)"
          (investigate)="onInvestigate($event)"
          (simulate)="onSimulate($event)">
        </app-details-panel>
      }
    </div>
  `,
  styles: []
})
export class AppComponent {
  currentView = signal<string>('dashboard'); 
  isSidebarOpen = signal<boolean>(true);

  selectedNode = signal<GraphNode | null>(null);
  
  // Context for Access Explorer deep linking
  accessContext = signal<{id: string, type: string} | null>(null);
  
  // Stats
  totalIdentities = signal(0);
  highRiskCount = signal(0);
  totalRelationships = signal(0);
  resourceCount = signal(0);

  // Filters state
  filterPlatform = signal<string>('all');
  filterRisk = signal<string>('all');
  searchQuery = signal<string>('');
  graphMode = signal<'full' | 'nhi'>('full');

  constructor(private dataService: DataService) {
    const nodes = this.dataService.getNodes();
    const links = this.dataService.getLinks();
    this.totalIdentities.set(nodes.length);
    this.highRiskCount.set(nodes.filter(n => n.riskLevel === 'critical' || n.riskLevel === 'high').length);
    this.totalRelationships.set(links.length);
    
    const resourceTypes = [
      'sharepoint-site', 'sharepoint-lib', 'sharepoint-file', 
      'sf-object', 'sf-record', 'sf-field',
      'gws-drive', 'gws-folder', 'gws-file',
      'slack-channel'
    ];
    this.resourceCount.set(nodes.filter(n => resourceTypes.includes(n.type)).length);
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  onNavigate(view: string) {
    this.currentView.set(view);
    this.accessContext.set(null); 
  }

  onNodeSelected(node: GraphNode | null) {
    this.selectedNode.set(node);
  }
  
  onInvestigate(nodeId: string) {
    const node = this.dataService.getNodes().find(n => n.id === nodeId);
    if (node) {
      this.accessContext.set({ id: node.id, type: node.type });
      this.currentView.set('access');
      this.selectedNode.set(null);
    }
  }

  onSimulate(nodeId: string) {
    const node = this.dataService.getNodes().find(n => n.id === nodeId);
    if (node) {
      this.accessContext.set({ id: node.id, type: 'threat' }); // Special type for threat tab
      this.currentView.set('access');
      this.selectedNode.set(null);
    }
  }

  onPlatformFilterChange(platform: string) {
    this.filterPlatform.set(platform);
  }

  onRiskFilterChange(risk: string) {
    this.filterRisk.set(risk);
  }

  onSearch(query: string) {
    this.searchQuery.set(query);
  }

  onGraphModeChange(mode: 'full' | 'nhi') {
    this.graphMode.set(mode);
  }
}
