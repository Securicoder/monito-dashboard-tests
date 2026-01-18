import { Injectable, signal } from '@angular/core';

// --- TYPES ---
export type PlatformType = 'Microsoft 365' | 'Salesforce' | 'Google Workspace' | 'Slack' | 'AWS' | 'Azure' | 'Entra ID' | 'SharePoint' | 'Exchange';

export interface GraphNode {
  id: string;
  label: string; 
  type: string; // Simplified for UI
  subType?: string; // Detailed type from nodeName
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number; 
  platform: PlatformType;
  blastRadius: number; 
  description?: string;
  category?: string; 
  members?: string[];
  layer: number; // 0=Identity/Creds, 1=Groups/Sets, 2=Entitlements/Actions, 3=Resources
  additional_details?: any;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  isDirect: boolean;
  label?: string; 
  critical?: boolean;
  dashed?: boolean;
}

// ... (Keep existing interfaces for compatibility)
export interface AccessProfile { identity: any; accessGraph: any; blastRadius: any; graphData: { nodes: any[]; links: any[]; }; }
export interface ResourceProfile { resource: any; hierarchy: any[]; accessStats: any; accessList: any[]; }
export interface ThreatScenario { id: string; name: string; description: string; entryPoint: string; exposure: any; mitigations: string[]; graphData: { nodes: GraphNode[]; links: GraphLink[]; } }
export interface ComplianceScore { framework: string; score: number; total: number; description: string; }
export interface Misconfiguration { id: string; title: string; platform: string; tenant: string; severity: string; category: string; status: string; description: string; impact: string; remediation: string[]; tactics?: string[]; compliance?: string[]; }
export interface Policy { id: string; name: string; apps: string[]; incidents: number; incidentTrend: number; category: string; compliance: string[]; owner: string; status: string; severity: string; }

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private nodes: GraphNode[] = [];
  private links: GraphLink[] = [];

  // --- MERGED DATASET (Salesforce + SharePoint + Entra + Google) ---
  private rawGraphData = {
    nodes: [
      // --- SALESFORCE RESOURCES ---
      { data: { id: "5ff55329-3be9-43f5-b1dd-9655bb9afe1b", nodeName: "Resource:Organization", displayName: "SecuriGeek CRM (Prod)", additional_details: { platform: "salesforce" } } },
      { data: { id: "7b4806e3-7488-4eb9-b39a-2f20dd125aaf", nodeName: "Resource:RoleHierarchyLevel", displayName: "Sales Management", additional_details: { platform: "salesforce" } } },
      { data: { id: "2402db53-af6c-4194-a995-b964fdb5f89f", nodeName: "Resource:Account", displayName: "Account 1", additional_details: { platform: "salesforce" } } },
      { data: { id: "5bd47f3e-1e81-4c26-94f6-ff8ab03f52a3", nodeName: "Resource:Opportunity", displayName: "Opportunity 1", additional_details: { platform: "salesforce" } } },
      
      // --- SALESFORCE IDENTITIES ---
      { data: { id: "349b1636-03a1-4f84-a1ea-c7a907139bc1", nodeName: "Identity:User", displayName: "Aaron Lyons", additional_details: { platform: "salesforce", userType: "Standard" } } },
      { data: { id: "468f35d6-0e6f-4eb1-8d14-2259c76cacc0", nodeName: "Identity:IntegrationUser", displayName: "Integration API User 1", additional_details: { platform: "salesforce", userType: "Integration" } } },
      
      // --- SALESFORCE GROUPS/ROLES ---
      { data: { id: "dd07d355-a14b-4e62-a013-0b312c7a5439", nodeName: "IdentitySet:Role", displayName: "VP Sales", additional_details: { platform: "salesforce" } } },
      { data: { id: "cdd65012-7738-4ac7-b57a-e355e334dcf4", nodeName: "IdentitySet:PublicGroup", displayName: "All Sales", additional_details: { platform: "salesforce" } } },
      
      // --- SALESFORCE ENTITLEMENTS ---
      { data: { id: "32182ec4-6f64-4c95-8b5b-8af8fa9e5b7e", nodeName: "Entitlement:Profile", displayName: "System Administrator", additional_details: { platform: "salesforce" } } },
      { data: { id: "7b318fa1-a5d8-41e3-aad6-5a62fafb57a4", nodeName: "Entitlement:PermissionSet", displayName: "PS - Sales Ops", additional_details: { platform: "salesforce" } } },
      { data: { id: "b7a16a8d-5308-4434-99f0-040a899a2467", nodeName: "Entitlement:ObjectPermission", displayName: "Account CRUD", additional_details: { platform: "salesforce" } } },

      // --- SHAREPOINT RESOURCES ---
      { data: { id: "3aed3ca4-b9f7-4da8-94ae-b9245d761137", nodeName: "Resource:SharePointTenant", displayName: "SharePoint Tenant (prod)", additional_details: { platform: "sharepoint" } } },
      { data: { id: "7ac24e45-52b0-496e-b83a-a6465a409398", nodeName: "Resource:SharePointSiteCollection", displayName: "External projects and Collab", additional_details: { platform: "sharepoint" } } },
      { data: { id: "7ac24e45-52b0-496e-b83a-a6465a409398:/sites/ExternalpojectsandCollab/Shared Documents", nodeName: "Resource:SharePointLibrary", displayName: "Documents", additional_details: { platform: "sharepoint" } } },
      
      // --- SHAREPOINT GROUPS ---
      { data: { id: "3397d0a8-fcd8-46ae-8c6e-2c62d65a2766:sp_group_members:La Redoute Members", nodeName: "IdentitySet:SharePointSiteGroup", displayName: "External projects Owners", additional_details: { platform: "sharepoint" } } },
      
      // --- SHAREPOINT ENTITLEMENTS ---
      { data: { id: "92dd429d-8d93-4800-9043-7a0a3d8ca600", nodeName: "Entitlement:SharePointRole", displayName: "Full Control", additional_details: { platform: "sharepoint" } } },

      // --- ENTRA ID / AZURE IDENTITIES ---
      { data: { id: "91b129ec-9937-43f9-9f72-76a009f1301c", nodeName: "Identity:User", displayName: "Tarun", additional_details: { platform: "entra" } } },
      { data: { id: "06fcd990-a07f-42c4-9e14-0fb0f98b6241", nodeName: "Identity:ServicePrincipal", displayName: "Activepieces", additional_details: { platform: "entra" } } },
      { data: { id: "mi-sys:b0b4a322", nodeName: "Identity:ManagedIdentitySystem", displayName: "aks-nodepool-mi", additional_details: { platform: "azure" } } },
      { data: { id: "agent:bc9a9b7a", nodeName: "Identity:AgentIdentity", displayName: "azure-devops-agent", additional_details: { platform: "azure" } } },

      // --- ENTRA ID GROUPS ---
      { data: { id: "c5131850-eacd-4a96-9b49-0b6ba58c123e", nodeName: "IdentitySet:DynamicGroup", displayName: "All autopilot Devices", additional_details: { platform: "entra" } } },
      { data: { id: "acb2a3dc-d085-4465-8094-bbe63cbd39c0", nodeName: "IdentitySet:M365Group", displayName: "Digital Initiative PR", additional_details: { platform: "entra" } } },

      // --- ENTRA ID ENTITLEMENTS ---
      { data: { id: "62e90394-69f5-4237-9190-012177145e10", nodeName: "Entitlement:DirectoryRoleBuiltIn", displayName: "Global Administrator", additional_details: { platform: "entra" } } },
      { data: { id: "appperm:Directory.Read.All", nodeName: "Entitlement:AppPermission", displayName: "Directory.Read.All", additional_details: { platform: "microsoft_graph" } } },

      // --- GOOGLE WORKSPACE ---
      { data: { id: "e776fe7f-a748-46d4-a4f3-ad5e6f6c2329", nodeName: "Resource:Customer", displayName: "SecuriGeek Workspace (prod)", additional_details: { platform: "google_workspace" } } },
      { data: { id: "9d36ded8-96b2-4f9b-8319-b27fbd048aa8", nodeName: "Resource:Domain", displayName: "securigeek.cloud", additional_details: { platform: "google_workspace" } } },
      { data: { id: "5dad18f1-d72d-4ea1-ba49-122e4939174b", nodeName: "Resource:OrganizationalUnit", displayName: "OU /Engineering", additional_details: { platform: "google_workspace" } } },
      { data: { id: "74406f79-c9c3-4794-acfc-b5b42cd87957", nodeName: "Identity:AdminUser", displayName: "Rahul Thomas (Admin)", additional_details: { platform: "google_workspace" } } },
      { data: { id: "3b69a019-ad95-4bee-a3fa-9428be4e9dbb", nodeName: "Resource:SharedDrive", displayName: "Engineering Shared Drive", additional_details: { platform: "google_workspace" } } },
      
      // --- DATA OBJECTS (Credentials/Keys) ---
      { data: { id: "spcred:c61d6c71", nodeName: "DataObject:ServicePrincipalCredential", displayName: "Activepieces Secret", additional_details: { platform: "entra" } } },
      { data: { id: "fedcred:519525e1", nodeName: "DataObject:FederatedCredential", displayName: "DevOps -> Cydenti", additional_details: { platform: "entra" } } },
      { data: { id: "bc65dab7-fff1-4871-8df7-1fc00cb22789", nodeName: "DataObject:APIKey", displayName: "Drive API Key", additional_details: { platform: "google_workspace" } } },
      
      // --- ACTIONS ---
      { data: { id: "diraction:d44058a6", nodeName: "Action:DirectoryAction", displayName: "ResetUserPassword", additional_details: { platform: "entra" } } }
    ],
    edges: [
      // --- Salesforce Edges ---
      { data: { source: "349b1636-03a1-4f84-a1ea-c7a907139bc1", target: "dd07d355-a14b-4e62-a013-0b312c7a5439", label: "InRole" } }, // User -> Role
      { data: { source: "dd07d355-a14b-4e62-a013-0b312c7a5439", target: "7b4806e3-7488-4eb9-b39a-2f20dd125aaf", label: "MapsToHierarchy" } }, // Role -> Hierarchy
      { data: { source: "349b1636-03a1-4f84-a1ea-c7a907139bc1", target: "32182ec4-6f64-4c95-8b5b-8af8fa9e5b7e", label: "AssignedProfile" } }, // User -> Profile
      { data: { source: "32182ec4-6f64-4c95-8b5b-8af8fa9e5b7e", target: "b7a16a8d-5308-4434-99f0-040a899a2467", label: "DefinesObjectPermission" } }, // Profile -> Permission
      { data: { source: "b7a16a8d-5308-4434-99f0-040a899a2467", target: "2402db53-af6c-4194-a995-b964fdb5f89f", label: "AppliesToObject" } }, // Permission -> Object (Account)

      // --- SharePoint Edges ---
      { data: { source: "91b129ec-9937-43f9-9f72-76a009f1301c", target: "3397d0a8-fcd8-46ae-8c6e-2c62d65a2766:sp_group_members:La Redoute Members", label: "MemberOf" } },
      { data: { source: "3397d0a8-fcd8-46ae-8c6e-2c62d65a2766:sp_group_members:La Redoute Members", target: "92dd429d-8d93-4800-9043-7a0a3d8ca600", label: "HasRole" } }, // Group -> Role
      { data: { source: "92dd429d-8d93-4800-9043-7a0a3d8ca600", target: "7ac24e45-52b0-496e-b83a-a6465a409398", label: "CanBeAssignedOn" } }, // Role -> Site
      { data: { source: "3aed3ca4-b9f7-4da8-94ae-b9245d761137", target: "7ac24e45-52b0-496e-b83a-a6465a409398", label: "ContainsSite" } },
      { data: { source: "7ac24e45-52b0-496e-b83a-a6465a409398", target: "7ac24e45-52b0-496e-b83a-a6465a409398:/sites/ExternalpojectsandCollab/Shared Documents", label: "ContainsLibrary" } },

      // --- Entra ID / Cross-Cloud Edges ---
      { data: { source: "06fcd990-a07f-42c4-9e14-0fb0f98b6241", target: "spcred:c61d6c71", label: "HasCredential" } },
      { data: { source: "agent:bc9a9b7a", target: "fedcred:519525e1", label: "UsesFederatedCredential" } },
      { data: { source: "91b129ec-9937-43f9-9f72-76a009f1301c", target: "62e90394-69f5-4237-9190-012177145e10", label: "AssignedRole" } },
      { data: { source: "62e90394-69f5-4237-9190-012177145e10", target: "diraction:d44058a6", label: "ImpliesDirectoryAction" } }, // Global Admin -> ResetPassword
      { data: { source: "mi-sys:b0b4a322", target: "appperm:Directory.Read.All", label: "AssignedPermission" } },

      // --- Google Workspace Edges ---
      { data: { source: "74406f79-c9c3-4794-acfc-b5b42cd87957", target: "e776fe7f-a748-46d4-a4f3-ad5e6f6c2329", label: "OwnsCustomer" } },
      { data: { source: "e776fe7f-a748-46d4-a4f3-ad5e6f6c2329", target: "9d36ded8-96b2-4f9b-8319-b27fbd048aa8", label: "OwnsDomain" } },
      { data: { source: "9d36ded8-96b2-4f9b-8319-b27fbd048aa8", target: "3b69a019-ad95-4bee-a3fa-9428be4e9dbb", label: "HostsSharedDrive" } },
      { data: { source: "91572aff-2b2c-48fa-a166-f699a7a7b9a5", target: "bc65dab7-fff1-4871-8df7-1fc00cb22789", label: "HasAPIKey" } }
    ]
  };

  constructor() {
    this.processGraphData();
  }

  // --- 1. DATA LOADING & PARSING ---
  private processGraphData() {
    this.nodes = this.rawGraphData.nodes.map(n => this.mapNode(n.data));
    
    // Create a set of valid node IDs for O(1) lookup
    const validNodeIds = new Set(this.nodes.map(n => n.id));

    // Filter edges to ensure source and target exist
    this.links = this.rawGraphData.edges
      .map(e => this.mapEdge(e.data))
      .filter(l => validNodeIds.has(l.source) && validNodeIds.has(l.target));
  }

  private mapNode(data: any): GraphNode {
    // Intelligent Layering based on Node Type Ontology
    // Layer 0: Identity (Source of Action) / Credential
    // Layer 1: Group / Role / Set (Organization of Identities)
    // Layer 2: Entitlement / Action (What links Identity to Resource)
    // Layer 3: Resource (The Target)
    
    let type = 'resource';
    let layer = 3;
    let riskLevel: any = 'low';
    let riskScore = 10;
    
    const lowerName = (data.nodeName || '').toLowerCase();

    // --- MAPPING LOGIC ---
    if (lowerName.includes('identity')) {
      if (lowerName.includes('identityset') || lowerName.includes('group') || lowerName.includes('unit')) {
        type = 'group';
        layer = 1; // Grouping Layer
      } else {
        type = 'identity';
        layer = 0; // Source Layer
        if (lowerName.includes('serviceprincipal') || lowerName.includes('managed') || lowerName.includes('agent')) {
           riskLevel = 'high';
           riskScore = 75;
        }
      }
    } else if (lowerName.includes('entitlement') || lowerName.includes('role') || lowerName.includes('permission') || lowerName.includes('scope')) {
      type = 'entitlement';
      layer = 2; // Permission Layer
      riskLevel = 'medium';
      riskScore = 50;
    } else if (lowerName.includes('action')) {
      type = 'action';
      layer = 2; // Action Layer (same as entitlement usually)
    } else if (lowerName.includes('dataobject')) {
      // Credentials go to left, data artifacts go to right
      if (lowerName.includes('credential') || lowerName.includes('secret') || lowerName.includes('key') || lowerName.includes('token') || lowerName.includes('certificate')) {
         type = 'credential';
         layer = 0; 
         riskLevel = 'critical';
         riskScore = 90;
      } else {
         type = 'data-object';
         layer = 3;
      }
    } else if (lowerName.includes('resource')) {
       type = 'resource';
       layer = 3;
    }

    // Specific overrides based on labels
    if (data.displayName?.toLowerCase().includes('admin')) { riskLevel = 'critical'; riskScore = 95; }
    if (data.displayName?.includes('Full Control')) { riskLevel = 'critical'; riskScore = 95; }

    // Platform Detection
    let platform: PlatformType = 'Microsoft 365';
    const dPlatform = data.additional_details?.platform;
    if (dPlatform) {
      if (dPlatform.includes('salesforce')) platform = 'Salesforce';
      else if (dPlatform.includes('google')) platform = 'Google Workspace';
      else if (dPlatform.includes('azure') || dPlatform.includes('entra')) platform = 'Azure';
      else if (dPlatform.includes('aws')) platform = 'AWS';
      else if (dPlatform.includes('sharepoint')) platform = 'SharePoint';
      else if (dPlatform.includes('slack')) platform = 'Slack';
    }

    return {
      id: data.id,
      label: data.displayName || data.nodeName,
      type: type as any,
      subType: data.nodeName.split(':')[1] || 'Generic',
      riskLevel,
      riskScore,
      platform,
      blastRadius: Math.floor(Math.random() * 50), // Mock calc
      category: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ''),
      additional_details: data.additional_details,
      layer: layer
    };
  }

  private mapEdge(data: any): GraphLink {
    return {
      source: data.source,
      target: data.target,
      type: this.normalizeRelationshipLabel(data.label),
      label: this.normalizeRelationshipLabel(data.label),
      isDirect: true,
      critical: ['HasCredential', 'AssignedDirectoryRole', 'GrantsAppAccess', 'Full Control'].includes(data.label)
    };
  }

  private normalizeRelationshipLabel(rawLabel: string): any {
    // Keep labels readable but standard where possible
    const map: Record<string, string> = {
      'MemberOf': 'MemberOf',
      'InGroup': 'MemberOf',
      'AssignedDirectoryRole': 'HasRole',
      'AssignedAppRole': 'HasRole',
      'HasEntitlement': 'HasPermission',
      'PublishedInTenant': 'InTenant',
    };
    return map[rawLabel] || rawLabel; 
  }

  // --- ACCESSORS ---
  
  getNodes(mode: 'full' | 'nhi' = 'full'): GraphNode[] {
    if (mode === 'nhi') {
       return this.getNHIPresetNodes();
    }
    return this.nodes;
  }

  getLinks(mode: 'full' | 'nhi' = 'full'): GraphLink[] {
    if (mode === 'nhi') {
      const nhiNodeIds = new Set(this.getNHIPresetNodes().map(n => n.id));
      return this.links.filter(l => nhiNodeIds.has(l.source) && nhiNodeIds.has(l.target));
    }
    return this.links;
  }

  private getNHIPresetNodes(): GraphNode[] {
    // Filter to show only Service Principals, Agents, and their immediate connections
    const nhiRoots = this.nodes.filter(n => 
      n.type === 'credential' ||
      n.subType?.toLowerCase().includes('serviceprincipal') || 
      n.subType?.toLowerCase().includes('managedidentity') || 
      n.subType?.toLowerCase().includes('agent')
    );

    const relevantIds = new Set(nhiRoots.map(n => n.id));

    // Traverse 1 hop out
    this.links.forEach(l => {
      if (relevantIds.has(l.source)) relevantIds.add(l.target);
    });

    return this.nodes.filter(n => relevantIds.has(n.id));
  }

  // --- COMPATIBILITY STUBS ---
  getIdentityProfile(id: string): AccessProfile {
     const node = this.nodes.find(n => n.id === id) || this.nodes[0];
     return {
       identity: { id: node.id, name: node.label, email: 'demo@cydenti.com', type: node.subType || 'User', platform: node.platform, status: 'Active', licenseType: 'E5', mfaEnabled: true, lastLogin: 'Yesterday', riskFlags: [] },
       accessGraph: { directRoles: [], groups: [], adminPrivileges: [] },
       blastRadius: { score: node.riskScore, level: 'High', factors: { directResources: 5, groupResources: 10, roleResources: 50, isAdmin: true }, totalReachable: 65 },
       graphData: { nodes: [], links: [] }
     };
  }
  
  getResourceProfile(id: string): ResourceProfile { return {} as any; }
  getThreatScenario(id: string): ThreatScenario { return {} as any; }
  getAvailableIdentities() { return []; }
  getAvailableResources() { return []; }
  getAvailableThreats() { return []; }
  getComplianceScores(): ComplianceScore[] { return []; }
  getMisconfigurations(): Misconfiguration[] { return []; }
  getPolicies(): Policy[] { return []; }
}
