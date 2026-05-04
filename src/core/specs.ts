import { TechStackSelection, ArchitectureType } from './types';

export interface RequirementSpec {
  id: string;
  projectId: string;
  overview: ProjectOverview;
  functionalRequirements: FunctionalRequirement[];
  nonFunctionalRequirements: NonFunctionalRequirement[];
  userRoles: UserRole[];
  dataEntities: DataEntity[];
  constraints: Constraint[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectOverview {
  name: string;
  description: string;
  goals: string[];
  targetUsers: string[];
  businessContext?: string;
  successCriteria?: string[];
}

export interface FunctionalRequirement {
  id: string;
  category: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  userStories: UserStory[];
  acceptanceCriteria: string[];
  dependencies?: string[];
}

export interface UserStory {
  id: string;
  asA: string;
  iWantTo: string;
  soThat: string;
  notes?: string;
}

export interface NonFunctionalRequirement {
  id: string;
  category: 'performance' | 'security' | 'scalability' | 'availability' | 'usability' | 'maintainability';
  name: string;
  description: string;
  metrics?: RequirementMetric[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface RequirementMetric {
  name: string;
  target: string;
  unit: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  responsibilities: string[];
}

export interface DataEntity {
  id: string;
  name: string;
  description: string;
  fields: DataField[];
  relationships?: DataRelationship[];
}

export interface DataField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  constraints?: string[];
}

export interface DataRelationship {
  targetEntity: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  description?: string;
}

export interface Constraint {
  id: string;
  type: 'technical' | 'business' | 'resource' | 'time' | 'compliance';
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface TechSolution {
  id: string;
  projectId: string;
  architectureType: ArchitectureType;
  overview: TechSolutionOverview;
  techStack: TechStackSelection;
  modules: ModuleDesign[];
  apiDesign: ApiDesign[];
  dataDesign: DataDesign;
  deploymentDesign: DeploymentDesign;
  risks: RiskAssessment[];
  alternatives: AlternativeSolution[];
  confirmed: boolean;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TechSolutionOverview {
  summary: string;
  keyDecisions: KeyDecision[];
  assumptions: string[];
}

export interface KeyDecision {
  decision: string;
  reason: string;
  alternatives: string[];
  tradeoffs: string[];
}

export interface ModuleDesign {
  id: string;
  name: string;
  description: string;
  responsibilities: string[];
  dependencies: string[];
  interfaces: ModuleInterface[];
}

export interface ModuleInterface {
  name: string;
  type: 'function' | 'class' | 'api';
  description: string;
  input?: string;
  output?: string;
}

export interface ApiDesign {
  id: string;
  name: string;
  type: 'rest' | 'graphql' | 'grpc' | 'websocket';
  baseUrl: string;
  endpoints: ApiEndpoint[];
  authentication?: string;
  rateLimit?: string;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  request?: ApiSchema;
  response?: ApiSchema;
}

export interface ApiSchema {
  contentType: string;
  fields: SchemaField[];
}

export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface DataDesign {
  databaseType: string;
  schemas: DatabaseSchema[];
  indexing: IndexDesign[];
  caching: CacheDesign[];
}

export interface DatabaseSchema {
  name: string;
  tables: TableDesign[];
}

export interface TableDesign {
  name: string;
  columns: ColumnDesign[];
  primaryKey: string[];
  indexes: string[];
}

export interface ColumnDesign {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  description?: string;
}

export interface IndexDesign {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'fulltext';
  purpose: string;
}

export interface CacheDesign {
  entity: string;
  strategy: 'cache-aside' | 'write-through' | 'write-behind';
  ttl?: number;
  invalidation: string;
}

export interface DeploymentDesign {
  environment: DeploymentEnvironment[];
  ciCd: CiCdDesign;
  monitoring: MonitoringDesign;
  scaling: ScalingDesign;
}

export interface DeploymentEnvironment {
  name: 'development' | 'staging' | 'production';
  infrastructure: string;
  resources: ResourceConfig;
  variables: Record<string, string>;
}

export interface ResourceConfig {
  cpu: string;
  memory: string;
  storage?: string;
  replicas?: number;
}

export interface CiCdDesign {
  platform: string;
  stages: CiCdStage[];
  triggers: string[];
}

export interface CiCdStage {
  name: string;
  steps: string[];
}

export interface MonitoringDesign {
  logging: string[];
  metrics: string[];
  alerts: AlertConfig[];
}

export interface AlertConfig {
  name: string;
  condition: string;
  severity: 'critical' | 'warning' | 'info';
  channels: string[];
}

export interface ScalingDesign {
  type: 'horizontal' | 'vertical' | 'none';
  triggers: ScalingTrigger[];
  limits: ScalingLimit;
}

export interface ScalingTrigger {
  metric: string;
  threshold: number;
  action: 'scale-up' | 'scale-down';
}

export interface ScalingLimit {
  minReplicas: number;
  maxReplicas: number;
}

export interface RiskAssessment {
  id: string;
  category: 'technical' | 'operational' | 'security' | 'performance';
  description: string;
  probability: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

export interface AlternativeSolution {
  id: string;
  name: string;
  description: string;
  techStack: TechStackSelection;
  pros: string[];
  cons: string[];
  suitable: boolean;
  reason?: string;
}

export interface TechRecommendation {
  id: string;
  category: string;
  recommended: TechStackSelection;
  alternatives: AlternativeSolution[];
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
}
