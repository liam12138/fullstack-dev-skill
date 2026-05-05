import type { Stage } from './types';


export * from './types';
export * from './specs';
export * from './templates';

export const SKILL_VERSION = '1.0.0';
export const SKILL_NAME = 'fullstack-dev';

export const STAGES = {
  INIT: 'init',
  REQUIREMENTS: 'requirements',
  TECH_SPEC: 'tech-spec',
  CODE_GEN: 'code-gen',
  DELIVERY: 'delivery',
} as const satisfies Record<string, Stage>;

export const STAGE_NAMES: Record<Stage, string> = {
  [STAGES.INIT]: '项目初始化',
  [STAGES.REQUIREMENTS]: '需求收集',
  [STAGES.TECH_SPEC]: '技术方案',
  [STAGES.CODE_GEN]: '代码生成',
  [STAGES.DELIVERY]: '项目交付',
};

export const ARCHITECTURE_TYPE_NAMES: Record<string, string> = {
  monolithic: '单体应用',
  'frontend-backend-separated': '前后端分离',
  microservices: '微服务架构',
};

export const PROJECT_TYPE_NAMES: Record<string, string> = {
  web: 'Web 应用',
  mobile: '移动应用',
  backend: '后端服务',
  desktop: '桌面应用',
  cli: '命令行工具',
  library: '类库/SDK',
};
