
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';

interface PolicyItem {
  id: string;
  title: string;
  description: string;
  status: 'Completed' | 'Blocked' | 'Pending';
  tags: string[];
  iconType: 'shield'; 
}

interface TemplateItem {
  id: string;
  title: string;
  platform: string;
  iconType: 'alert';
}

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full w-full bg-slate-50 flex flex-col font-sans overflow-hidden relative">
      
      <!-- Top Header -->
      <div class="bg-white border-b border-slate-200 px-8 py-6 flex-shrink-0 flex justify-between items-center sticky top-0 z-30">
         <div>
            <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Policy</h1>
            <p class="text-sm text-slate-500 mt-1">Detection rules and security use cases</p>
         </div>
         
         <button (click)="openCreateModal()" class="bg-[#1e2e6e] hover:bg-[#15204d] text-white font-medium py-2.5 px-5 rounded-lg shadow-sm transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            Create Policy
         </button>
      </div>

      <div class="flex-1 overflow-y-auto p-8">
         
         <!-- Stats Row -->
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
               <span class="text-sm text-slate-500 font-medium">Total Use Cases</span>
               <span class="text-4xl font-bold text-slate-900">96</span>
            </div>
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
               <span class="text-sm text-slate-500 font-medium">Active Policies</span>
               <span class="text-4xl font-bold text-emerald-500">57</span>
            </div>
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
               <span class="text-sm text-slate-500 font-medium">Pending</span>
               <span class="text-4xl font-bold text-orange-500">25</span>
            </div>
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
               <span class="text-sm text-slate-500 font-medium">Categories</span>
               <span class="text-4xl font-bold text-blue-600">23</span>
            </div>
         </div>

         <!-- Search Bar -->
         <div class="relative w-full max-w-2xl mb-8">
             <input type="text" placeholder="Search policies..." 
                [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)"
                class="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm text-slate-600 placeholder:text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-400 absolute left-4 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
         </div>

         <!-- Policies Grid -->
         <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            @for (policy of filteredPolicies(); track policy.id) {
               <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col">
                  
                  <div class="flex justify-between items-start mb-4">
                     <!-- Icon Box -->
                     <div class="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                     </div>
                     
                     <!-- Status Badge -->
                     <span class="px-3 py-1 rounded-full text-xs font-bold"
                        [class.bg-emerald-50]="policy.status === 'Completed'"
                        [class.text-emerald-600]="policy.status === 'Completed'"
                        [class.bg-slate-100]="policy.status === 'Blocked'"
                        [class.text-slate-500]="policy.status === 'Blocked'">
                        {{ policy.status }}
                     </span>
                  </div>

                  <h3 class="font-bold text-slate-900 text-lg mb-2 leading-snug">{{ policy.title }}</h3>
                  <p class="text-sm text-slate-500 mb-6 flex-1">{{ policy.description }}</p>

                  <div class="flex items-center justify-between mt-auto">
                     <div class="flex gap-2">
                        @for (tag of policy.tags; track tag) {
                           <span class="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">{{ tag }}</span>
                        }
                     </div>
                     <div class="flex gap-3 text-slate-400">
                        <button class="hover:text-slate-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                        <button class="hover:text-slate-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                     </div>
                  </div>
               </div>
            }
         </div>

      </div>

      <!-- CREATE POLICY MODAL -->
      @if (showCreateModal()) {
         <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
               
               <!-- Modal Header -->
               <div class="px-8 py-5 border-b border-slate-200 flex justify-between items-center bg-white flex-shrink-0">
                  <h2 class="text-xl font-bold text-slate-800">Create New Policy</h2>
                  <button (click)="closeCreateModal()" class="text-slate-400 hover:text-slate-600">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>

               <!-- Stepper -->
               <div class="px-8 py-4 border-b border-slate-100 bg-white">
                  <div class="flex items-center gap-4 text-sm font-medium">
                     <div class="flex items-center gap-2" [class.text-[#1e2e6e]]="currentStep() >= 1" [class.text-slate-400]="currentStep() < 1">
                        <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                           [class.bg-[#1e2e6e]]="currentStep() >= 1" [class.text-white]="currentStep() >= 1"
                           [class.bg-slate-100]="currentStep() < 1">1</span>
                        <span>Select Template</span>
                     </div>
                     <div class="text-slate-300">›</div>
                     <div class="flex items-center gap-2" [class.text-[#1e2e6e]]="currentStep() >= 2" [class.text-slate-400]="currentStep() < 2">
                        <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                           [class.bg-[#1e2e6e]]="currentStep() >= 2" [class.text-white]="currentStep() >= 2"
                           [class.bg-slate-100]="currentStep() < 2">2</span>
                        <span>Configure</span>
                     </div>
                     <div class="text-slate-300">›</div>
                     <div class="flex items-center gap-2" [class.text-[#1e2e6e]]="currentStep() >= 3" [class.text-slate-400]="currentStep() < 3">
                        <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                           [class.bg-[#1e2e6e]]="currentStep() >= 3" [class.text-white]="currentStep() >= 3"
                           [class.bg-slate-100]="currentStep() < 3">3</span>
                        <span>Review</span>
                     </div>
                  </div>
               </div>

               <!-- Step 1: Select Template -->
               @if (currentStep() === 1) {
                  <div class="flex-1 overflow-y-auto p-8 bg-slate-50">
                     <p class="text-slate-500 mb-6 text-sm">Select a use case template to create your policy:</p>
                     <div class="grid grid-cols-2 gap-4">
                        @for (template of templates; track template.id) {
                           <div (click)="selectTemplate(template)" 
                                class="bg-white p-5 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group relative overflow-hidden"
                                [class.ring-2]="selectedTemplate()?.id === template.id"
                                [class.ring-blue-500]="selectedTemplate()?.id === template.id"
                                [class.border-transparent]="selectedTemplate()?.id === template.id">
                                <div class="flex justify-between items-start mb-3">
                                   <div class="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                      </svg>
                                   </div>
                                   @if(selectedTemplate()?.id === template.id) {
                                      <div class="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                         <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                                      </div>
                                   }
                                </div>
                                <h4 class="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">{{ template.title }}</h4>
                                <span class="text-xs text-slate-500">{{ template.platform }}</span>
                           </div>
                        }
                     </div>
                  </div>
               }

               <!-- Step 2: Configure -->
               @if (currentStep() === 2) {
                  <div class="flex-1 overflow-y-auto p-8 bg-white space-y-6">
                     
                     <!-- Policy Name -->
                     <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1.5">Policy Name</label>
                        <input [(ngModel)]="policyForm.name" type="text" class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none bg-slate-50 text-slate-800">
                     </div>

                     <!-- Description -->
                     <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                        <textarea [(ngModel)]="policyForm.description" rows="3" class="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none bg-slate-50 text-slate-600"></textarea>
                     </div>

                     <!-- Severity -->
                     <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Severity</label>
                        <div class="flex gap-2">
                           <button (click)="policyForm.severity = 'Critical'" 
                             [class]="policyForm.severity === 'Critical' ? 'bg-slate-200 text-slate-900 border-slate-300' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'"
                             class="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors">Critical</button>
                           <button (click)="policyForm.severity = 'High'" 
                             [class]="policyForm.severity === 'High' ? 'bg-slate-200 text-slate-900 border-slate-300' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'"
                             class="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors">High</button>
                           <button (click)="policyForm.severity = 'Medium'" 
                             [class]="policyForm.severity === 'Medium' ? 'bg-[#1e2e6e] text-white border-[#1e2e6e]' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'"
                             class="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors">Medium</button>
                           <button (click)="policyForm.severity = 'Low'" 
                             [class]="policyForm.severity === 'Low' ? 'bg-slate-200 text-slate-900 border-slate-300' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'"
                             class="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors">Low</button>
                        </div>
                     </div>

                     <!-- Target Platforms -->
                     <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Target Platforms</label>
                        <div class="flex flex-wrap gap-2">
                           @for(p of platforms; track p) {
                              <button (click)="togglePlatform(p)" 
                                 [class]="policyForm.platforms.includes(p) ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'"
                                 class="px-4 py-1.5 rounded-full border text-sm font-medium transition-all">
                                 {{ p }}
                              </button>
                           }
                        </div>
                     </div>

                     <div class="h-px bg-slate-100 my-2"></div>

                     <!-- Checkboxes -->
                     <div class="space-y-3">
                        <label class="flex items-center gap-3 cursor-pointer group">
                           <input type="checkbox" [(ngModel)]="policyForm.complianceScoring" class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors">
                           <span class="text-sm text-slate-700 font-medium group-hover:text-slate-900">Include in compliance scoring</span>
                        </label>
                        <label class="flex items-center gap-3 cursor-pointer group">
                           <input type="checkbox" [(ngModel)]="policyForm.autoRemediation" class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors">
                           <span class="text-sm text-slate-700 font-medium group-hover:text-slate-900">Enable auto-remediation (where supported)</span>
                        </label>
                     </div>
                     
                     <!-- Notifications -->
                     <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Notifications</label>
                        <div class="flex gap-6">
                           <label class="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-blue-600">
                              <span class="text-sm text-slate-600">Email</span>
                           </label>
                           <label class="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-blue-600">
                              <span class="text-sm text-slate-600">Slack</span>
                           </label>
                           <label class="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-blue-600">
                              <span class="text-sm text-slate-600">Teams</span>
                           </label>
                        </div>
                     </div>

                  </div>
               }
               
               <!-- Step 3: Review (Mock) -->
               @if (currentStep() === 3) {
                  <div class="flex-1 overflow-y-auto p-8 bg-slate-50 flex items-center justify-center">
                      <div class="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md w-full">
                         <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </div>
                         <h3 class="text-xl font-bold text-slate-900 mb-2">Ready to Create Policy?</h3>
                         <p class="text-sm text-slate-500 mb-6">Review your settings before enabling. This policy will be active immediately upon creation.</p>
                         
                         <div class="text-left bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm space-y-2 mb-6">
                            <div class="flex justify-between"><span class="text-slate-500">Name:</span> <span class="font-medium text-slate-900">{{ policyForm.name }}</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Severity:</span> <span class="font-medium text-slate-900">{{ policyForm.severity }}</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Platforms:</span> <span class="font-medium text-slate-900">{{ policyForm.platforms.join(', ') }}</span></div>
                         </div>
                      </div>
                  </div>
               }

               <!-- Footer Actions -->
               <div class="px-8 py-5 border-t border-slate-200 bg-white flex justify-between items-center">
                  <button (click)="prevStep()" [disabled]="currentStep() === 1" class="px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Back</button>
                  
                  @if (currentStep() < 3) {
                     <button (click)="nextStep()" [disabled]="currentStep() === 1 && !selectedTemplate()" class="px-6 py-2.5 bg-[#1e2e6e] text-white font-bold rounded-lg hover:bg-[#15204d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">Continue</button>
                  } @else {
                     <button (click)="createPolicy()" class="px-6 py-2.5 bg-[#1e2e6e] text-white font-bold rounded-lg hover:bg-[#15204d] transition-colors shadow-sm">Enable Policy</button>
                  }
               </div>

            </div>
         </div>
      }

    </div>
  `,
  styles: [`
    .animate-fade-in-up { animation: fadeInUp 0.3s ease-out; }
    @keyframes fadeInUp {
       from { opacity: 0; transform: translateY(20px); }
       to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class PoliciesComponent {
  dataService = inject(DataService);
  Math = Math;
  
  searchQuery = signal('');
  
  // Policies Data
  policies = signal<PolicyItem[]>([
     { id: '1', title: 'Cross-Tenant Settings Change', description: 'A change was made to the cross-tenant access settings in Azure AD.', status: 'Completed', tags: ['azure', 'Collection'], iconType: 'shield' },
     { id: '2', title: 'Adding a New Organization for Cross-Tenant', description: 'Another Azure AD tenant added to cross-tenant access settings.', status: 'Completed', tags: ['azure', 'Collection'], iconType: 'shield' },
     { id: '3', title: 'Failed Authentication Attempts', description: 'Multiple failed authentications were detected.', status: 'Completed', tags: ['azure', 'Credential access'], iconType: 'shield' },
     { id: '4', title: 'Password Spraying Detected', description: 'Failed authentications across multiple accounts from a single location.', status: 'Completed', tags: ['azure', 'Credential access'], iconType: 'shield' },
     { id: '5', title: 'SAML Token Abuse', description: 'Possible Azure SAML token abuse detected. This indicates theft.', status: 'Blocked', tags: ['azure', 'Credential access'], iconType: 'shield' },
     { id: '6', title: 'MFA Denied', description: 'MFA prompt denied by the end user. This could indicate compromise.', status: 'Completed', tags: ['azure', 'Credential access'], iconType: 'shield' }
  ]);

  // Create Modal State
  showCreateModal = signal(false);
  currentStep = signal(1);
  selectedTemplate = signal<TemplateItem | null>(null);

  // Form State
  policyForm = {
    name: '',
    description: '',
    severity: 'Medium',
    platforms: [] as string[],
    complianceScoring: true,
    autoRemediation: false
  };

  // Static Data
  templates: TemplateItem[] = [
    { id: 't1', title: 'Cross-Tenant Settings Change', platform: 'azure', iconType: 'alert' },
    { id: 't2', title: 'Adding a New Organization for Cross-Tenant', platform: 'azure', iconType: 'alert' },
    { id: 't3', title: 'Failed Authentication Attempts', platform: 'azure', iconType: 'alert' },
    { id: 't4', title: 'Password Spraying Detected', platform: 'azure', iconType: 'alert' },
    { id: 't5', title: 'SAML Token Abuse', platform: 'azure', iconType: 'alert' },
    { id: 't6', title: 'MFA Denied', platform: 'azure', iconType: 'alert' }
  ];

  platforms = ['Azure', 'AWS', 'GCP', 'Entra ID', 'Google Workspace', 'Slack', 'ServiceNow', 'Salesforce'];

  filteredPolicies = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.policies().filter(p => p.title.toLowerCase().includes(q));
  });

  // Actions
  openCreateModal() {
     this.currentStep.set(1);
     this.selectedTemplate.set(null);
     this.policyForm = { name: '', description: '', severity: 'Medium', platforms: [], complianceScoring: true, autoRemediation: false };
     this.showCreateModal.set(true);
  }

  closeCreateModal() {
     this.showCreateModal.set(false);
  }

  selectTemplate(t: TemplateItem) {
     this.selectedTemplate.set(t);
  }

  nextStep() {
     if (this.currentStep() === 1 && this.selectedTemplate()) {
        // Pre-fill form
        this.policyForm.name = this.selectedTemplate()!.title;
        // Mock description lookup
        if (this.selectedTemplate()!.title.includes('Password Spraying')) {
           this.policyForm.description = 'Failed authentications across multiple accounts from a single location were observed. IP address and targeted users needs to be investigated across the tenant.';
        } else {
           this.policyForm.description = `Policy to detect ${this.selectedTemplate()!.title.toLowerCase()} events.`;
        }
        this.currentStep.update(s => s + 1);
     } else if (this.currentStep() === 2) {
        this.currentStep.update(s => s + 1);
     }
  }

  prevStep() {
     if (this.currentStep() > 1) {
        this.currentStep.update(s => s - 1);
     } else {
        this.closeCreateModal();
     }
  }

  togglePlatform(p: string) {
     const idx = this.policyForm.platforms.indexOf(p);
     if (idx > -1) {
        this.policyForm.platforms.splice(idx, 1);
     } else {
        this.policyForm.platforms.push(p);
     }
  }

  createPolicy() {
     // Add to list
     this.policies.update(list => [
        {
           id: Math.random().toString(36).substr(2, 5),
           title: this.policyForm.name,
           description: this.policyForm.description.substring(0, 80) + '...',
           status: 'Pending',
           tags: this.policyForm.platforms.map(p => p.toLowerCase()),
           iconType: 'shield'
        },
        ...list
     ]);
     this.closeCreateModal();
  }
}
