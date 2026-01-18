import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphNode } from '../services/data.service';

@Component({
  selector: 'app-details-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col p-6 overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-start mb-6">
        <div>
           <div class="flex items-center gap-2 mb-1">
             <span class="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide"
               [class.bg-risk-critical]="node().riskLevel === 'critical'"
               [class.bg-risk-high]="node().riskLevel === 'high'"
               [class.bg-risk-medium]="node().riskLevel === 'medium'"
               [class.bg-risk-low]="node().riskLevel === 'low'"
               [class.text-white]="true"
               [class.text-slate-900]="node().riskLevel === 'medium'">
               {{ node().riskLevel }}
             </span>
             <span class="text-xs text-slate-500 font-mono">{{ node().platform }}</span>
           </div>
           <h2 class="text-xl font-bold text-slate-900 break-words">{{ node().label }}</h2>
           <p class="text-sm text-slate-500 capitalize">{{ node().subType || node().type }}</p>
        </div>
        <button (click)="close.emit()" class="text-slate-400 hover:text-slate-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Risk Score -->
      <div class="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div class="flex justify-between items-center mb-2">
           <span class="text-sm font-medium text-slate-500">Risk Score</span>
           <span class="text-2xl font-bold" 
             [class.text-risk-critical]="node().riskScore >= 90"
             [class.text-risk-high]="node().riskScore >= 70 && node().riskScore < 90"
             [class.text-risk-medium]="node().riskScore >= 40 && node().riskScore < 70"
             [class.text-risk-low]="node().riskScore < 40">
             {{ node().riskScore }}<span class="text-sm text-slate-400">/100</span>
           </span>
        </div>
        <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all duration-1000 ease-out"
             [style.width.%]="node().riskScore"
             [class.bg-risk-critical]="node().riskScore >= 90"
             [class.bg-risk-high]="node().riskScore >= 70 && node().riskScore < 90"
             [class.bg-risk-medium]="node().riskScore >= 40 && node().riskScore < 70"
             [class.bg-risk-low]="node().riskScore < 40">
          </div>
        </div>
      </div>

      <!-- Metrics Grid -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div class="text-xs text-slate-500 mb-1">Blast Radius</div>
          <div class="text-lg font-semibold text-cydenti-cyan">{{ node().blastRadius }} <span class="text-xs font-normal text-slate-400">Resources</span></div>
        </div>
         <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div class="text-xs text-slate-500 mb-1">Last Active</div>
          <div class="text-sm font-semibold text-slate-700 truncate">{{ node().lastActive || 'N/A' }}</div>
        </div>
      </div>

      <!-- Details List -->
      <div class="space-y-4 mb-8">
        <div>
          <h3 class="text-sm font-bold text-slate-700 mb-2 border-b border-slate-200 pb-1">Properties</h3>
          <div class="grid grid-cols-[100px_1fr] gap-2 text-sm">
            <span class="text-slate-500">Type</span>
            <span class="text-slate-900 capitalize">{{ node().type }}</span>
            
            <span class="text-slate-500">ID</span>
            <span class="text-slate-900 font-mono text-xs">{{ node().id }}</span>
            
            <span class="text-slate-500">Created</span>
            <span class="text-slate-900">{{ node().createdDate || 'Unknown' }}</span>
          </div>
        </div>

        @if (node().description) {
          <div>
            <h3 class="text-sm font-bold text-slate-700 mb-2 border-b border-slate-200 pb-1">Description</h3>
            <p class="text-sm text-slate-600 italic">{{ node().description }}</p>
          </div>
        }
      </div>

      <!-- Actions -->
      <div class="mt-auto space-y-3">
        <!-- Main Actions -->
        @if (node().type === 'identity') {
          <button (click)="onSimulate()" class="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 group shadow-md shadow-red-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Simulate Attack Path
          </button>
        } @else {
           <button (click)="onInvestigate()" class="w-full py-2.5 px-4 bg-cydenti-teal hover:bg-teal-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 group">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Investigate Deeply
          </button>
        }
        
        <div class="grid grid-cols-2 gap-3">
          <button class="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Ticket
          </button>
          <button class="py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Lockdown
          </button>
        </div>
      </div>

    </div>
  `
})
export class DetailsPanelComponent {
  node = input.required<GraphNode>();
  close = output<void>();
  investigate = output<string>();
  simulate = output<string>();

  onInvestigate() {
    this.investigate.emit(this.node().id);
  }

  onSimulate() {
    this.simulate.emit(this.node().id);
  }
}