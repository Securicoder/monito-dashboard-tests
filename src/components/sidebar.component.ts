import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-white border-r border-slate-200 text-slate-700 py-6 shadow-2xl relative z-20">
      
      <!-- Logo Area (Vertical Style) -->
      <div class="px-4 mb-8 flex flex-col items-center justify-center text-center">
        <!-- Icon -->
        <div class="w-12 h-12 mb-2 bg-white rounded-xl flex items-center justify-center shadow p-1 border border-slate-100">
           <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
              <!-- Outer Ring (Blue) -->
              <path d="M85 50 A 35 35 0 0 0 25 25" stroke="#1d4ed8" stroke-width="8" stroke-linecap="round" />
              <path d="M25 25 A 35 35 0 0 0 25 75" stroke="#1d4ed8" stroke-width="8" stroke-linecap="round" stroke-opacity="0.8" />
              <!-- Middle Ring (Teal) -->
              <path d="M70 50 A 20 20 0 0 0 30 50" stroke="#14b8a6" stroke-width="8" stroke-linecap="round" />
              <path d="M30 50 A 20 20 0 0 0 60 75" stroke="#14b8a6" stroke-width="8" stroke-linecap="round" />
              <!-- Inner C (Dark Blue) -->
              <path d="M55 45 A 8 8 0 1 0 55 55" stroke="#1e3a8a" stroke-width="8" stroke-linecap="round" />
           </svg>
        </div>
        
        <!-- Text -->
        <div class="hidden md:flex flex-col items-center opacity-0 md:opacity-100 transition-opacity duration-300" [class.hidden]="!isExpanded()">
          <span class="font-sans font-bold text-xl tracking-widest text-cydenti-blue leading-none mb-1">CYDENTI</span>
          <span class="text-[8px] text-cydenti-teal uppercase tracking-wide whitespace-nowrap">Securing Clouds . Safeguarding Cyberspace</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 flex flex-col gap-2 px-3">
        
        <!-- Dashboard -->
        <button 
          (click)="onNav('dashboard')"
          [class.bg-cydenti-blue]="currentView() === 'dashboard'"
          [class.text-white]="currentView() === 'dashboard'"
          [class.text-slate-600]="currentView() !== 'dashboard'"
          [class.hover:bg-slate-100]="currentView() !== 'dashboard'"
          class="flex items-center gap-3 p-3 rounded-lg font-medium transition-all w-full text-left group">
          <div class="w-6 h-6 flex items-center justify-center font-bold text-sm border-2 rounded-md transition-colors" 
               [class.border-white]="currentView() === 'dashboard'" 
               [class.border-slate-400]="currentView() !== 'dashboard'"
               [ngClass]="{'group-hover:border-cydenti-cyan': currentView() !== 'dashboard'}">D</div>
          <span class="hidden md:block">Dashboard</span>
        </button>

        <!-- Compliance -->
        <button 
          (click)="onNav('compliance')"
          [class.bg-cydenti-blue]="currentView() === 'compliance'"
          [class.text-white]="currentView() === 'compliance'"
          [class.text-slate-600]="currentView() !== 'compliance'"
          [class.hover:bg-slate-100]="currentView() !== 'compliance'"
          class="flex items-center gap-3 p-3 rounded-lg font-medium transition-all w-full text-left group">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 group-hover:text-cydenti-cyan transition-colors" [class.text-white]="currentView() === 'compliance'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="hidden md:block">Compliance</span>
        </button>

        <!-- Policies (NEW) -->
        <button 
          (click)="onNav('policies')"
          [class.bg-cydenti-blue]="currentView() === 'policies'"
          [class.text-white]="currentView() === 'policies'"
          [class.text-slate-600]="currentView() !== 'policies'"
          [class.hover:bg-slate-100]="currentView() !== 'policies'"
          class="flex items-center gap-3 p-3 rounded-lg font-medium transition-all w-full text-left group">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 group-hover:text-cydenti-cyan transition-colors" [class.text-white]="currentView() === 'policies'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span class="hidden md:block">Policies</span>
        </button>

        <!-- Explorer -->
        <button 
          (click)="onNav('explorer')"
          [class.bg-cydenti-blue]="currentView() === 'explorer'"
          [class.text-white]="currentView() === 'explorer'"
          [class.text-slate-600]="currentView() !== 'explorer'"
          [class.hover:bg-slate-100]="currentView() !== 'explorer'"
          class="flex items-center gap-3 p-3 rounded-lg font-medium transition-all w-full text-left group">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 group-hover:text-cydenti-cyan transition-colors" [class.text-white]="currentView() === 'explorer'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="hidden md:block">Graph Explorer</span>
        </button>

        <!-- Access -->
        <button 
          (click)="onNav('access')"
          [class.bg-cydenti-blue]="currentView() === 'access'"
          [class.text-white]="currentView() === 'access'"
          [class.text-slate-600]="currentView() !== 'access'"
          [class.hover:bg-slate-100]="currentView() !== 'access'"
          class="flex items-center gap-3 p-3 rounded-lg font-medium transition-all w-full text-left group">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 group-hover:text-cydenti-cyan transition-colors" [class.text-white]="currentView() === 'access'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span class="hidden md:block">Access Explorer</span>
        </button>

        <!-- Pipeline -->
        <button 
          (click)="onNav('pipeline')"
          [class.bg-cydenti-blue]="currentView() === 'pipeline'"
          [class.text-white]="currentView() === 'pipeline'"
          [class.text-slate-600]="currentView() !== 'pipeline'"
          [class.hover:bg-slate-100]="currentView() !== 'pipeline'"
          class="flex items-center gap-3 p-3 rounded-lg font-medium transition-all w-full text-left group">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 group-hover:text-cydenti-cyan transition-colors" [class.text-white]="currentView() === 'pipeline'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span class="hidden md:block">Data Pipeline</span>
        </button>

        <!-- Integrations -->
        <button 
          (click)="onNav('integrations')"
          [class.bg-cydenti-blue]="currentView() === 'integrations'"
          [class.text-white]="currentView() === 'integrations'"
          [class.text-slate-600]="currentView() !== 'integrations'"
          [class.hover:bg-slate-100]="currentView() !== 'integrations'"
          class="flex items-center gap-3 p-3 rounded-lg font-medium transition-all w-full text-left group">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 group-hover:text-cydenti-cyan transition-colors" [class.text-white]="currentView() === 'integrations'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
          <span class="hidden md:block">Integrations</span>
        </button>

      </nav>

      <!-- Bottom Actions -->
      <div class="p-4 border-t border-slate-200">
        <button class="flex items-center gap-3 text-slate-500 hover:text-cydenti-blue transition-colors w-full text-left">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="hidden md:block">Settings</span>
        </button>
      </div>
    </div>
  `
})
export class SidebarComponent {
  currentView = input<string>('explorer');
  navigate = output<string>();

  isExpanded = signal(true); 

  onNav(view: string) {
    this.navigate.emit(view);
  }
}
