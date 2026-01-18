
import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface SecurityAlert {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string; // matches filter keys: credentials, oauth, nhi, overpriv, location, etc.
  asset: string;
  assetType: string;
  timestamp: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  assignee?: string;
  description: string;
  remediation?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-slate-50 overflow-y-auto font-sans relative">
      
      <!-- Top Bar & Navigation -->
      <div class="px-8 py-5 bg-white border-b border-slate-200 flex justify-between items-center flex-shrink-0 sticky top-0 z-40 shadow-sm">
         <div class="flex items-center gap-6">
            <div>
                <h1 class="text-2xl font-black text-slate-900 tracking-tight">Cydenti Risk Oversight</h1>
                <div class="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-2">
                   <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
                     <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span class="font-bold">System Operational</span>
                   </div>
                   <span class="mx-1 text-slate-300">|</span>
                   <span>Last updated: {{ timeString }}</span>
                </div>
            </div>

            <!-- Dashboard View Switcher -->
            <div class="flex bg-slate-100 p-1 rounded-lg border border-slate-200 ml-6">
               <button (click)="currentView.set('executive')"
                  class="px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2"
                  [class.bg-white]="currentView() === 'executive'"
                  [class.text-slate-900]="currentView() === 'executive'"
                  [class.shadow-sm]="currentView() === 'executive'"
                  [class.text-slate-500]="currentView() !== 'executive'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Executive
               </button>
               <button (click)="currentView.set('secops')"
                  class="px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2"
                  [class.bg-white]="currentView() === 'secops'"
                  [class.text-slate-900]="currentView() === 'secops'"
                  [class.shadow-sm]="currentView() === 'secops'"
                  [class.text-slate-500]="currentView() !== 'secops'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  SecOps
               </button>
            </div>
         </div>

         <!-- Scope Selector -->
         <div class="hidden lg:flex items-center gap-3 pl-6 border-l border-slate-200">
             <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Scope:</span>
             <select (change)="setPlatform($event)" class="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-cydenti-blue focus:border-cydenti-blue block p-2 font-medium shadow-sm cursor-pointer hover:border-cydenti-blue transition-colors">
               <option selected>All Platforms</option>
               <option>Microsoft 365</option>
               <option>Entra ID</option>
               <option>Salesforce</option>
               <option>AWS</option>
             </select>
         </div>
      </div>

      <div class="p-8 max-w-7xl mx-auto w-full">
         
         <!-- ============================================ -->
         <!-- VIEW 1: EXECUTIVE DASHBOARD                 -->
         <!-- ============================================ -->
         @if (currentView() === 'executive') {
           <div class="space-y-8 animate-fade-in">
             
             <!-- I. KEY METRICS ROW -->
             <section>
                <div class="flex items-center gap-2 mb-4">
                   <div class="h-px bg-slate-200 flex-1"></div>
                   <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">I. Key Risk Indicators</h2>
                   <div class="h-px bg-slate-200 flex-1"></div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   
                   <!-- METRIC 1: RISK SCORE -->
                   <div (click)="navigateToSecOps('all')" 
                        (mouseenter)="showDist($event, 'score')" (mouseleave)="hideDist()"
                        class="cursor-pointer bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-red-600 shadow-sm relative overflow-hidden group hover:shadow-md transition-all h-44 flex flex-col justify-between">
                      <!-- Watermark Icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" class="absolute -right-4 -bottom-4 w-32 h-32 text-slate-50 group-hover:text-slate-100 transition-colors pointer-events-none" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>

                      <div class="relative z-10 flex justify-between items-start">
                         <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wide">Risk Score</h3>
                         <span class="w-2 h-2 rounded-full bg-red-600"></span>
                      </div>
                      
                      <div class="relative z-10 mt-1 flex justify-between items-center pr-2">
                         <div class="flex items-baseline gap-1">
                            <span class="text-6xl font-black text-slate-900 group-hover:text-cydenti-blue transition-colors">{{ metrics().score }}</span>
                            <span class="text-xl font-bold text-slate-400">/100</span>
                         </div>

                         <!-- Risk Pie Chart -->
                         <div class="flex items-center gap-3">
                            <div class="relative w-14 h-14">
                               <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
                                  <!-- Background Circle -->
                                  <path class="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="4" />
                                  <!-- High (Orange) -->
                                  <path class="text-orange-500 transition-all duration-1000 ease-out" [attr.stroke-dasharray]="getSlice(metrics().riskBreakdown.high, getTotal(metrics().riskBreakdown))" stroke-dashoffset="0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="4" />
                                  <!-- Medium (Yellow) -->
                                  <path class="text-yellow-400 transition-all duration-1000 ease-out" [attr.stroke-dasharray]="getSlice(metrics().riskBreakdown.medium, getTotal(metrics().riskBreakdown))" [attr.stroke-dashoffset]="getOffset(metrics().riskBreakdown.high, getTotal(metrics().riskBreakdown))" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="4" />
                                  <!-- Low (Green) -->
                                  <path class="text-green-500 transition-all duration-1000 ease-out" [attr.stroke-dasharray]="getSlice(metrics().riskBreakdown.low, getTotal(metrics().riskBreakdown))" [attr.stroke-dashoffset]="getOffset(metrics().riskBreakdown.high + metrics().riskBreakdown.medium, getTotal(metrics().riskBreakdown))" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="4" />
                               </svg>
                            </div>
                            <div class="flex flex-col text-[9px] font-bold gap-0.5 min-w-[50px]">
                               <div class="flex items-center gap-1.5 text-orange-600"><span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span> {{ metrics().riskBreakdown?.high || 0 }} High</div>
                               <div class="flex items-center gap-1.5 text-yellow-600"><span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> {{ metrics().riskBreakdown?.medium || 0 }} Med</div>
                               <div class="flex items-center gap-1.5 text-green-600"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> {{ metrics().riskBreakdown?.low || 0 }} Low</div>
                            </div>
                         </div>
                      </div>

                      <div class="relative z-10 flex items-center gap-2 mt-auto">
                         <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                         <span class="text-xs font-bold text-red-600">{{ metrics().scoreDiff }} vs Last Month</span>
                      </div>
                   </div>

                   <!-- METRIC 2: CRITICAL EXPOSURE -->
                   <div (click)="navigateToSecOps('critical')" 
                        (mouseenter)="showDist($event, 'critical')" (mouseleave)="hideDist()"
                        class="cursor-pointer bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-red-600 shadow-sm relative overflow-hidden group hover:shadow-md transition-all h-44 flex flex-col justify-between">
                      <!-- Watermark Icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" class="absolute -right-4 -bottom-4 w-32 h-32 text-slate-50 group-hover:text-slate-100 transition-colors pointer-events-none" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>

                      <div class="relative z-10 flex justify-between items-start">
                         <div>
                            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wide">Critical Exposure</h3>
                            <div class="text-[10px] text-slate-400">Blast Radius</div>
                         </div>
                         <span class="w-2 h-2 rounded-full bg-red-600"></span>
                      </div>
                      
                      <div class="relative z-10 mt-2">
                         <span class="text-6xl font-black text-slate-900 group-hover:text-cydenti-blue transition-colors">{{ metrics().critical }}</span>
                      </div>

                      <div class="relative z-10 flex items-center gap-2 mt-auto">
                         <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                         <span class="text-xs font-bold text-red-600">{{ metrics().criticalDiff }} vs Last Month</span>
                      </div>
                   </div>

                   <!-- METRIC 3: ADMIN MFA GAP -->
                   <div (click)="navigateToSecOps('compliance')" 
                        (mouseenter)="showDist($event, 'mfa')" (mouseleave)="hideDist()"
                        class="cursor-pointer bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-cydenti-teal hover:shadow-md transition-all h-44 flex flex-col justify-between">
                      <!-- Watermark Icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" class="absolute -right-4 -bottom-4 w-32 h-32 text-slate-50 group-hover:text-slate-100 transition-colors pointer-events-none" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>

                      <div class="relative z-10 flex justify-between items-start">
                         <div>
                            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wide">Admin MFA Gap</h3>
                            <div class="text-[10px] text-slate-400">51% of 45 admins</div>
                         </div>
                         <span class="w-2 h-2 rounded-full bg-cydenti-teal"></span>
                      </div>
                      
                      <div class="relative z-10 mt-2">
                         <span class="text-6xl font-black text-slate-900 group-hover:text-cydenti-blue transition-colors">{{ metrics().adminMfaGap }}</span>
                      </div>

                      <div class="relative z-10 flex items-center gap-2 mt-auto">
                         <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                         <span class="text-xs font-bold text-emerald-600">{{ metrics().adminMfaGapDiff }} vs Last Month</span>
                      </div>
                   </div>

                   <!-- METRIC 4: OFFBOARDING RISK -->
                   <div (click)="navigateToSecOps('nhi')" 
                        (mouseenter)="showDist($event, 'offboarding')" (mouseleave)="hideDist()"
                        class="cursor-pointer bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-400 hover:shadow-md transition-all h-44 flex flex-col justify-between">
                      <!-- Watermark Icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" class="absolute -right-4 -bottom-4 w-32 h-32 text-slate-50 group-hover:text-slate-100 transition-colors pointer-events-none" fill="currentColor" viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>

                      <div class="relative z-10 flex justify-between items-start">
                         <div>
                            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wide">Offboarding Risk</h3>
                            <div class="text-[10px] text-slate-400">Active after termination</div>
                         </div>
                         <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                      </div>
                      
                      <div class="relative z-10 mt-2">
                         <span class="text-6xl font-black text-slate-900 group-hover:text-cydenti-blue transition-colors">{{ metrics().offboardingRisk }}</span>
                      </div>

                      <div class="relative z-10 flex items-center gap-2 mt-auto">
                         <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                         <span class="text-xs font-bold text-red-600">{{ metrics().offboardingRiskDiff }} vs Last Month</span>
                      </div>
                   </div>

                </div>
             </section>

             <!-- II. PRIVILEGED ACCESS BREAKDOWN -->
             <section class="animate-fade-in">
                <div class="flex items-center gap-2 mb-4">
                   <div class="h-px bg-slate-200 flex-1"></div>
                   <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">II. Privileged Access Breakdown</h2>
                   <div class="h-px bg-slate-200 flex-1"></div>
                </div>

                <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                   <!-- Decorative Background -->
                   <div class="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-slate-50 to-transparent pointer-events-none"></div>

                   <div class="flex flex-col md:flex-row gap-8 items-center relative z-10">
                      <!-- Left: Big Number Summary -->
                      <div class="w-full md:w-1/4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6"
                           (mouseenter)="showDist($event, 'admins')" (mouseleave)="hideDist()">
                         <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-cydenti-blue" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>
                            {{ metrics().adminStats.label }}
                         </div>
                         <div class="text-7xl font-black text-slate-900 tracking-tighter cursor-pointer hover:text-cydenti-blue transition-colors">{{ metrics().adminStats.total }}</div>
                         <div class="flex items-center gap-2 mt-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span class="text-xs font-bold text-slate-600">Active Monitoring</span>
                         </div>
                      </div>

                      <!-- Right: Horizontal Bar Chart -->
                      <div class="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
                         @for (item of metrics().adminStats.breakdown; track item.label) {
                            <div class="flex flex-col gap-1.5 group cursor-default">
                               <div class="flex justify-between text-xs font-bold">
                                  <span class="text-slate-600 group-hover:text-cydenti-blue transition-colors">{{ item.label }}</span>
                                  <span class="text-slate-900">{{ item.count }}</span>
                               </div>
                               <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div class="h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80"
                                       [class]="item.color"
                                       [style.width.%]="(item.count / item.max) * 100"></div>
                               </div>
                            </div>
                         }
                      </div>
                   </div>
                </div>
             </section>

             <!-- III. THREAT & LOCATION INTELLIGENCE -->
             <section>
                <div class="flex items-center gap-2 mb-4">
                   <div class="h-px bg-slate-200 flex-1"></div>
                   <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">III. Threat & Location Intelligence</h2>
                   <div class="h-px bg-slate-200 flex-1"></div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   
                   <!-- MAP -->
                   <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-0 overflow-hidden flex flex-col relative h-[450px]">
                      <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                         <h3 class="font-bold text-slate-800">Login Location</h3>
                         <button (click)="navigateToSecOps('location')" class="text-xs text-cydenti-blue font-bold hover:underline flex items-center gap-1">
                            Investigate Anomalies 
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                         </button>
                      </div>
                      
                      <!-- Map SVG -->
                      <div class="flex-1 bg-slate-50 relative overflow-hidden group">
                         <svg viewBox="0 0 800 400" class="w-full h-full object-cover">
                            <rect width="800" height="400" fill="#f8fafc" />
                            <g fill="#e2e8f0" stroke="white" stroke-width="2">
                                <path d="M120,60 C200,40 280,80 260,150 C250,200 280,250 260,320 C240,380 180,380 160,320 C140,260 100,200 80,120 C70,80 90,70 120,60 Z" />
                                <path d="M380,80 C400,40 650,40 700,80 C750,120 780,200 750,250 C720,300 650,350 550,350 C450,350 400,300 380,250 C360,200 350,120 380,80 Z" />
                                <path d="M680,300 C720,290 750,310 740,340 C730,360 690,360 670,330 Z" />
                            </g>
                            <!-- Interactive Markers -->
                            <!-- New York (Safe) -->
                             <g transform="translate(220, 140)" class="cursor-pointer hover:scale-110 transition-transform">
                                <circle r="6" fill="#14b8a6" />
                            </g>
                            <!-- San Fran (Safe) -->
                            <g transform="translate(140, 130)" class="cursor-pointer hover:scale-110 transition-transform">
                                <circle r="6" fill="#14b8a6" />
                            </g>
                            <!-- North Korea (Critical) -->
                            <g transform="translate(620, 140)" class="cursor-pointer hover:scale-125 transition-transform" (click)="navigateToSecOps('location')">
                                <circle r="15" fill="#fee2e2" opacity="0.6" class="animate-pulse" />
                                <circle r="6" fill="#ef4444" stroke="white" stroke-width="2" />
                            </g>
                            <!-- Russia (High) -->
                             <g transform="translate(480, 80)" class="cursor-pointer hover:scale-125 transition-transform" (click)="navigateToSecOps('location')">
                                <circle r="6" fill="#f97316" stroke="white" stroke-width="2" />
                            </g>
                         </svg>
                      </div>
                   </div>

                   <!-- THREAT INTEL -->
                   <div class="flex flex-col gap-6">
                      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-[280px] flex flex-col">
                         <div class="flex justify-between items-center mb-6">
                            <h3 class="font-black text-slate-800 uppercase tracking-tight text-sm">THREAT INTEL</h3>
                            <span class="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-100 flex items-center gap-1.5 shadow-sm">
                               <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                               {{ metrics().critical + 26 }} Alerts
                            </span>
                         </div>
                         
                         <div class="grid grid-cols-2 gap-3 flex-1">
                            <div (click)="navigateToSecOps('credentials')" class="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-red-200 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between">
                               <div class="flex justify-between items-start">
                                  <span class="text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors">3</span>
                                  <span class="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase border border-red-200">Crit</span>
                               </div>
                               <div class="text-[10px] font-bold text-slate-500 leading-tight">Exposed Credentials</div>
                            </div>

                            <div (click)="navigateToSecOps('oauth')" class="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between">
                               <div class="flex justify-between items-start">
                                  <span class="text-2xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">12</span>
                                  <span class="text-[9px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded uppercase border border-orange-200">High</span>
                               </div>
                               <div class="text-[10px] font-bold text-slate-500 leading-tight">Risky OAuth Apps</div>
                            </div>

                            <div (click)="navigateToSecOps('location')" class="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-amber-200 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between">
                               <div class="flex justify-between items-start">
                                  <span class="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">9</span>
                                  <span class="text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded uppercase border border-amber-200">Med</span>
                               </div>
                               <div class="text-[10px] font-bold text-slate-500 leading-tight">Anonymized Logins</div>
                            </div>

                            <div (click)="navigateToSecOps('location')" class="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-green-200 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between">
                               <div class="flex justify-between items-start">
                                  <span class="text-2xl font-black text-slate-900 group-hover:text-green-600 transition-colors">5</span>
                                  <span class="text-[9px] font-bold bg-green-100 text-green-600 px-1.5 py-0.5 rounded uppercase border border-green-200">Low</span>
                               </div>
                               <div class="text-[10px] font-bold text-slate-500 leading-tight">New Locations</div>
                            </div>
                         </div>
                      </div>

                      <div class="grid grid-cols-2 gap-4 flex-1 h-[146px]">
                         <div (click)="navigateToSecOps('overpriv')" class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between group hover:border-cydenti-blue hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                            <div class="flex justify-between items-start z-10">
                               <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wide leading-tight group-hover:text-cydenti-blue">Overpriv<br>Users</h4>
                               <span class="text-[10px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">{{ metrics().overPrivUsersDiff }}</span>
                            </div>
                            <div class="flex items-end justify-between mt-2 z-10">
                                <span class="text-3xl font-black text-slate-900">{{ metrics().overPrivUsers }}</span>
                            </div>
                         </div>

                         <div (click)="navigateToSecOps('nhi')" class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between group hover:border-cydenti-blue hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                            <div class="flex justify-between items-start z-10">
                               <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wide leading-tight group-hover:text-cydenti-blue">Overpriv<br>NHI</h4>
                               <span class="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{{ metrics().overPrivNhiDiff }}</span>
                            </div>
                            <div class="flex items-end justify-between mt-2 z-10">
                                <span class="text-3xl font-black text-slate-900">{{ metrics().overPrivNhi }}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </section>
             
             <!-- IV. RISK TREND & DRIVERS -->
             <section class="animate-fade-in">
               <div class="flex items-center gap-2 mb-4">
                 <div class="h-px bg-slate-200 flex-1"></div>
                 <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">IV. Risk Trend Analysis</h2>
                 <div class="h-px bg-slate-200 flex-1"></div>
               </div>
               
               <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                 <!-- Chart Header -->
                 <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h3 class="font-bold text-slate-800">Historical Risk Score</h3>
                      <p class="text-xs text-slate-400">6-Month Trend based on aggregated risk factors.</p>
                    </div>
                    <div class="flex items-center gap-2">
                       <span class="flex items-center gap-1 text-xs font-bold text-slate-500">
                         <span class="w-2 h-2 rounded-full bg-cydenti-blue"></span> Score
                       </span>
                    </div>
                 </div>
                 
                 <!-- Chart Area -->
                 <div class="h-64 w-full bg-slate-50 relative p-4 group">
                    <!-- Grid Lines -->
                    <div class="absolute inset-4 flex flex-col justify-between pointer-events-none">
                       <div class="w-full h-px bg-slate-200 border-t border-dashed border-slate-300"></div>
                       <div class="w-full h-px bg-slate-200 border-t border-dashed border-slate-300"></div>
                       <div class="w-full h-px bg-slate-200 border-t border-dashed border-slate-300"></div>
                       <div class="w-full h-px bg-slate-200 border-t border-dashed border-slate-300"></div>
                       <div class="w-full h-px bg-slate-200 border-t border-slate-300"></div>
                    </div>
                    
                    <!-- Y Axis Labels -->
                    <div class="absolute left-0 top-4 bottom-4 w-8 flex flex-col justify-between text-[9px] text-slate-400 text-right pr-1">
                       <span>100</span>
                       <span>75</span>
                       <span>50</span>
                       <span>25</span>
                       <span>0</span>
                    </div>

                    <!-- SVG Chart -->
                    <svg class="absolute inset-0 w-full h-full p-4 pl-8" preserveAspectRatio="none" viewBox="0 0 100 100">
                       <!-- Area -->
                       <path d="M0,100 L0,35 L20,32 L40,28 L60,30 L80,25 L100,28 L100,100 Z" fill="url(#gradient)" opacity="0.2" />
                       <!-- Line -->
                       <path d="M0,35 L20,32 L40,28 L60,30 L80,25 L100,28" fill="none" stroke="#1d4ed8" stroke-width="2" vector-effect="non-scaling-stroke" />
                       <!-- Points -->
                       <circle cx="0" cy="35" r="3" fill="#1d4ed8" stroke="white" stroke-width="1" />
                       <circle cx="20" cy="32" r="3" fill="#1d4ed8" stroke="white" stroke-width="1" />
                       <circle cx="40" cy="28" r="3" fill="#1d4ed8" stroke="white" stroke-width="1" />
                       <circle cx="60" cy="30" r="3" fill="#1d4ed8" stroke="white" stroke-width="1" />
                       <circle cx="80" cy="25" r="3" fill="#1d4ed8" stroke="white" stroke-width="1" />
                       <circle cx="100" cy="28" r="3" fill="#1d4ed8" stroke="white" stroke-width="1" />
                       
                       <defs>
                         <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                           <stop offset="0%" stop-color="#1d4ed8" />
                           <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
                         </linearGradient>
                       </defs>
                    </svg>
                    
                    <!-- X Axis Labels (Simple absolute positioning) -->
                    <div class="absolute left-8 right-4 bottom-0 flex justify-between text-[9px] text-slate-400 font-bold uppercase translate-y-full pt-1">
                       <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    </div>
                 </div>
                 
                 <!-- Driver Buttons -->
                 <div class="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-200 bg-white">
                     <button (click)="navigateToSecOps('overpriv')" class="p-4 hover:bg-slate-50 hover:text-cydenti-blue transition-colors text-xs font-bold text-slate-600 flex flex-col items-center gap-2 group">
                        <span class="w-8 h-1 bg-slate-300 rounded-full group-hover:bg-cydenti-blue transition-colors"></span>
                        Review Human Privilege Risk
                     </button>
                     <button (click)="navigateToSecOps('nhi')" class="p-4 hover:bg-slate-50 hover:text-cydenti-blue transition-colors text-xs font-bold text-slate-600 flex flex-col items-center gap-2 group">
                        <span class="w-8 h-1 bg-slate-300 rounded-full group-hover:bg-cydenti-blue transition-colors"></span>
                        Review NHI Privilege Risk
                     </button>
                     <button (click)="navigateToSecOps('all')" class="p-4 hover:bg-slate-50 hover:text-cydenti-blue transition-colors text-xs font-bold text-slate-600 flex flex-col items-center gap-2 group">
                        <span class="w-8 h-1 bg-slate-300 rounded-full group-hover:bg-cydenti-blue transition-colors"></span>
                        Review Threat Landscape
                     </button>
                 </div>
               </div>
             </section>

           </div>
         }

         <!-- ============================================ -->
         <!-- VIEW 2: SECOPS DASHBOARD                    -->
         <!-- ============================================ -->
         @if (currentView() === 'secops') {
            <div class="space-y-6 animate-fade-in">
               
               <!-- KPIs (Smaller versions of Executive Widgets) -->
               <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <!-- RISK SCORE (All) -->
                  <div (click)="activeCategoryFilter.set('all')"
                       class="cursor-pointer bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden"
                       [class.border-slate-200]="activeCategoryFilter() !== 'all'"
                       [class.ring-2]="activeCategoryFilter() === 'all'"
                       [class.ring-cydenti-blue]="activeCategoryFilter() === 'all'"
                       [class.border-transparent]="activeCategoryFilter() === 'all'">
                     <div class="flex justify-between items-start">
                         <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Risk Score</h3>
                         <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                     </div>
                     <div class="flex items-baseline gap-1 mt-1">
                         <span class="text-3xl font-black text-slate-900">{{ metrics().score }}</span>
                         <span class="text-xs font-bold text-slate-400">/100</span>
                     </div>
                     <div class="flex items-center gap-1 mt-2">
                         <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                         <span class="text-[10px] font-bold text-red-600">{{ metrics().scoreDiff }} vs Last Month</span>
                     </div>
                  </div>

                  <!-- CRITICAL EXPOSURE (Critical) -->
                  <div (click)="activeCategoryFilter.set('critical')"
                       class="cursor-pointer bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden"
                       [class.border-slate-200]="activeCategoryFilter() !== 'critical'"
                       [class.ring-2]="activeCategoryFilter() === 'critical'"
                       [class.ring-red-500]="activeCategoryFilter() === 'critical'"
                       [class.border-transparent]="activeCategoryFilter() === 'critical'">
                     <div class="flex justify-between items-start">
                         <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Critical Exposure</h3>
                         <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                     </div>
                     <div class="flex items-baseline gap-1 mt-1">
                         <span class="text-3xl font-black text-slate-900">{{ metrics().critical }}</span>
                     </div>
                     <div class="flex items-center gap-1 mt-2">
                         <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                         <span class="text-[10px] font-bold text-red-600">{{ metrics().criticalDiff }} vs Last Month</span>
                     </div>
                  </div>

                  <!-- ADMIN MFA GAP (Compliance) -->
                  <div (click)="activeCategoryFilter.set('compliance')"
                       class="cursor-pointer bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden"
                       [class.border-slate-200]="activeCategoryFilter() !== 'compliance'"
                       [class.ring-2]="activeCategoryFilter() === 'compliance'"
                       [class.ring-emerald-500]="activeCategoryFilter() === 'compliance'"
                       [class.border-transparent]="activeCategoryFilter() === 'compliance'">
                     <div class="flex justify-between items-start">
                         <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Admin MFA Gap</h3>
                         <span class="w-1.5 h-1.5 rounded-full bg-cydenti-teal"></span>
                     </div>
                     <div class="flex items-baseline gap-1 mt-1">
                         <span class="text-3xl font-black text-slate-900">{{ metrics().adminMfaGap }}</span>
                     </div>
                     <div class="flex items-center gap-1 mt-2">
                         <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                         <span class="text-[10px] font-bold text-emerald-600">{{ metrics().adminMfaGapDiff }} vs Last Month</span>
                     </div>
                  </div>

                  <!-- OFFBOARDING RISK (NHI) -->
                  <div (click)="activeCategoryFilter.set('nhi')"
                       class="cursor-pointer bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden"
                       [class.border-slate-200]="activeCategoryFilter() !== 'nhi'"
                       [class.ring-2]="activeCategoryFilter() === 'nhi'"
                       [class.ring-amber-500]="activeCategoryFilter() === 'nhi'"
                       [class.border-transparent]="activeCategoryFilter() === 'nhi'">
                     <div class="flex justify-between items-start">
                         <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Offboarding Risk</h3>
                         <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                     </div>
                     <div class="flex items-baseline gap-1 mt-1">
                         <span class="text-3xl font-black text-slate-900">{{ metrics().offboardingRisk }}</span>
                     </div>
                     <div class="flex items-center gap-1 mt-2">
                         <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                         <span class="text-[10px] font-bold text-red-600">{{ metrics().offboardingRiskDiff }} vs Last Month</span>
                     </div>
                  </div>
               </div>

               <!-- Filters Toolbar -->
               <div class="flex flex-wrap gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                  <span class="text-xs font-bold text-slate-400 uppercase px-2">Filter:</span>
                  @for (cat of ['all', 'critical', 'credentials', 'nhi', 'compliance', 'oauth', 'overpriv', 'location']; track cat) {
                    <button (click)="activeCategoryFilter.set(cat)"
                       class="px-3 py-1.5 rounded text-xs font-bold capitalize transition-colors"
                       [class.bg-cydenti-blue]="activeCategoryFilter() === cat"
                       [class.text-white]="activeCategoryFilter() === cat"
                       [class.bg-slate-100]="activeCategoryFilter() !== cat"
                       [class.text-slate-600]="activeCategoryFilter() !== cat"
                       [class.hover:bg-slate-200]="activeCategoryFilter() !== cat">
                       {{ cat === 'nhi' ? 'NHI' : cat }}
                    </button>
                  }
                  <div class="flex-1"></div>
                  <div class="relative">
                     <input type="text" placeholder="Search alerts..." 
                        [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)"
                        class="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-cydenti-blue w-48">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
               </div>

               <!-- Alerts Table -->
               <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                  <table class="w-full text-left text-sm">
                     <thead class="bg-slate-50 border-b border-slate-200">
                        <tr>
                           <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Severity</th>
                           <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Alert Name</th>
                           <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Entity / Asset</th>
                           <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Category</th>
                           <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Time</th>
                           <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                        </tr>
                     </thead>
                     <tbody class="divide-y divide-slate-100">
                        @for (alert of filteredAlerts(); track alert.id) {
                           <tr class="hover:bg-slate-50 cursor-pointer transition-colors group" (click)="openAlert(alert)">
                              <td class="px-6 py-4">
                                 <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
                                    [class.bg-red-50]="alert.severity === 'Critical'"
                                    [class.text-red-700]="alert.severity === 'Critical'"
                                    [class.border-red-100]="alert.severity === 'Critical'"
                                    [class.bg-orange-50]="alert.severity === 'High'"
                                    [class.text-orange-700]="alert.severity === 'High'"
                                    [class.border-orange-100]="alert.severity === 'High'"
                                    [class.bg-yellow-50]="alert.severity === 'Medium'"
                                    [class.text-yellow-700]="alert.severity === 'Medium'"
                                    [class.border-yellow-100]="alert.severity === 'Medium'"
                                    [class.bg-green-50]="alert.severity === 'Low'"
                                    [class.text-green-700]="alert.severity === 'Low'"
                                    [class.border-green-100]="alert.severity === 'Low'">
                                    <span class="w-1.5 h-1.5 rounded-full" 
                                       [class.bg-red-600]="alert.severity === 'Critical'"
                                       [class.bg-orange-600]="alert.severity === 'High'"
                                       [class.bg-yellow-600]="alert.severity === 'Medium'"
                                       [class.bg-green-600]="alert.severity === 'Low'"></span>
                                    {{ alert.severity }}
                                 </span>
                              </td>
                              <td class="px-6 py-4 font-bold text-slate-800 group-hover:text-cydenti-blue">
                                 <div>{{ alert.title }}</div>
                                 <div class="text-[10px] font-mono text-slate-400 font-normal">{{ alert.id }}</div>
                              </td>
                              <td class="px-6 py-4">
                                 <div class="text-slate-900 font-medium">{{ alert.asset }}</div>
                                 <div class="text-xs text-slate-400">{{ alert.assetType }}</div>
                              </td>
                              <td class="px-6 py-4">
                                 <span class="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{{ alert.category }}</span>
                              </td>
                              <td class="px-6 py-4 text-slate-500 text-xs">{{ alert.timestamp }}</td>
                              <td class="px-6 py-4">
                                 <span class="text-xs font-bold"
                                    [class.text-slate-400]="alert.status === 'Resolved'"
                                    [class.text-blue-600]="alert.status === 'In Progress'"
                                    [class.text-red-600]="alert.status === 'Open'">
                                    {{ alert.status }}
                                 </span>
                                 @if (alert.assignee) {
                                    <div class="text-[10px] text-slate-400 mt-1">→ {{ alert.assignee }}</div>
                                 }
                              </td>
                           </tr>
                        }
                     </tbody>
                  </table>
                  @if (filteredAlerts().length === 0) {
                     <div class="p-12 text-center text-slate-400 flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        No alerts found for this filter.
                     </div>
                  }
               </div>

            </div>
         }

         <!-- Alert Detail Side Panel (Replaces Modal) -->
         @if (selectedAlert()) {
            <div class="fixed inset-0 z-50 flex justify-end z-[100]">
               <!-- Backdrop -->
               <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" (click)="closeAlert()"></div>
               
               <!-- Side Panel -->
               <div class="relative w-full max-w-3xl bg-slate-50 h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden" (click)="$event.stopPropagation()">
                  
                  <!-- Top Bar: Title & Close -->
                  <div class="px-8 py-6 bg-white flex justify-between items-start">
                      <h2 class="text-2xl font-bold text-slate-900 leading-snug pr-8">{{ selectedAlert()!.title }}</h2>
                      <button (click)="closeAlert()" class="text-slate-400 hover:text-slate-600 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>

                  <!-- Actions Bar -->
                  <div class="px-8 pb-4 bg-white flex justify-between items-center border-b border-slate-100">
                      <!-- Status Dropdown (Mock) -->
                      <button class="flex items-center gap-2 px-3 py-1.5 rounded border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                          <span class="w-2 h-2 rounded-full"
                              [class.bg-red-500]="selectedAlert()!.status === 'Open'"
                              [class.bg-blue-500]="selectedAlert()!.status === 'In Progress'"
                              [class.bg-green-500]="selectedAlert()!.status === 'Resolved'"></span>
                          {{ selectedAlert()!.status }}
                          <svg class="w-3 h-3 text-slate-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                      </button>

                      <button class="px-4 py-2 bg-cydenti-blue hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                         Take Action
                      </button>
                  </div>

                  <!-- Tabs -->
                  <div class="px-8 border-b border-slate-200 bg-white flex items-center gap-8 text-sm font-medium text-slate-500">
                     <button class="py-3 border-b-2 border-cydenti-blue text-cydenti-blue">Overview</button>
                     <button class="py-3 border-b-2 border-transparent hover:text-slate-700 transition-colors">Attack Path</button>
                     <button class="py-3 border-b-2 border-transparent hover:text-slate-700 transition-colors">Comments</button>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 overflow-y-auto p-8 space-y-4">
                     
                     <!-- Description Card -->
                     <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group">
                        <div class="text-sm font-bold text-slate-700 mb-2">Description</div>
                        <p class="text-sm text-slate-600 leading-relaxed">{{ selectedAlert()!.description }}</p>
                        <svg class="w-4 h-4 text-slate-300 absolute top-5 right-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>

                     <!-- Impact Card -->
                     <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                        <div class="text-sm font-bold text-slate-700 mb-2">Impact</div>
                        <p class="text-sm text-slate-600 leading-relaxed">
                           Potential risk of unauthorized access attempts or reconnaissance of externally shared files.
                        </p>
                        <svg class="w-4 h-4 text-slate-300 absolute top-5 right-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>

                     <!-- Remediation Card -->
                     <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                        <div class="text-sm font-bold text-slate-700 mb-2">Remediation</div>
                        <p class="text-sm text-slate-600 leading-relaxed">{{ selectedAlert()!.remediation || 'Review the files and users involved. Adjust sharing permissions if necessary.' }}</p>
                        <svg class="w-4 h-4 text-slate-300 absolute top-5 right-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>

                     <!-- Observables -->
                     <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative min-h-[100px]">
                        <div class="text-sm font-bold text-slate-700 mb-3">Observables</div>
                        
                        <div class="space-y-3">
                           <div>
                              <div class="text-xs text-slate-500 font-bold mb-1.5">Identity</div>
                              <span class="inline-flex px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-mono font-bold rounded border border-purple-100">
                                 {{ '{' }}{{ '{' }} {{ selectedAlert()!.assignee || 'user_name' }} {{ '}' }}{{ '}' }}
                              </span>
                           </div>
                        </div>
                        <svg class="w-4 h-4 text-slate-300 absolute top-5 right-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        
                         <button class="absolute bottom-4 right-4 p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-500 transition-colors">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 18L22 12L16 6" /><path d="M8 6L2 12L8 18" /></svg>
                         </button>
                     </div>

                     <!-- Bottom Grid -->
                     <div class="grid grid-cols-3 gap-4">
                        <!-- Tactics -->
                        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                           <div class="text-slate-500 text-xs mb-2">Tactics</div>
                           <span class="inline-flex items-center px-2.5 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-[10px] font-bold">
                              Reconnaissance
                           </span>
                           <svg class="w-3 h-3 text-slate-300 absolute top-4 right-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        
                         <!-- Techniques -->
                        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                           <div class="text-slate-500 text-xs mb-2">Techniques</div>
                           <span class="inline-flex items-center px-2.5 py-1 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 text-[10px] font-bold">
                              T1592 (Gather Victim Identity...)
                           </span>
                           <svg class="w-3 h-3 text-slate-300 absolute top-4 right-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>

                         <!-- Compliance -->
                        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                           <div class="text-slate-500 text-xs mb-2">Compliance</div>
                           <div class="w-6 h-6 rounded-full border-2 border-emerald-400 bg-emerald-50"></div>
                           <svg class="w-3 h-3 text-slate-300 absolute top-4 right-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                     </div>

                  </div>

               </div>
            </div>
         }

      </div>

      <!-- DISTRIBUTION TOOLTIP -->
      @if (distTooltip() && distTooltipPos()) {
         <div class="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 w-64 animate-fade-in pointer-events-none"
              [style.left.px]="distTooltipPos()?.x"
              [style.top.px]="distTooltipPos()?.y">
            
            <div class="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
               {{ distTooltip()!.title }}
            </div>
            
            <div class="space-y-2.5">
               @for (item of distTooltip()!.items; track item.label) {
                  <div class="flex items-center justify-between text-xs">
                     <div class="flex items-center gap-2.5">
                        <!-- Dynamic Icon -->
                        <div class="w-5 h-5 rounded flex items-center justify-center bg-slate-50" [innerHTML]="sanitizer.bypassSecurityTrustHtml(getIcon(item.icon))"></div>
                        <span class="text-slate-600 font-medium">{{ item.label }}</span>
                     </div>
                     <span class="font-mono font-bold text-slate-900">{{ item.value }}</span>
                  </div>
               }
            </div>
         </div>
      }

    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideInRight {
       from { transform: translateX(100%); }
       to { transform: translateX(0); }
    }
  `]
})
export class DashboardComponent {
  dataService = inject(DataService);
  sanitizer = inject(DomSanitizer);
  
  // View State
  currentView = signal<'executive' | 'secops'>('executive');
  activeCategoryFilter = signal<string>('all');
  searchQuery = signal<string>('');
  selectedAlert = signal<SecurityAlert | null>(null);

  // Tooltip State
  distTooltip = signal<{ title: string, items: {label: string, value: string | number, icon: string}[] } | null>(null);
  distTooltipPos = signal<{x: number, y: number} | null>(null);

  // Shared Data State
  currentPlatform = signal<string>('All Platforms');
  timeString = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) + ' CET';

  // --- REALISTIC MOCK DATA (Connecting High Level to Low Level) ---
  alerts = signal<SecurityAlert[]>([
    { id: 'ALT-1024', title: 'Hardcoded AWS Secret in Public Repo', severity: 'Critical', category: 'credentials', asset: 'frontend-service-repo', assetType: 'GitHub Repository', timestamp: '10 mins ago', status: 'Open', description: 'Scanner detected a valid AWS Access Key ID and Secret in file src/config.js. Committed by user j.doe.', remediation: 'Revoke key immediately in AWS IAM. Rotate credentials. Trigger secret scanning on all repos.' },
    { id: 'ALT-1025', title: 'Leaked API Key on Pastebin', severity: 'Critical', category: 'credentials', asset: 'Stripe Live Key', assetType: 'API Token', timestamp: '45 mins ago', status: 'Open', description: 'Threat Intel detected an active Stripe production key matching your prefix on a public paste site.', remediation: 'Rotate Stripe Key. Audit logs for unauthorized transactions in the last 4 hours.' },
    { id: 'ALT-1026', title: 'Admin Password Spray Detected', severity: 'Critical', category: 'credentials', asset: 'Okta SuperAdmin Group', assetType: 'Identity Group', timestamp: '1 hour ago', status: 'In Progress', assignee: 'SOC Team A', description: 'Multiple failed login attempts from varied IPs against admin accounts.', remediation: 'Enforce MFA for all admins. Block source IPs. Reset passwords for targeted accounts.' },
    { id: 'ALT-2001', title: 'New High-Privilege OAuth Grant', severity: 'High', category: 'oauth', asset: 'Unknown Vendor App', assetType: 'OAuth App', timestamp: '2 hours ago', status: 'Open', description: 'User granted "Mail.ReadWrite" and "User.Read.All" to an unverified application.', remediation: 'Revoke app permissions. Investigate user activity post-grant.' },
    { id: 'ALT-2002', title: 'OAuth Token Replay', severity: 'High', category: 'oauth', asset: 'Salesforce Connect', assetType: 'Service Principal', timestamp: '3 hours ago', status: 'Resolved', assignee: 'Auto-Remediation', description: 'Token replay attack signature detected and blocked.', remediation: 'No action required. Blocked by firewall.' },
    { id: 'ALT-2045', title: 'Unused OAuth App with Admin Scope', severity: 'Medium', category: 'oauth', asset: 'Legacy Reporting Tool', assetType: 'OAuth App', timestamp: '1 day ago', status: 'Open', description: 'App has not been used in 90 days but retains Global Admin consent.', remediation: 'Remove unused app registration.' },
    { id: 'ALT-3001', title: 'Service Account Interactive Login', severity: 'High', category: 'nhi', asset: 'svc-backup-prod', assetType: 'Service Account', timestamp: '30 mins ago', status: 'Open', description: 'Non-human identity performed an interactive login, which is anomalous behavior.', remediation: 'Disable interactive login for this service account. Check logs for command execution.' },
    { id: 'ALT-3002', title: 'Over-Privileged NHI Role', severity: 'Medium', category: 'overpriv', asset: 'ci-cd-runner', assetType: 'Workload Identity', timestamp: '4 hours ago', status: 'Open', description: 'Identity has "Owner" permissions on subscription but uses only "Reader" on 2 resources.', remediation: 'Right-size permissions to "Reader" role.' },
    { id: 'ALT-3005', title: 'User with Excessive Permissions', severity: 'Medium', category: 'overpriv', asset: 'Sarah Connor', assetType: 'User', timestamp: '2 days ago', status: 'Open', description: 'User is assigned 15 roles, 12 of which are unused in the last 60 days.', remediation: 'Initiate access review campaign for this user.' },
    { id: 'ALT-3006', title: 'Shadow Admin Created', severity: 'High', category: 'overpriv', asset: 'DevOps-Lead', assetType: 'User', timestamp: '5 hours ago', status: 'Open', description: 'User added to a custom role that effectively grants Global Admin rights via password reset capabilities.', remediation: 'Remove user from role. Modify custom role permissions.' },
    { id: 'ALT-4001', title: 'Impossible Travel: NY to Tokyo', severity: 'Medium', category: 'location', asset: 'd.jackson@corp.com', assetType: 'User', timestamp: '15 mins ago', status: 'Open', description: 'Login from Tokyo 10 minutes after login from New York.', remediation: 'Reset user session. Require MFA challenge.' },
    { id: 'ALT-4002', title: 'Login from Sanctioned Region', severity: 'Critical', category: 'location', asset: 'Guest User', assetType: 'External User', timestamp: '5 hours ago', status: 'Open', description: 'Access attempt blocked from North Korea IP block.', remediation: 'Disable guest account. Investigate referral source.' },
    { id: 'ALT-4003', title: 'Anonymized Login (Tor)', severity: 'High', category: 'location', asset: 'finance-admin', assetType: 'User', timestamp: '1 day ago', status: 'In Progress', assignee: 'SOC Analyst', description: 'Traffic originating from known Tor exit node.', remediation: 'Block Tor exit nodes at firewall level.' },
    { id: 'ALT-5001', title: 'MFA Disabled for Admin', severity: 'High', category: 'compliance', asset: 'Admin-Emergency', assetType: 'User', timestamp: 'Yesterday', status: 'Open', description: 'Break-glass account has MFA disabled against policy.', remediation: 'Enable MFA or document exception.' },
    { id: 'ALT-5002', title: 'Public S3 Bucket Detected', severity: 'Critical', category: 'configuration', asset: 'customer-logs-backup', assetType: 'S3 Bucket', timestamp: '2 days ago', status: 'Resolved', assignee: 'Cloud Eng', description: 'Bucket policy allows public read access.', remediation: 'Applied "Block Public Access" policy.' }
  ]);

  // Metrics Data (Reflecting the alerts above)
  platformStats: Record<string, any> = {
    'All Platforms': {
      score: 72, scoreDiff: '+4',
      riskBreakdown: { high: 15, medium: 35, low: 50 },
      critical: 5, criticalDiff: '+1', 
      nhi: '10,507', nhiPercent: '82%',
      adminMfaGap: 23, adminMfaGapDiff: '-2',
      offboardingRisk: 8, offboardingRiskDiff: '+2',
      ai: 42, aiDiff: '+6', aiPriv: 11,
      mfa: 8, mfaPercent: '96%',
      overPrivUsers: 850, overPrivUsersDiff: '+50',
      overPrivNhi: '1.2k', overPrivNhiDiff: '0',
      nhiBreakdown: [
        { label: 'API Keys', value: 4234, color: 'bg-amber-400', width: '80%' },
        { label: 'Service Accounts', value: 3891, color: 'bg-blue-500', width: '70%' },
        { label: 'OAuth Apps', value: 1456, color: 'bg-indigo-500', width: '30%' },
        { label: 'Bot / AI Agents', value: 926, color: 'bg-purple-500', width: '20%', badge: 'Growth' }
      ],
      adminStats: {
        total: 45,
        label: 'Total Administrators',
        breakdown: [
           { label: 'AWS IAM', count: 15, max: 20, color: 'bg-amber-500' },
           { label: 'Microsoft Entra ID', count: 12, max: 20, color: 'bg-blue-600' },
           { label: 'Okta', count: 6, max: 20, color: 'bg-indigo-700' },
           { label: 'Google Workspace', count: 5, max: 20, color: 'bg-red-500' },
           { label: 'Salesforce', count: 4, max: 20, color: 'bg-sky-500' },
           { label: 'GitHub', count: 3, max: 20, color: 'bg-slate-800' }
        ]
      }
    },
    'Microsoft 365': { score: 68, scoreDiff: '-2', riskBreakdown: { high: 8, medium: 12, low: 80 }, critical: 8, criticalDiff: '+4', nhi: '4,210', nhiPercent: '65%', adminMfaGap: 8, adminMfaGapDiff: '-1', offboardingRisk: 2, offboardingRiskDiff: '+1', ai: 12, aiDiff: '+2', aiPriv: 4, mfa: 2, mfaPercent: '98%', overPrivUsers: 210, overPrivUsersDiff: '+12', overPrivNhi: '450', overPrivNhiDiff: '+2', nhiBreakdown: [{ label: 'API Keys', value: 1200, color: 'bg-amber-400', width: '60%' }, { label: 'Service Accounts', value: 2000, color: 'bg-blue-500', width: '85%' }, { label: 'OAuth Apps', value: 800, color: 'bg-indigo-500', width: '40%' }, { label: 'Bot / AI Agents', value: 210, color: 'bg-purple-500', width: '15%', badge: 'Growth' }], adminStats: { total: 8, label: 'Privileged Roles', breakdown: [{ label: 'Global Administrator', count: 3, max: 5, color: 'bg-blue-600' }, { label: 'Exchange Administrator', count: 2, max: 5, color: 'bg-sky-500' }, { label: 'SharePoint Administrator', count: 2, max: 5, color: 'bg-teal-500' }, { label: 'User Administrator', count: 1, max: 5, color: 'bg-indigo-500' }] } },
    'Entra ID': { score: 85, scoreDiff: '+8', riskBreakdown: { high: 2, medium: 5, low: 93 }, critical: 2, criticalDiff: '-1', nhi: '1,500', nhiPercent: '40%', adminMfaGap: 1, adminMfaGapDiff: '0', offboardingRisk: 0, offboardingRiskDiff: '0', ai: 0, aiDiff: '0', aiPriv: 0, mfa: 0, mfaPercent: '100%', overPrivUsers: 50, overPrivUsersDiff: '-2', overPrivNhi: '120', overPrivNhiDiff: '-5', nhiBreakdown: [{ label: 'API Keys', value: 200, color: 'bg-amber-400', width: '20%' }, { label: 'Service Principals', value: 1200, color: 'bg-blue-500', width: '90%' }, { label: 'OAuth Apps', value: 100, color: 'bg-indigo-500', width: '10%' }, { label: 'Bot / AI Agents', value: 0, color: 'bg-purple-500', width: '0%' }], adminStats: { total: 4, label: 'Principals', breakdown: [{ label: 'Service Principal Owner', count: 2, max: 3, color: 'bg-blue-600' }, { label: 'Global Administrator', count: 1, max: 3, color: 'bg-indigo-500' }, { label: 'App Administrator', count: 1, max: 3, color: 'bg-sky-500' }] } },
    'Salesforce': { score: 78, scoreDiff: '+3', riskBreakdown: { high: 5, medium: 15, low: 80 }, critical: 3, criticalDiff: '0', nhi: '1,800', nhiPercent: '90%', adminMfaGap: 0, adminMfaGapDiff: '0', offboardingRisk: 1, offboardingRiskDiff: '+1', ai: 5, aiDiff: '+1', aiPriv: 2, mfa: 0, mfaPercent: '100%', overPrivUsers: 120, overPrivUsersDiff: '+5', overPrivNhi: '300', overPrivNhiDiff: '+10', nhiBreakdown: [{ label: 'API Keys', value: 800, color: 'bg-amber-400', width: '70%' }, { label: 'Service Accounts', value: 400, color: 'bg-blue-500', width: '40%' }, { label: 'OAuth Apps', value: 500, color: 'bg-indigo-500', width: '50%' }, { label: 'Bot / AI Agents', value: 100, color: 'bg-purple-500', width: '10%', badge: 'Growth' }], adminStats: { total: 4, label: 'Admin Profiles', breakdown: [{ label: 'System Administrator', count: 2, max: 4, color: 'bg-sky-500' }, { label: 'Application Administrator', count: 2, max: 4, color: 'bg-blue-500' }] } },
    'AWS': { score: 65, scoreDiff: '-5', riskBreakdown: { high: 20, medium: 30, low: 50 }, critical: 24, criticalDiff: '+8', nhi: '3,100', nhiPercent: '95%', adminMfaGap: 14, adminMfaGapDiff: '+3', offboardingRisk: 5, offboardingRiskDiff: '+1', ai: 15, aiDiff: '+3', aiPriv: 8, mfa: 12, mfaPercent: '85%', overPrivUsers: 380, overPrivUsersDiff: '+30', overPrivNhi: '1.5k', overPrivNhiDiff: '+25', nhiBreakdown: [{ label: 'Access Keys', value: 1800, color: 'bg-amber-400', width: '90%' }, { label: 'IAM Roles', value: 900, color: 'bg-blue-500', width: '50%' }, { label: 'OAuth Apps', value: 100, color: 'bg-indigo-500', width: '10%' }, { label: 'Bot / AI Agents', value: 300, color: 'bg-purple-500', width: '25%', badge: 'Growth' }], adminStats: { total: 15, label: 'IAM Policies', breakdown: [{ label: 'AdministratorAccess', count: 8, max: 10, color: 'bg-amber-500' }, { label: 'PowerUserAccess', count: 5, max: 10, color: 'bg-orange-400' }, { label: 'SystemAdministrator', count: 2, max: 10, color: 'bg-slate-600' }] } }
  };

  metrics = computed(() => {
    return this.platformStats[this.currentPlatform()] || this.platformStats['All Platforms'];
  });

  filteredAlerts = computed(() => {
    const filter = this.activeCategoryFilter();
    const search = this.searchQuery().toLowerCase();
    
    let result = this.alerts();

    // 1. Apply Category Filter
    if (filter !== 'all') {
      if (filter === 'critical') {
        result = result.filter(a => a.severity === 'Critical');
      } else {
        result = result.filter(a => a.category === filter);
      }
    }

    // 2. Apply Search
    if (search) {
      result = result.filter(a => 
        a.title.toLowerCase().includes(search) || 
        a.asset.toLowerCase().includes(search) ||
        a.id.toLowerCase().includes(search)
      );
    }
    
    return result;
  });

  alertCount = computed(() => this.alerts().filter(a => a.status !== 'Resolved').length);
  unassignedCount = computed(() => this.alerts().filter(a => !a.assignee && a.status === 'Open').length);

  setPlatform(event: Event) {
    this.currentPlatform.set((event.target as HTMLSelectElement).value);
  }

  // Interaction Logic
  navigateToSecOps(filter: string) {
    this.currentView.set('secops');
    this.activeCategoryFilter.set(filter);
  }

  openAlert(alert: SecurityAlert) {
    this.selectedAlert.set(alert);
  }

  closeAlert() {
    this.selectedAlert.set(null);
  }

  // Helper methods for Pie Chart
  getTotal(breakdown: any): number {
    return (breakdown?.high || 0) + (breakdown?.medium || 0) + (breakdown?.low || 0) || 1;
  }

  getSlice(value: number, total: number): string {
    const pct = (value / total) * 100;
    return `${pct}, 100`;
  }

  getOffset(prevValue: number, total: number): number {
    const pct = (prevValue / total) * 100;
    return -pct;
  }

  // --- TOOLTIP LOGIC ---
  showDist(event: MouseEvent, type: string) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.distTooltipPos.set({ x: event.clientX + 15, y: event.clientY - 20 });
    this.distTooltip.set(this.getDistributionData(type));
  }

  hideDist() {
    this.distTooltip.set(null);
  }

  getDistributionData(type: string) {
    // Return mock distribution data based on metric type
    switch(type) {
        case 'score':
            return {
                title: 'Risk Contributors',
                items: [
                    { label: 'M365', value: '33%', icon: 'm365' },
                    { label: 'AWS', value: '25%', icon: 'aws' },
                    { label: 'Salesforce', value: '15%', icon: 'salesforce' },
                    { label: 'Okta', value: '12%', icon: 'okta' },
                    { label: 'Google', value: '10%', icon: 'google' },
                    { label: 'Others', value: '5%', icon: 'slack' }
                ]
            };
        case 'critical':
            return {
                title: 'Critical Issues Breakdown',
                items: [
                    { label: 'AWS IAM', value: 3, icon: 'aws' },
                    { label: 'M365 Admin', value: 1, icon: 'm365' },
                    { label: 'Okta Policy', value: 1, icon: 'okta' }
                ]
            };
        case 'mfa':
            return {
                title: 'Missing MFA by App',
                items: [
                    { label: 'AWS Console', value: 14, icon: 'aws' },
                    { label: 'M365 Legacy', value: 8, icon: 'm365' },
                    { label: 'Salesforce', value: 1, icon: 'salesforce' }
                ]
            };
        case 'offboarding':
            return {
                title: 'Stale Accounts > 90d',
                items: [
                    { label: 'Google', value: 4, icon: 'google' },
                    { label: 'M365', value: 2, icon: 'm365' },
                    { label: 'Salesforce', value: 1, icon: 'salesforce' },
                    { label: 'Slack', value: 1, icon: 'slack' }
                ]
            };
        case 'admins':
            return {
                title: 'Global Admins by Provider',
                items: [
                    { label: 'AWS IAM', value: 15, icon: 'aws' },
                    { label: 'Entra ID', value: 12, icon: 'azure' },
                    { label: 'Okta', value: 6, icon: 'okta' },
                    { label: 'Google', value: 5, icon: 'google' },
                    { label: 'Salesforce', value: 4, icon: 'salesforce' },
                    { label: 'GitHub', value: 3, icon: 'github' }
                ]
            };
        default: return null;
    }
  }

  getIcon(name: string): string {
    const icons: Record<string, string> = {
        aws: '<path d="M12 2L2 22h20L12 2z" fill="#FF9900"/>',
        azure: '<path d="M11.5 2l-9 16h8l3.5-7 3.5 7h5l-11-16z" fill="#0078D4"/>',
        m365: '<path d="M11.5 2l-9 16h8l3.5-7 3.5 7h5l-11-16z" fill="#0078D4"/>', 
        google: '<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>',
        salesforce: '<path d="M17 10c0-2.2-1.8-4-4-4-.7 0-1.4.2-2 .5C10.4 4.1 7.9 4 6 6c-2.2 2.2-2.2 5.8 0 8 1.5 1.5 3.9 1.8 5.7 1 .6 1.1 1.9 1.8 3.3 1.5 2.5-.5 4-2.9 3.5-5.3.3-.3.5-.7.5-1.2z" fill="#00A1E0"/>',
        slack: '<path d="M6 15a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm1 0v3a2.5 2.5 0 11-5 0v-3h5zm3-8a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm-3 1v5h3a2.5 2.5 0 110-5h-3z" fill="#E01E5A"/>',
        okta: '<circle cx="12" cy="12" r="10" stroke="#00297A" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="5" fill="#00297A"/>',
        github: '<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" fill="#181717"/>'
    };
    return `<svg viewBox="0 0 24 24" class="w-full h-full" fill="none">${icons[name] || ''}</svg>`;
  }
}
