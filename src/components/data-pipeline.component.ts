import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StreamPacket {
  id: number;
  x: number;
  label: string;
  type: 'user' | 'nhi' | 'app';
  color: string;
}

@Component({
  selector: 'app-data-pipeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full bg-slate-50 text-slate-900 relative overflow-hidden flex">
      
      <!-- LEFT COLUMN: Pipeline Visualization (Flex-Grow) -->
      <div class="flex-1 flex flex-col p-6 pl-16 relative z-10 h-full overflow-hidden transition-all">
        
        <!-- Header with Cydenti Complete Logo & New Title -->
        <div class="mb-8 text-center flex-shrink-0 flex flex-col items-center">
          <div class="flex items-center gap-4 mb-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
             <!-- Horizontal Logo SVG -->
             <svg viewBox="0 0 100 100" fill="none" class="w-16 h-16">
                <path d="M85 50 A 35 35 0 0 0 25 25" stroke="#1d4ed8" stroke-width="10" stroke-linecap="round" />
                <path d="M25 25 A 35 35 0 0 0 25 75" stroke="#1d4ed8" stroke-width="10" stroke-linecap="round" stroke-opacity="0.8" />
                <path d="M70 50 A 20 20 0 0 0 30 50" stroke="#14b8a6" stroke-width="10" stroke-linecap="round" />
                <path d="M30 50 A 20 20 0 0 0 60 75" stroke="#14b8a6" stroke-width="10" stroke-linecap="round" />
                <path d="M55 45 A 8 8 0 1 0 55 55" stroke="#1e3a8a" stroke-width="10" stroke-linecap="round" />
             </svg>
             <div class="flex flex-col items-start">
                <h1 class="text-4xl font-bold text-cydenti-blue font-sans tracking-wide uppercase leading-none">
                  CYDENTI
                </h1>
                <h2 class="text-sm text-cydenti-teal font-medium tracking-widest uppercase mt-1">
                  Identity, Visual Intelligence & Blast Radius
                </h2>
             </div>
          </div>
        </div>

        <!-- Pipeline Animation Box -->
        <div class="flex-1 flex items-center justify-between w-full max-w-7xl mx-auto gap-4">
          
          <!-- 1. INGESTION (Sources) -->
          <div class="flex flex-col gap-3 w-32 flex-shrink-0">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center mb-2">Sources</div>
            
            @for (src of sources; track src.name) {
              <div class="relative group">
                <div class="bg-white border border-slate-200 p-2 rounded-lg flex items-center gap-2 shadow-sm relative z-10 group-hover:border-cydenti-blue transition-colors">
                  <div class="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold"
                       [ngClass]="src.color">
                    {{ src.initials }}
                  </div>
                  <div class="flex flex-col overflow-hidden">
                    <span class="text-[10px] font-bold truncate text-slate-700">{{ src.name }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Flow Line 1 -->
          <div class="flex-1 h-32 relative overflow-hidden mx-2">
             <svg class="absolute inset-0 w-full h-full pointer-events-none z-0">
               <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />
             </svg>
             @for (p of packets1; track p.id) {
               <div class="absolute top-1/2 -translate-y-1/2 z-10 flex flex-col items-center transition-all duration-75"
                    [style.left.%]="p.x">
                  <div class="px-2 py-0.5 rounded text-[9px] font-mono font-bold border shadow-md whitespace-nowrap bg-white text-slate-700"
                       [ngClass]="p.color">
                    {{ p.label }}
                  </div>
                  <div class="h-3 w-px bg-slate-400 my-0.5"></div>
                  <div class="w-1 h-1 rounded-full bg-slate-500"></div>
               </div>
             }
          </div>

          <!-- 2. STORAGE (Cydenti Core) -->
          <div class="flex flex-col items-center gap-4 flex-shrink-0">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Aggregation</div>
            
            <div class="w-24 h-32 relative">
              <div class="absolute inset-0 bg-white border-2 border-slate-200 rounded-2xl flex flex-col items-center justify-center shadow-lg z-20 overflow-hidden">
                 <div class="absolute top-0 w-full h-3 bg-slate-100 rounded-t-2xl border-b border-slate-200"></div>
                 <div class="flex flex-col items-center gap-1 z-10">
                   <!-- Branded Logo in the Center of Storage -->
                   <svg viewBox="0 0 100 100" fill="none" class="w-10 h-10">
                      <path d="M85 50 A 35 35 0 0 0 25 25" stroke="#1d4ed8" stroke-width="10" stroke-linecap="round" />
                      <path d="M25 25 A 35 35 0 0 0 25 75" stroke="#1d4ed8" stroke-width="10" stroke-linecap="round" stroke-opacity="0.8" />
                      <path d="M70 50 A 20 20 0 0 0 30 50" stroke="#14b8a6" stroke-width="10" stroke-linecap="round" />
                      <path d="M30 50 A 20 20 0 0 0 60 75" stroke="#14b8a6" stroke-width="10" stroke-linecap="round" />
                   </svg>
                   <span class="font-bold text-sm text-slate-700 font-sans mt-1">Core DB</span>
                 </div>
                 <div class="absolute bottom-2 w-3/4 h-1 bg-slate-200 rounded overflow-hidden">
                   <div class="h-full bg-cydenti-blue animate-pulse w-[85%]"></div>
                 </div>
              </div>
            </div>

            <!-- Log Console (Kept Dark for Contrast) -->
            <div class="w-40 h-20 bg-slate-900 border border-slate-800 rounded font-mono text-[8px] p-2 overflow-hidden text-green-400 shadow-inner">
               @for(log of logs(); track log) {
                 <div class="truncate opacity-80">> {{log}}</div>
               }
            </div>
          </div>

          <!-- Flow Line 2 -->
          <div class="flex-1 h-32 relative overflow-hidden mx-2">
            <svg class="absolute inset-0 w-full h-full pointer-events-none">
               @for (p of packets2; track p.id) {
                 <circle [attr.cx]="p.x + '%'" cy="50%" r="2.5" fill="#8b5cf6" opacity="0.8" />
              }
               <path d="M0,64 L1000,64" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" fill="none" />
            </svg>
          </div>

          <!-- 3. PROCESSING (Cydenti Correlation Engine) -->
          <div class="flex flex-col items-center gap-4 flex-shrink-0">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Cydenti<br>Correlation Engine</div>
            
            <div class="w-40 h-40 relative flex items-center justify-center">
               <div class="absolute inset-0 border-2 border-cydenti-blue/30 rounded-full animate-[spin_12s_linear_infinite]"></div>
               <div class="absolute inset-3 border border-cydenti-cyan/50 rounded-full border-dashed animate-[spin_6s_linear_infinite_reverse]"></div>
               
               <!-- Script Monitor (Kept Dark) -->
               <div class="w-28 h-28 bg-slate-900 rounded-xl border border-cydenti-blue shadow-lg z-10 relative overflow-hidden flex flex-col">
                 <div class="bg-slate-800 px-2 py-1 text-[7px] text-cydenti-cyan font-bold border-b border-slate-700 flex justify-between">
                    <span>LIVE_CORRELATION</span>
                    <span class="animate-pulse">●</span>
                 </div>
                 <div class="flex-1 p-1 font-mono text-[6px] text-green-400 leading-relaxed overflow-hidden flex flex-col-reverse">
                    @for(script of activeScripts(); track script) {
                       <div class="truncate opacity-90">> {{script}}</div>
                    }
                 </div>
               </div>
            </div>
          </div>

          <!-- Flow Line 3 -->
          <div class="flex-1 h-32 relative overflow-hidden mx-2">
            <svg class="absolute inset-0 w-full h-full pointer-events-none">
               @for (p of packets3; track p.id) {
                 <rect [attr.x]="p.x + '%'" y="60" width="5" height="5" fill="#f59e0b" opacity="0.8" rx="1" />
              }
               <path d="M0,64 L1000,64" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" fill="none" />
            </svg>
          </div>

          <!-- 4. OUTPUT (Graph Model) -->
          <div class="flex flex-col items-center gap-4 flex-shrink-0">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center leading-tight">
               Blast Radius Calculation /<br>Dependency Mapping
            </div>
            
            <div class="w-56 h-48 bg-white border border-slate-200 rounded-lg relative overflow-hidden shadow-lg">
               <svg class="w-full h-full p-2" viewBox="0 0 200 160">
                  <g class="animate-fade-in-1">
                     <line x1="40" y1="80" x2="80" y2="50" stroke="#cbd5e1" stroke-width="1" />
                     <line x1="40" y1="80" x2="80" y2="110" stroke="#cbd5e1" stroke-width="1" />
                     <circle cx="40" cy="80" r="8" fill="#06b6d4" stroke="#fff" stroke-width="1.5" />
                     <circle cx="80" cy="50" r="6" fill="#8b5cf6" />
                     <circle cx="80" cy="110" r="6" fill="#10b981" />
                  </g>
                  <g class="animate-fade-in-2">
                     <line x1="150" y1="60" x2="120" y2="90" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2 2" />
                     <circle cx="150" cy="60" r="8" fill="#f59e0b" stroke="#fff" stroke-width="1.5" />
                     <circle cx="120" cy="90" r="5" fill="#ef4444" />
                  </g>
                  <path d="M80,110 Q100,130 120,90" fill="none" stroke="#ef4444" stroke-width="1" stroke-dasharray="2 2" opacity="0">
                     <animate attributeName="opacity" values="0;0;1;1;0" dur="4s" repeatCount="indefinite" />
                  </path>
               </svg>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="mt-8 border-t border-slate-200 pt-4 flex justify-between text-xs text-slate-500 font-mono flex-shrink-0">
           <span>Pipeline: <span class="text-green-600 font-bold">ACTIVE</span></span>
           <span>Throughput: 12.4k events/sec</span>
           <span>Latency: 45ms</span>
        </div>
      </div>

      <!-- RIGHT COLUMN: Widgets Dashboard -->
      <div class="w-80 md:w-96 bg-white border-l border-slate-200 p-5 flex flex-col gap-5 z-20 shadow-xl overflow-y-auto">
        
        <!-- Header -->
        <div class="flex items-center gap-2 pb-2 border-b border-slate-200">
           <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           <h3 class="font-bold text-slate-700 tracking-wider text-sm">LIVE MONITORING</h3>
        </div>

        <!-- Widget 1: Ingestion Stats -->
        <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
           <h4 class="text-xs font-bold text-slate-500 uppercase mb-3">Ingestion Stats (5s Update)</h4>
           <div class="space-y-4">
             <div class="flex justify-between items-center">
               <span class="text-sm text-slate-500">Identities</span>
               <span class="text-lg font-mono font-bold text-slate-900">{{ statIdentities() | number }}</span>
             </div>
             <div class="flex justify-between items-center">
               <span class="text-sm text-slate-500">Active Apps</span>
               <div class="flex items-center gap-2">
                 <span class="text-xs text-green-600">▲</span>
                 <span class="text-lg font-mono font-bold text-slate-900">{{ statApps() }}</span>
               </div>
             </div>
             <div class="flex justify-between items-center">
               <span class="text-sm text-slate-500">Perm. Changes</span>
               <span class="text-lg font-mono font-bold text-cydenti-cyan">{{ statPermChanges() | number }}</span>
             </div>
           </div>
        </div>

        <!-- Widget 2: Security Landscape (ENHANCED) -->
        <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
           <h4 class="text-xs font-bold text-slate-500 uppercase w-full mb-3">Overall Risk Landscape</h4>
           
           <div class="flex items-center gap-4 mb-4">
              <!-- Conic Gradient Donut Chart -->
              <div class="relative w-24 h-24 flex-shrink-0">
                <div class="w-full h-full rounded-full" 
                     style="background: conic-gradient(#ef4444 0% 15%, #f97316 15% 40%, #eab308 40% 65%, #22c55e 65% 100%);">
                </div>
                <div class="absolute inset-3 bg-slate-50 rounded-full flex flex-col items-center justify-center">
                  <span class="text-[9px] text-slate-500">Secure</span>
                  <span class="text-lg font-bold text-green-600">35%</span>
                </div>
              </div>

              <!-- Breakdown List -->
              <div class="flex-1 space-y-2 text-[10px]">
                 <div class="flex justify-between items-center">
                   <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-red-500"></div> Critical</div>
                   <div class="font-mono text-slate-700">15% (158)</div>
                 </div>
                 <div class="flex justify-between items-center">
                   <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-orange-500"></div> High</div>
                   <div class="font-mono text-slate-700">25% (263)</div>
                 </div>
                 <div class="flex justify-between items-center">
                   <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-yellow-500"></div> Medium</div>
                   <div class="font-mono text-slate-700">25% (263)</div>
                 </div>
                 <div class="flex justify-between items-center">
                   <div class="flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-green-500"></div> Safe</div>
                   <div class="font-mono text-slate-700">35% (370)</div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Widget 3: Privileged Access (Hover for Breakdown) -->
        <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm group relative cursor-help">
           <!-- Normal View -->
           <div class="group-hover:opacity-10 transition-opacity duration-300">
             <h4 class="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-cydenti-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
               Admin Monitoring
             </h4>
             <div class="grid grid-cols-2 gap-4">
               <div>
                 <div class="text-[10px] text-slate-500">Total Admins</div>
                 <div class="text-xl font-bold text-slate-900">{{ statAdminsTotal() }}</div>
               </div>
               <div>
                 <div class="text-[10px] text-slate-500">At Risk</div>
                 <div class="text-xl font-bold text-red-500 animate-pulse">{{ statAdminsRisk() }}</div>
               </div>
             </div>
             <div class="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div class="h-full bg-red-500" [style.width.%]="(statAdminsRisk() / statAdminsTotal()) * 100"></div>
             </div>
           </div>

           <!-- Hover Overlay: Breakdown -->
           <div class="absolute inset-0 bg-white/95 rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center border border-slate-200 shadow-xl">
             <h5 class="text-cydenti-blue font-bold text-sm mb-2 text-center">Admin Platform Breakdown</h5>
             <div class="space-y-2 text-xs">
               <div class="flex justify-between"><span class="text-slate-500">Okta SuperAdmins</span> <span class="font-mono text-slate-900">4</span></div>
               <div class="flex justify-between"><span class="text-slate-500">AWS IAM FullAccess</span> <span class="font-mono text-slate-900">12</span></div>
               <div class="flex justify-between"><span class="text-slate-500">M365 Global Admin</span> <span class="font-mono text-slate-900">6</span></div>
               <div class="flex justify-between border-t border-slate-200 pt-1"><span class="text-red-500">Risky Permissions</span> <span class="font-mono text-red-500">{{ statAdminsRisk() }}</span></div>
             </div>
           </div>
        </div>

        <!-- Widget 4: NHI Monitor (Hover for Breakdown) -->
        <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm group relative cursor-help">
           <!-- Normal View -->
           <div class="group-hover:opacity-10 transition-opacity duration-300">
             <h4 class="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-cydenti-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
               Non-Human Identities
             </h4>
             <div class="grid grid-cols-2 gap-4">
               <div>
                 <div class="text-[10px] text-slate-500">Total NHI</div>
                 <div class="text-xl font-bold text-slate-900">{{ statNhiTotal() | number }}</div>
               </div>
               <div>
                 <div class="text-[10px] text-slate-500">At Risk</div>
                 <div class="text-xl font-bold text-orange-500">{{ statNhiRisk() }}</div>
               </div>
             </div>
             <div class="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div class="h-full bg-orange-500" [style.width.%]="(statNhiRisk() / statNhiTotal()) * 100"></div>
             </div>
           </div>

           <!-- Hover Overlay: Breakdown -->
           <div class="absolute inset-0 bg-white/95 rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center border border-slate-200 shadow-xl">
             <h5 class="text-cydenti-cyan font-bold text-sm mb-2 text-center">NHI Type Breakdown</h5>
             <div class="space-y-2 text-xs">
               <div class="flex justify-between"><span class="text-slate-500">Service Accounts</span> <span class="font-mono text-slate-900">850</span></div>
               <div class="flex justify-between"><span class="text-slate-500">API Keys</span> <span class="font-mono text-slate-900">420</span></div>
               <div class="flex justify-between"><span class="text-slate-500">OAuth Bots</span> <span class="font-mono text-slate-900">150</span></div>
               <div class="flex justify-between border-t border-slate-200 pt-1"><span class="text-orange-500">Over-Privileged</span> <span class="font-mono text-orange-500">{{ statNhiRisk() }}</span></div>
             </div>
           </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    @keyframes dash {
      to { stroke-dashoffset: -100; }
    }
    .animate-dash {
      stroke-dasharray: 5;
      animation: dash 2s linear infinite;
    }
    
    .animate-fade-in-1 { animation: fadeIn 4s infinite; }
    .animate-fade-in-2 { animation: fadeIn 4s infinite 2s; }
    
    @keyframes fadeIn {
      0%, 10% { opacity: 0; transform: scale(0.9); }
      20%, 80% { opacity: 1; transform: scale(1); }
      90%, 100% { opacity: 0; transform: scale(0.9); }
    }
  `]
})
export class DataPipelineComponent implements OnInit, OnDestroy {
  sources = [
    { name: 'Okta', initials: 'Ok', color: 'text-blue-500 bg-blue-100 border border-blue-200' },
    { name: 'Microsoft 365', initials: 'Ms', color: 'text-blue-600 bg-blue-50 border border-blue-200' },
    { name: 'Salesforce', initials: 'Sf', color: 'text-sky-500 bg-sky-100 border border-sky-200' },
    { name: 'Google', initials: 'Gg', color: 'text-red-500 bg-red-100 border border-red-200' },
    { name: 'ServiceNow', initials: 'Sn', color: 'text-green-600 bg-green-100 border border-green-200' },
  ];

  packets1: StreamPacket[] = [];
  packets2: any[] = [];
  packets3: any[] = [];
  
  logs = signal<string[]>([]);
  activeScripts = signal<string[]>([]);

  // --- STATS SIGNALS ---
  statIdentities = signal(12450);
  statApps = signal(42);
  statPermChanges = signal(856);
  
  statAdminsTotal = signal(48);
  statAdminsRisk = signal(5);
  
  statNhiTotal = signal(2150);
  statNhiRisk = signal(124);
  
  private intervalId: any;
  private logIntervalId: any;
  private scriptIntervalId: any;
  private statsIntervalId: any;

  ngOnInit() {
    this.startAnimation();
    this.startLogging();
    this.startScripts();
    this.startStatsUpdates();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    clearInterval(this.logIntervalId);
    clearInterval(this.scriptIntervalId);
    clearInterval(this.statsIntervalId);
  }

  startStatsUpdates() {
    this.statsIntervalId = setInterval(() => {
      // Increment Identities slightly
      this.statIdentities.update(v => v + Math.floor(Math.random() * 4));
      
      // Rarely increment apps
      if (Math.random() > 0.95) this.statApps.update(v => v + 1);

      // Fluctuate Perm Changes
      this.statPermChanges.update(v => v + Math.floor(Math.random() * 15) - 5);

      // Randomly change risk numbers
      if (Math.random() > 0.7) {
        this.statAdminsRisk.update(v => {
           const change = Math.random() > 0.5 ? 1 : -1;
           return Math.max(0, Math.min(this.statAdminsTotal(), v + change));
        });
      }
      if (Math.random() > 0.6) {
        this.statNhiRisk.update(v => {
           const change = Math.floor(Math.random() * 3) - 1;
           return Math.max(0, v + change);
        });
      }

    }, 5000); // 5 Seconds Interval
  }

  startAnimation() {
    // Labels for the stream
    const identityTypes = [
      { label: 'User: J.Dupont', type: 'user', color: 'border-cyan-200 text-cyan-800 bg-cyan-50' },
      { label: 'Bot: Backup-Svc', type: 'nhi', color: 'border-amber-200 text-amber-800 bg-amber-50' },
      { label: 'API Key: AWS-Prod', type: 'nhi', color: 'border-red-200 text-red-800 bg-red-50' },
      { label: 'App: Salesforce', type: 'app', color: 'border-blue-200 text-blue-800 bg-blue-50' },
      { label: 'User: M.Martin', type: 'user', color: 'border-cyan-200 text-cyan-800 bg-cyan-50' },
      { label: 'Svc: CI/CD Runner', type: 'nhi', color: 'border-amber-200 text-amber-800 bg-amber-50' },
    ];

    // UPDATED: Increased interval to 80ms to prevent browser resource exhaustion
    this.intervalId = setInterval(() => {
      // 1. Source -> DB (Visible Boxes)
      if (Math.random() > 0.94) {
        const template = identityTypes[Math.floor(Math.random() * identityTypes.length)];
        this.packets1.push({ 
          id: Math.random(), 
          x: -10, // Start slightly offscreen left
          label: template.label,
          type: template.type as any,
          color: template.color
        });
      }
      
      // Move packets1 - Adjusted speed for slower interval
      this.packets1.forEach(p => p.x += 1.6); 
      this.packets1 = this.packets1.filter(p => p.x < 110);

      // 2. DB -> ML
      if (Math.random() > 0.6) this.packets2.push({ id: Math.random(), x: 0 });
      this.packets2.forEach(p => p.x += 6.0);
      this.packets2 = this.packets2.filter(p => p.x < 100);

      // 3. ML -> Graph
      if (Math.random() > 0.7) this.packets3.push({ id: Math.random(), x: 0 });
      this.packets3.forEach(p => p.x += 6.0);
      this.packets3 = this.packets3.filter(p => p.x < 100);

    }, 80); // 80ms = ~12.5 FPS (Low resource usage)
  }

  startLogging() {
    const messages = [
      'Ingesting logs from Okta_Auth_Stream...',
      'Detected new NHI: CI/CD Bot-01',
      'Cydenti DB: Indexing identity relationships',
      'Correlation Engine: Mapping Role to Resource',
      'Risk Anomaly: High Blast Radius detected for User-99',
      'Graph Update: Linking Svc-Account to S3 Bucket',
      'Recalculating Permissions for Group: Admins',
      'ServiceNow: Ticket Created for shadow admin',
      'Salesforce: Permission Set expansion detected'
    ];

    this.logIntervalId = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      this.logs.update(current => [msg, ...current.slice(0, 4)]);
    }, 1200);
  }

  startScripts() {
    const scripts = [
      'graph.analyze(depth=4)',
      'risk.calc(factor=blast_radius)',
      'detect_shadow_admin()',
      'nhi.pattern_match()',
      'perm.verify_least_priv()',
      'alert.trigger(sev=HIGH)',
      'map.node(0x4A2F)',
      'aws.iam.scan()',
      'okta.group.sync()'
    ];
    this.scriptIntervalId = setInterval(() => {
      const s = scripts[Math.floor(Math.random() * scripts.length)];
      const id = Math.floor(Math.random() * 999);
      this.activeScripts.update(current => [`[${id}] ${s}`, ...current].slice(0, 7));
    }, 400);
  }
}