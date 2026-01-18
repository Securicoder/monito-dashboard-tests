import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface IntegrationCard {
  id: string;
  name: string;
  description: string;
  iconType: string;
  category: 'identity' | 'hr' | 'devops' | 'productivity' | 'custom' | 'notification';
  connected: boolean;
  isLoading?: boolean;
}

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full bg-slate-50 flex flex-col font-sans overflow-y-auto">
      
      <!-- Header -->
      <div class="bg-white border-b border-slate-200 px-8 py-6 flex-shrink-0 sticky top-0 z-30 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Integrations Directory</h1>
          <p class="text-sm text-slate-500 mt-1">Connect your identity providers, SaaS applications, and developer tools.</p>
        </div>
        
        <!-- Filter Tabs -->
        <div class="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto">
          @for (filter of filters; track filter.id) {
            <button (click)="activeFilter.set(filter.id)"
               class="px-3 py-1.5 rounded-md text-xs font-bold transition-all"
               [class.bg-white]="activeFilter() === filter.id"
               [class.text-slate-900]="activeFilter() === filter.id"
               [class.shadow-sm]="activeFilter() === filter.id"
               [class.text-slate-500]="activeFilter() !== filter.id"
               [class.hover:text-slate-700]="activeFilter() !== filter.id">
               {{ filter.label }}
            </button>
          }
        </div>
      </div>

      <div class="p-8 max-w-[1600px] mx-auto w-full space-y-10">
        
        <!-- Section 1: Main Catalog -->
        <section>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (provider of filteredProviders(); track provider.id) {
              <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col hover:shadow-md transition-all group relative overflow-hidden">
                
                <!-- Status Badge -->
                @if (provider.connected) {
                   <div class="absolute top-0 right-0 p-4">
                      <span class="flex h-3 w-3">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                   </div>
                }

                <div class="flex items-start justify-between mb-5">
                  <!-- Icons -->
                  <div class="w-14 h-14 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:border-slate-200 transition-colors p-2.5">
                    @switch (provider.iconType) {
                      @case ('auth0') {
                        <svg viewBox="0 0 24 24" class="w-full h-full" fill="none">
                          <path d="M16.3 7l-4.7-2.8c-.8-.5-2.4-.5-3.2 0L3.7 7C2.9 7.5 2 9 2 10v6c0 1 .8 2.5 1.7 3l4.7 2.8c.8.5 2.4.5 3.2 0l4.7-2.8c.8-.5 1.7-2 1.7-3v-6c0-1-.9-2.5-1.7-3z" stroke="#EB5424" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M12 11l-3 1.5 5 3" stroke="#EB5424" stroke-width="2"/>
                        </svg>
                      }
                      @case ('azure') {
                        <svg viewBox="0 0 24 24" class="w-full h-full" fill="none">
                          <path d="M11.5 2l-9 16h8l3.5-7 3.5 7h5l-11-16z" fill="#0078D4"/>
                          <path d="M14 11l-3.5 7h7L14 11z" fill="#3E3E3E" opacity="0.2"/>
                        </svg>
                      }
                      @case ('duo') {
                        <svg viewBox="0 0 24 24" class="w-full h-full" fill="none">
                           <rect x="3" y="5" width="18" height="14" rx="3" fill="#86D14E"/>
                           <path d="M7 12h3m4 0h3" stroke="white" stroke-width="3" stroke-linecap="round"/>
                        </svg>
                      }
                      @case ('google') {
                        <svg viewBox="0 0 24 24" class="w-full h-full">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      }
                      @case ('okta') {
                        <svg viewBox="0 0 24 24" class="w-full h-full">
                          <circle cx="12" cy="12" r="10" stroke="#00297A" stroke-width="2" fill="none"/>
                          <circle cx="12" cy="12" r="5" fill="#00297A"/>
                        </svg>
                      }
                      @case ('workday') {
                        <svg viewBox="0 0 24 24" class="w-full h-full" fill="none">
                          <path d="M2 5h20v4h-20z" fill="#005CB9"/>
                          <path d="M6 10c0 4.4 3.6 8 8 8s8-3.6 8-8" stroke="#E28109" stroke-width="3"/>
                          <path d="M14 10v6" stroke="#005CB9" stroke-width="3"/>
                          <path d="M10 10l4 6 4-6" stroke="#005CB9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      }
                      @case ('salesforce') {
                        <svg viewBox="0 0 24 24" class="w-full h-full" fill="none">
                          <path d="M17 10c0-2.2-1.8-4-4-4-.7 0-1.4.2-2 .5C10.4 4.1 7.9 4 6 6c-2.2 2.2-2.2 5.8 0 8 1.5 1.5 3.9 1.8 5.7 1 .6 1.1 1.9 1.8 3.3 1.5 2.5-.5 4-2.9 3.5-5.3.3-.3.5-.7.5-1.2z" fill="#00A1E0"/>
                          <path d="M8 12c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1zm4-2c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1zm4 3c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1z" fill="white"/>
                        </svg>
                      }
                      @case ('servicenow') {
                        <svg viewBox="0 0 24 24" class="w-full h-full" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#032D42"/>
                          <path d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z" fill="#81B5A1"/>
                        </svg>
                      }
                      @case ('github') {
                        <svg viewBox="0 0 24 24" class="w-full h-full" fill="none">
                           <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" fill="#181717"/>
                        </svg>
                      }
                      @case ('jira') {
                        <svg viewBox="0 0 24 24" class="w-full h-full" fill="none">
                           <path d="M11.5 11.5L2 21H11.5V11.5Z" fill="#0052CC"/>
                           <path d="M11.5 2L2 11.5V2H11.5Z" fill="#0052CC"/>
                           <path d="M22 11.5L12.5 21H22V11.5Z" fill="#2684FF"/>
                        </svg>
                      }
                      @case ('zoom') {
                         <svg viewBox="0 0 24 24" class="w-full h-full" fill="none">
                           <rect width="24" height="24" rx="4" fill="#2D8CFF"/>
                           <path d="M5 8.5C5 7.67157 5.67157 7 6.5 7H13.5C14.3284 7 15 7.67157 15 8.5V15.5C15 16.3284 14.3284 17 13.5 17H6.5C5.67157 17 5 16.3284 5 15.5V8.5Z" fill="white"/>
                           <path d="M16 9.5L19 7.5V16.5L16 14.5V9.5Z" fill="white"/>
                         </svg>
                      }
                      @case ('upload') {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-cydenti-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      }
                    }
                  </div>
                </div>

                <div class="mb-5 flex-1">
                  <h3 class="font-bold text-slate-900 text-lg mb-2">{{ provider.name }}</h3>
                  <p class="text-xs text-slate-500 leading-relaxed font-medium">{{ provider.description }}</p>
                </div>

                <button (click)="toggleConnection(provider.id)" 
                  class="w-full py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 border"
                  [disabled]="provider.isLoading"
                  [class.opacity-80]="provider.isLoading"
                  [class.bg-white]="!provider.connected && !provider.isLoading"
                  [class.border-cydenti-blue]="!provider.connected && !provider.isLoading"
                  [class.text-cydenti-blue]="!provider.connected && !provider.isLoading"
                  [class.hover:bg-blue-50]="!provider.connected && !provider.isLoading"
                  [class.bg-slate-100]="provider.connected"
                  [class.border-transparent]="provider.connected"
                  [class.text-slate-500]="provider.connected">
                  
                  @if (provider.isLoading) {
                     <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-cydenti-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Connecting...
                  } @else if (provider.connected) {
                     <span>Configure</span>
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  } @else if (provider.iconType === 'upload') {
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                     Upload File
                  } @else {
                     <span class="text-lg leading-none mb-0.5">+</span> Add Integration
                  }
                </button>
              </div>
            }
          </div>
        </section>

        <!-- Section 2: Notifications -->
        <section>
          <div class="flex items-center gap-4 mb-4">
             <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">Notification Channels</h2>
             <div class="h-px bg-slate-200 flex-1"></div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (target of notificationTargets(); track target.id) {
              <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow group">
                 <div class="flex items-center gap-4">
                     <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100">
                        @switch (target.iconType) {
                           @case ('email') { <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> }
                           @case ('teams') { <svg viewBox="0 0 24 24" class="w-6 h-6" fill="none"><path d="M15.5 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" fill="#5059C9"/><path d="M19.5 14h-8c-1.1 0-2 .9-2 2v2h12v-2c0-1.1-.9-2-2-2z" fill="#5059C9" opacity="0.8"/><path d="M7.5 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" fill="#5059C9"/><path d="M11.5 14h-8c-1.1 0-2 .9-2 2v2h12v-2c0-1.1-.9-2-2-2z" fill="#5059C9"/></svg> }
                           @case ('slack') { <svg viewBox="0 0 24 24" class="w-6 h-6"><path d="M6 15a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm1 0v3a2.5 2.5 0 11-5 0v-3h5zm3-8a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm-3 1v5h3a2.5 2.5 0 110-5h-3z" fill="#E01E5A"/><path d="M18 15a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm-6 0v3a2.5 2.5 0 110-5h5zm-2-8a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zm0 1v5h5a2.5 2.5 0 11-5 0v-5z" fill="#36C5F0"/></svg> }
                        }
                     </div>
                     <div>
                        <div class="font-bold text-slate-900 text-sm">{{ target.name }}</div>
                        <div class="text-[10px] text-slate-400 uppercase font-bold tracking-wide">{{ target.connected ? 'Active' : 'Not Connected' }}</div>
                     </div>
                 </div>

                 <button (click)="toggleConnection(target.id)" 
                   class="px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                   [class.bg-emerald-50]="target.connected"
                   [class.text-emerald-700]="target.connected"
                   [class.bg-slate-100]="!target.connected"
                   [class.text-slate-600]="!target.connected"
                   [class.hover:bg-slate-200]="!target.connected">
                   {{ target.connected ? 'Configure' : 'Connect' }}
                 </button>
              </div>
            }
          </div>
        </section>

      </div>
    </div>
  `
})
export class IntegrationsComponent {

  filters = [
    { id: 'all', label: 'All Apps' },
    { id: 'identity', label: 'Identity' },
    { id: 'hr', label: 'HR / People' },
    { id: 'devops', label: 'DevOps & Cloud' },
    { id: 'productivity', label: 'Productivity' }
  ];
  activeFilter = signal<string>('all');

  providers = signal<IntegrationCard[]>([
    {
      id: 'auth0',
      name: 'Auth0',
      description: 'Flexible authentication and authorization platform.',
      iconType: 'auth0',
      category: 'identity',
      connected: false
    },
    {
      id: 'azure',
      name: 'Azure AD',
      description: 'Microsoft Entra ID enterprise identity service.',
      iconType: 'azure',
      category: 'identity',
      connected: false
    },
    {
      id: 'okta',
      name: 'Okta',
      description: 'World’s #1 Identity platform for workforce & customers.',
      iconType: 'okta',
      category: 'identity',
      connected: true
    },
    {
      id: 'duo',
      name: 'Duo Security',
      description: 'User-centric access security and MFA.',
      iconType: 'duo',
      category: 'identity',
      connected: false
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Complete developer platform to build, scale, and secure software.',
      iconType: 'github',
      category: 'devops',
      connected: false
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'CRM and cloud computing solutions.',
      iconType: 'salesforce',
      category: 'productivity',
      connected: true
    },
    {
      id: 'workday',
      name: 'Workday',
      description: 'Finance, HR, and planning system.',
      iconType: 'workday',
      category: 'hr',
      connected: false
    },
    {
      id: 'servicenow',
      name: 'ServiceNow',
      description: 'IT Service Management and digital workflows.',
      iconType: 'servicenow',
      category: 'devops',
      connected: false
    },
    {
      id: 'google',
      name: 'Google Workspace',
      description: 'Collaboration tools for business.',
      iconType: 'google',
      category: 'productivity',
      connected: false
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Video communications and meeting platform.',
      iconType: 'zoom',
      category: 'productivity',
      connected: false
    },
    {
      id: 'jira',
      name: 'Jira Software',
      description: 'Issue tracking and project management.',
      iconType: 'jira',
      category: 'devops',
      connected: false
    },
    {
      id: 'manual',
      name: 'Manual Uploads',
      description: 'Upload CSV/JSON identity data.',
      iconType: 'upload',
      category: 'custom',
      connected: false
    }
  ]);

  notificationTargets = signal<IntegrationCard[]>([
    {
      id: 'slack',
      name: 'Slack',
      description: 'Channel-based messaging platform.',
      iconType: 'slack',
      category: 'notification',
      connected: true
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Workspace for real-time collaboration.',
      iconType: 'teams',
      category: 'notification',
      connected: false
    },
    {
      id: 'email',
      name: 'Email Alerts',
      description: 'Standard SMTP email notifications.',
      iconType: 'email',
      category: 'notification',
      connected: false
    }
  ]);

  filteredProviders = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'all') return this.providers();
    return this.providers().filter(p => p.category === filter);
  });

  toggleConnection(id: string) {
    const list = this.providers().find(p => p.id === id) 
       ? this.providers 
       : this.notificationTargets;

    // Simulate Network Request
    list.update(items => items.map(p => {
       if (p.id === id) return { ...p, isLoading: true };
       return p;
    }));

    setTimeout(() => {
       list.update(items => items.map(p => {
          if (p.id === id) return { ...p, isLoading: false, connected: !p.connected };
          return p;
       }));
    }, 1200);
  }
}
