import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="flex flex-col border-b border-slate-200 bg-white shadow-sm z-30 relative">
      
      <!-- Top Row: Stats (Preserved from original design, optional) -->
      <div class="flex items-center justify-between px-6 py-3 border-b border-slate-100 text-sm">
        <div class="flex items-center gap-6">
           <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded bg-cydenti-blue/10 flex items-center justify-center text-cydenti-blue">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <span class="font-bold text-lg text-slate-800 tracking-tight">Graph Explorer</span>
           </div>
           <div class="h-6 w-px bg-slate-200"></div>
           <div class="flex gap-4 text-xs text-slate-500">
             <div>Identities: <span class="font-bold text-slate-900">{{ totalIdentities() }}</span></div>
             <div>Relationships: <span class="font-bold text-slate-900">{{ totalRelationships() }}</span></div>
             <div class="text-risk-critical">Critical: <span class="font-bold">{{ highRiskCount() }}</span></div>
           </div>
        </div>
        
        <!-- Filters Button -->
        <button class="bg-cydenti-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
           <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
           Filters
        </button>
      </div>

      <!-- Bottom Row: Specific From/To Filters -->
      <div class="px-6 py-4 bg-slate-50/50 flex flex-wrap items-center gap-8">
        
        <!-- FROM Section -->
        <div class="flex flex-col gap-1">
           <span class="text-xs font-bold text-slate-900 uppercase tracking-wide">From</span>
           <div class="flex gap-3">
              <!-- Platform -->
              <div class="relative group">
                 <label class="block text-[10px] text-slate-500 mb-0.5">Platform</label>
                 <select (change)="onPlatformChange($event)" class="appearance-none bg-white border border-slate-300 text-slate-700 py-2 pl-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-cydenti-blue text-sm font-medium w-40 shadow-sm cursor-pointer hover:border-cydenti-blue/50 transition-colors">
                    <option value="all">All Platforms</option>
                    <option value="salesforce">Salesforce</option>
                    <option value="sharepoint">SharePoint</option>
                    <option value="entra">Entra ID</option>
                    <option value="google">Google Workspace</option>
                    <option value="azure">Azure</option>
                 </select>
                 <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 pt-4">
                    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                 </div>
              </div>

              <!-- Type -->
              <div class="relative group">
                 <label class="block text-[10px] text-slate-500 mb-0.5">Type</label>
                 <select class="appearance-none bg-white border border-slate-300 text-cydenti-teal py-2 pl-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-cydenti-teal text-sm font-medium w-48 shadow-sm cursor-pointer hover:border-cydenti-teal/50 transition-colors">
                    <option>Any</option>
                    <option selected>Resource:Tenant</option>
                    <option>Identity:User</option>
                 </select>
                 <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 pt-4">
                    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                 </div>
              </div>

               <!-- Name (Highlighted Field) -->
              <div class="relative group">
                 <label class="block text-[10px] text-slate-500 mb-0.5 font-bold">Name</label>
                 <div class="relative">
                    <select class="appearance-none bg-white border-2 border-slate-700 text-slate-900 py-2 pl-3 pr-8 rounded-lg leading-tight focus:outline-none text-sm font-bold w-64 shadow-sm cursor-pointer">
                        <option>Securigeek.cloud (prod)</option>
                    </select>
                     <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                     </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Divider -->
        <div class="h-10 w-px bg-slate-200 mt-4"></div>

        <!-- TO Section -->
        <div class="flex flex-col gap-1">
           <span class="text-xs font-bold text-slate-900 uppercase tracking-wide">To</span>
           <div class="flex gap-3">
              <!-- Type -->
              <div class="relative group">
                 <label class="block text-[10px] text-slate-500 mb-0.5">Type</label>
                 <select class="appearance-none bg-white border border-slate-300 text-cydenti-teal py-2 pl-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-cydenti-teal text-sm font-medium w-40 shadow-sm cursor-pointer hover:border-cydenti-teal/50 transition-colors">
                    <option selected>None</option>
                    <option>Identity</option>
                    <option>Resource</option>
                 </select>
                 <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 pt-4">
                    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </header>
  `
})
export class HeaderComponent {
  totalIdentities = input.required<number>();
  highRiskCount = input.required<number>();
  totalRelationships = input.required<number>();
  resourceCount = input.required<number>();

  filterPlatform = output<string>();
  filterRisk = output<string>();
  search = output<string>();

  onPlatformChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.filterPlatform.emit(val);
  }

  onRiskChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.filterRisk.emit(val);
  }

  onSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.search.emit(val);
  }
}
