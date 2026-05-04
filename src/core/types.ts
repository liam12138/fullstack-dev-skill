export type ProjectType = 'web' | 'mobile' | 'backend' | 'desktop' | 'cli' | 'library';
export type ArchitectureType = 'monolithic' | 'frontend-backend-separated' | 'microservices';
export type Platform = 'trae' | 'claude-code';
<<<<<<< HEAD
=======
export type Stage = 'init' | 'requirements' | 'tech-spec' | 'code-gen' | 'delivery';
>>>>>>> d812423 (Initial commit)

export interface ProjectConfig {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  architectureType: ArchitectureType;
  directory: string;
  createdAt: string;
  updatedAt: string;
  techStack: TechStackSelection;
  metadata: ProjectMetadata;
}

export interface ProjectMetadata {
  author?: string;
  license?: string;
  repository?: string;
  version?: string;
  tags?: string[];
}

export interface TechStackSelection {
  frontend?: FrontendStack;
  backend?: BackendStack;
  database?: DatabaseStack;
  cache?: CacheStack;
  messageQueue?: MessageQueueStack;
  deployment?: DeploymentStack;
}

export interface FrontendStack {
  framework: 'react' | 'vue' | 'angular' | 'svelte' | 'nextjs' | 'nuxtjs';
  language: 'typescript' | 'javascript';
  buildTool: 'vite' | 'webpack' | 'esbuild' | 'rollup';
  uiLibrary?: 'tailwindcss' | 'antd' | 'material-ui' | 'chakra-ui' | 'none';
  stateManagement?: 'zustand' | 'redux' | 'pinia' | 'vuex' | 'none';
  ssr?: boolean;
}

export interface BackendStack {
  framework: 'express' | 'nestjs' | 'fastapi' | 'springboot' | 'django' | 'flask' | 'go-gin';
  language: 'typescript' | 'javascript' | 'python' | 'java' | 'go';
  orm?: 'prisma' | 'typeorm' | 'sequelize' | 'mybatis' | 'jpa' | 'sqlalchemy' | 'gorm';
  authentication?: 'jwt' | 'oauth2' | 'session' | 'none';
}

export interface DatabaseStack {
  primary: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'oracle' | 'sqlserver';
  secondary?: 'redis' | 'elasticsearch' | 'mongodb';
}

export interface CacheStack {
  type: 'redis' | 'memcached' | 'none';
  useCase?: string[];
}

export interface MessageQueueStack {
  type: 'rabbitmq' | 'kafka' | 'redis-pubsub' | 'none';
  useCase?: string[];
}

export interface DeploymentStack {
  containerization?: 'docker' | 'none';
  orchestration?: 'kubernetes' | 'docker-compose' | 'none';
  ci?: 'github-actions' | 'gitlab-ci' | 'jenkins' | 'none';
  cloud?: 'aws' | 'azure' | 'gcp' | 'aliyun' | 'tencent-cloud' | 'none';
}

export interface MultiAppConfig {
  apps: AppConfig[];
  globalConfig: GlobalConfig;
  communication: CommunicationConfig[];
}

export interface AppConfig {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'service' | 'worker' | 'gateway';
  description: string;
  techStack: TechStackSelection;
  dependencies: string[];
  port?: number;
  environment: Record<string, string>;
}

export interface GlobalConfig {
  projectName: string;
  sharedLibraries: string[];
  infrastructure: InfrastructureConfig;
}

export interface InfrastructureConfig {
  serviceDiscovery?: 'consul' | 'nacos' | 'eureka' | 'none';
  configCenter?: 'apollo' | 'nacos' | 'consul' | 'none';
  apiGateway?: 'kong' | 'nginx' | 'spring-cloud-gateway' | 'none';
  tracing?: 'jaeger' | 'zipkin' | 'skywalking' | 'none';
  monitoring?: 'prometheus' | 'grafana' | 'none';
}

export interface CommunicationConfig {
  from: string;
  to: string;
  protocol: 'rest' | 'graphql' | 'grpc' | 'websocket' | 'message-queue';
  description?: string;
}

export interface ConfirmationState {
<<<<<<< HEAD
  stage: string;
=======
  stage: Stage;
>>>>>>> d812423 (Initial commit)
  step: string;
  confirmed: boolean;
  confirmedAt?: string;
  data: Record<string, unknown>;
}

export interface SessionState {
  sessionId: string;
  projectId: string;
<<<<<<< HEAD
  currentStage: string;
=======
  currentStage: Stage;
>>>>>>> d812423 (Initial commit)
  currentStep: string;
  confirmationHistory: ConfirmationState[];
  collectedData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
