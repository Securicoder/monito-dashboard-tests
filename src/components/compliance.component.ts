import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, ComplianceScore, Misconfiguration } from '../services/data.service';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full w-full bg-slate-50 flex flex-col font-sans overflow-hidden">
      
      <!-- Top Header -->
      <div class="bg-white border-b border-slate-200 px-8 py-6 flex-shrink-0">
         <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
               <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
               <h1 class="text-2xl font-black text-slate-900 tracking-tight">Compliance & Reporting</h1>
               <p class="text-sm text-slate-500">Monitor adherence to security frameworks and generate audit reports.</p>
            </div>
         </div>
      </div>

      <div class="flex-1 overflow-y-auto p-8">
         
         <!-- Score Cards (Horizontal Scroll) -->
         <div class="flex gap-6 overflow-x-auto pb-6 mb-2 snap-x">
            @for (item of scores(); track item.framework) {
               <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-w-[280px] snap-start flex flex-col justify-between group hover:border-cydenti-blue transition-all relative overflow-hidden">
                  
                  <div class="flex justify-between items-start mb-4 relative z-10">
                     <span class="text-sm font-bold text-slate-500 uppercase tracking-wide">{{ item.framework }}</span>
                     <div class="group relative">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-300 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <div class="absolute right-0 top-6 w-48 bg-slate-800 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                           {{ item.description }}
                        </div>
                     </div>
                  </div>

                  <div class="flex items-baseline gap-1 mb-6 relative z-10">
                     <span class="text-5xl font-black text-slate-900">{{ item.score }}</span>
                     <span class="text-lg font-bold text-slate-400">/{{ item.total }}</span>
                  </div>

                  <!-- Generate Report Button (Visible on Hover/Focus) -->
                  <button class="w-full py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-bold text-xs hover:bg-cydenti-blue hover:text-white hover:border-cydenti-blue transition-colors flex items-center justify-center gap-2 group-hover:bg-slate-100">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                     Generate Report
                  </button>
                  
                  <!-- Progress Bar Background -->
                  <div class="absolute bottom-0 left-0 h-1 bg-cydenti-blue transition-all duration-1000" [style.width.%]="(item.score / item.total) * 100"></div>
               </div>
            }
         </div>

         <!-- Toolbar & Filters -->
         <div class="bg-slate-50 border border-slate-200 rounded-t-xl p-4 flex flex-wrap gap-4 items-center justify-between sticky top-0 z-20 shadow-sm mt-4">
            
            <div class="relative flex-1 min-w-[200px] max-w-md">
               <input type="text" placeholder="Search Misconfigurations..." 
                  [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)"
                  class="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-cydenti-blue shadow-sm">
               <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <div class="flex items-center gap-2 relative">
               <button (click)="showFilters.set(!showFilters())" 
                  class="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-colors"
                  [class.border-cydenti-blue]="showFilters()" [class.text-cydenti-blue]="showFilters()">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  Add Filter
               </button>
               
               <button *ngIf="hasActiveFilters()" (click)="clearFilters()" class="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-200 flex items-center gap-2 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  Clear Filter
               </button>

               <!-- Filter Popover -->
               <div *ngIf="showFilters()" class="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 animate-fade-in-down">
                  <h4 class="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Filter By</h4>
                  
                  <div class="space-y-4">
                     <div>
                        <label class="text-xs font-bold text-slate-500 uppercase block mb-1">Severity</label>
                        <div class="space-y-1">
                           <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded">
                              <input type="checkbox" [checked]="filters().severity.includes('High')" (change)="toggleFilter('severity', 'High')" class="rounded text-cydenti-blue focus:ring-cydenti-blue"> High
                           </label>
                           <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded">
                              <input type="checkbox" [checked]="filters().severity.includes('Medium')" (change)="toggleFilter('severity', 'Medium')" class="rounded text-cydenti-blue focus:ring-cydenti-blue"> Medium
                           </label>
                        </div>
                     </div>
                     <div>
                        <label class="text-xs font-bold text-slate-500 uppercase block mb-1">Status</label>
                        <div class="space-y-1">
                           <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded">
                              <input type="checkbox" [checked]="filters().status.includes('Failed')" (change)="toggleFilter('status', 'Failed')" class="rounded text-cydenti-blue focus:ring-cydenti-blue"> Failed
                           </label>
                           <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded">
                              <input type="checkbox" [checked]="filters().status.includes('Passed')" (change)="toggleFilter('status', 'Passed')" class="rounded text-cydenti-blue focus:ring-cydenti-blue"> Passed
                           </label>
                        </div>
                     </div>
                  </div>
                  
                  <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                     <button (click)="showFilters.set(false)" class="text-xs font-bold text-cydenti-blue hover:underline">Close</button>
                  </div>
               </div>
            </div>
         </div>

         <!-- Table -->
         <div class="bg-white border border-t-0 border-slate-200 rounded-b-xl shadow-sm overflow-hidden">
            <table class="w-full text-left text-sm">
               <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                     <th class="px-6 py-4 font-bold text-slate-700 w-1/2">Title</th>
                     <th class="px-6 py-4 font-bold text-slate-700">Platform</th>
                     <th class="px-6 py-4 font-bold text-slate-700">Severity</th>
                     <th class="px-6 py-4 font-bold text-slate-700">Category</th>
                     <th class="px-6 py-4 font-bold text-slate-700 text-right">Status</th>
                  </tr>
               </thead>
               <tbody class="divide-y divide-slate-100">
                  @for (item of filteredItems(); track item.id) {
                     <tr (click)="selectItem(item)" class="hover:bg-slate-50 cursor-pointer transition-colors group">
                        <td class="px-6 py-4">
                           <div class="font-medium text-slate-900 group-hover:text-cydenti-blue transition-colors">{{ item.title }}</div>
                        </td>
                        <td class="px-6 py-4">
                           <div class="flex items-center gap-2">
                              @if (item.platform === 'aws') {
                                 <div class="w-6 h-6 rounded bg-[#FF9900]/10 flex items-center justify-center"><svg viewBox="0 0 24 24" class="w-4 h-4" fill="none"><path d="M12 2L2 22h20L12 2z" fill="#FF9900"/></svg></div>
                              } @else {
                                 <span class="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{{ item.platform }}</span>
                              }
                              <span class="text-xs text-slate-500">{{ item.tenant }}</span>
                           </div>
                        </td>
                        <td class="px-6 py-4">
                           <span class="text-xs font-bold px-2 py-1 rounded-full border"
                              [class.bg-red-50]="item.severity === 'High'"
                              [class.text-red-700]="item.severity === 'High'"
                              [class.border-red-100]="item.severity === 'High'"
                              [class.bg-yellow-50]="item.severity === 'Medium'"
                              [class.text-yellow-700]="item.severity === 'Medium'"
                              [class.border-yellow-100]="item.severity === 'Medium'">
                              {{ item.severity }}
                           </span>
                        </td>
                        <td class="px-6 py-4">
                           <span class="font-mono text-xs text-slate-600">{{ item.category }}</span>
                        </td>
                        <td class="px-6 py-4 text-right">
                           <span class="text-xs font-bold"
                              [class.text-red-600]="item.status === 'Failed'"
                              [class.text-emerald-600]="item.status === 'Passed'">
                              {{ item.status }}
                           </span>
                        </td>
                     </tr>
                  }
                  @if (filteredItems().length === 0) {
                     <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                           No misconfigurations found matching your filters.
                        </td>
                     </tr>
                  }
               </tbody>
            </table>
            
            <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
               <span>Items per page: <span class="font-bold text-slate-700">10</span></span>
               <div class="flex items-center gap-4">
                  <span>1 – {{ Math.min(10, filteredItems().length) }} of {{ filteredItems().length }}</span>
                  <div class="flex gap-1">
                     <button class="p-1 hover:bg-slate-200 rounded disabled:opacity-50" disabled><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button>
                     <button class="p-1 hover:bg-slate-200 rounded disabled:opacity-50" disabled><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg></button>
                  </div>
               </div>
            </div>
         </div>

      </div>

      <!-- Detail Slide-Over -->
      @if (selectedItem()) {
         <div class="fixed inset-0 z-50 flex justify-end">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" (click)="selectedItem.set(null)"></div>
            
            <!-- Panel -->
            <div class="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-slide-in-right flex flex-col">
               
               <div class="px-8 py-6 border-b border-slate-200 flex justify-between items-start sticky top-0 bg-white z-10">
                  <div class="pr-8">
                     <h2 class="text-xl font-bold text-slate-900 mb-2 leading-tight">{{ selectedItem()!.title }}</h2>
                     <div class="flex gap-2">
                        <span class="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{{ selectedItem()!.id }}</span>
                        <span class="text-xs font-bold px-2 py-0.5 rounded"
                           [class.bg-red-100]="selectedItem()!.status === 'Failed'" [class.text-red-700]="selectedItem()!.status === 'Failed'"
                           [class.bg-green-100]="selectedItem()!.status === 'Passed'" [class.text-green-700]="selectedItem()!.status === 'Passed'">
                           {{ selectedItem()!.status }}
                        </span>
                     </div>
                  </div>
                  <button (click)="selectedItem.set(null)" class="p-2 hover:bg-slate-100 rounded-full transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>

               <div class="p-8 space-y-8 flex-1">
                  
                  <section>
                     <h3 class="text-sm font-bold text-cydenti-blue uppercase tracking-wide mb-3 border-b border-slate-100 pb-1">Description</h3>
                     <p class="text-slate-600 text-sm leading-relaxed">{{ selectedItem()!.description }}</p>
                  </section>

                  <section>
                     <h3 class="text-sm font-bold text-cydenti-blue uppercase tracking-wide mb-3 border-b border-slate-100 pb-1">Impact</h3>
                     <p class="text-slate-600 text-sm leading-relaxed">{{ selectedItem()!.impact }}</p>
                  </section>

                  <section *ngIf="selectedItem()!.remediation.length > 0">
                     <h3 class="text-sm font-bold text-cydenti-blue uppercase tracking-wide mb-3 border-b border-slate-100 pb-1">Remediation</h3>
                     <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <ul class="space-y-2">
                           @for (step of selectedItem()!.remediation; track step; let i = $index) {
                              <li class="flex gap-3 text-sm text-slate-700">
                                 <span class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center">{{ i + 1 }}</span>
                                 <span>{{ step }}</span>
                              </li>
                           }
                        </ul>
                     </div>
                  </section>

                  <div class="grid grid-cols-2 gap-6">
                     <section>
                        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Tactics</h3>
                        <div class="flex flex-wrap gap-2">
                           @for (t of selectedItem()!.tactics; track t) {
                              <span class="text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">{{ t }}</span>
                           }
                        </div>
                     </section>
                     <section>
                        <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Compliance</h3>
                        <div class="flex flex-wrap gap-2">
                           @for (c of selectedItem()!.compliance; track c) {
                              <span class="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">{{ c }}</span>
                           }
                        </div>
                     </section>
                  </div>

               </div>

               <div class="p-6 border-t border-slate-200 bg-slate-50 sticky bottom-0 flex justify-end gap-3">
                  <button class="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold text-sm hover:bg-slate-50">Create Ticket</button>
                  <button class="px-4 py-2 bg-cydenti-blue text-white rounded-lg font-bold text-sm hover:bg-blue-700">Take Action</button>
               </div>

            </div>
         </div>
      }

    </div>
  `,
  styles: [`
    .animate-fade-in-down { animation: fadeInDown 0.2s ease-out; }
    .animate-slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    
    @keyframes fadeInDown {
       from { opacity: 0; transform: translateY(-10px); }
       to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideInRight {
       from { transform: translateX(100%); }
       to { transform: translateX(0); }
    }
  `]
})
export class ComplianceComponent {
  dataService = inject(DataService);
  Math = Math;

  scores = computed(() => this.dataService.getComplianceScores());
  items = computed(() => this.dataService.getMisconfigurations());
  
  searchQuery = signal('');
  showFilters = signal(false);
  
  filters = signal<{severity: string[], status: string[]}>({
    severity: [],
    status: []
  });

  selectedItem = signal<Misconfiguration | null>(null);

  filteredItems = computed(() => {
    let result = this.items();
    const query = this.searchQuery().toLowerCase();
    const activeFilters = this.filters();

    if (query) {
      result = result.filter(i => 
        i.title.toLowerCase().includes(query) || 
        i.description.toLowerCase().includes(query) ||
        i.id.toLowerCase().includes(query)
      );
    }

    if (activeFilters.severity.length > 0) {
      result = result.filter(i => activeFilters.severity.includes(i.severity));
    }

    if (activeFilters.status.length > 0) {
      result = result.filter(i => activeFilters.status.includes(i.status));
    }

    return result;
  });

  toggleFilter(type: 'severity' | 'status', value: string) {
    this.filters.update(f => {
      const list = f[type];
      const idx = list.indexOf(value);
      const newList = idx === -1 ? [...list, value] : list.filter(v => v !== value);
      return { ...f, [type]: newList };
    });
  }

  hasActiveFilters() {
    return this.filters().severity.length > 0 || this.filters().status.length > 0;
  }

  clearFilters() {
    this.filters.set({ severity: [], status: [] });
  }

  selectItem(item: Misconfiguration) {
    this.selectedItem.set(item);
  }
}
