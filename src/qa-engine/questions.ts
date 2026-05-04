import { QuestionFlow, QuestionGroup, Question } from './types';

export const projectInitQuestions: Question[] = [
  {
    id: 'project-name',
    type: 'text',
    title: '项目名称',
    description: '请输入项目名称，将用于生成项目目录和配置文件',
    placeholder: 'my-awesome-project',
    validation: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: '^[a-z][a-z0-9-]*$',
      errorMessage: '项目名称必须以小写字母开头，只能包含小写字母、数字和连字符',
    },
    helpText: '示例: my-ecommerce-app, blog-system, user-service',
    category: 'basic',
    priority: 1,
  },
  {
    id: 'project-description',
    type: 'text',
    title: '项目描述',
    description: '简要描述项目的用途和目标',
    placeholder: '一个用于...的系统',
    validation: {
      required: false,
      maxLength: 200,
    },
    category: 'basic',
    priority: 2,
  },
  {
    id: 'project-type',
    type: 'single-choice',
    title: '项目类型',
    description: '选择您要创建的项目类型',
    options: [
      { value: 'web', label: 'Web 应用', description: '浏览器端 Web 应用程序', icon: '🌐' },
      { value: 'mobile', label: '移动应用', description: 'iOS/Android 移动应用程序', icon: '📱' },
      { value: 'backend', label: '后端服务', description: 'API 服务或后端系统', icon: '⚙️' },
      { value: 'desktop', label: '桌面应用', description: '桌面端应用程序', icon: '🖥️' },
      { value: 'cli', label: '命令行工具', description: 'CLI 命令行工具', icon: '⌨️' },
      { value: 'library', label: '类库/SDK', description: '可复用的代码库或 SDK', icon: '📦' },
    ],
    validation: { required: true },
    category: 'basic',
    priority: 3,
  },
  {
    id: 'architecture-type',
    type: 'single-choice',
    title: '架构类型',
    description: '选择项目的架构模式',
    options: [
      { 
        value: 'monolithic', 
        label: '单体应用', 
        description: '所有功能在一个应用中实现，适合小型项目或快速原型' 
      },
      { 
        value: 'frontend-backend-separated', 
        label: '前后端分离', 
        description: '前端和后端独立部署，适合中型项目和团队协作' 
      },
      { 
        value: 'microservices', 
        label: '微服务架构', 
        description: '多个独立服务组成，适合大型项目和高扩展性需求' 
      },
    ],
    validation: { required: true },
    condition: {
      field: 'project-type',
      operator: 'includes',
      value: ['web', 'backend'],
    },
    category: 'architecture',
    priority: 4,
  },
  {
    id: 'team-size',
    type: 'single-choice',
    title: '团队规模',
    description: '预计参与开发的团队人数',
    options: [
      { value: 'solo', label: '个人开发', description: '1 人' },
      { value: 'small', label: '小团队', description: '2-5 人' },
      { value: 'medium', label: '中型团队', description: '6-20 人' },
      { value: 'large', label: '大型团队', description: '20 人以上' },
    ],
    validation: { required: true },
    category: 'team',
    priority: 5,
  },
  {
    id: 'tech-familiarity',
    type: 'multiple-choice',
    title: '团队技术熟悉度',
    description: '选择团队熟悉的技术（可多选）',
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'angular', label: 'Angular' },
      { value: 'nodejs', label: 'Node.js' },
      { value: 'python', label: 'Python' },
      { value: 'java', label: 'Java' },
      { value: 'go', label: 'Go' },
      { value: 'typescript', label: 'TypeScript' },
    ],
    validation: { required: false },
    category: 'team',
    priority: 6,
  },
];

export const requirementsQuestions: Question[] = [
  {
    id: 'target-users',
    type: 'rich-text',
    title: '目标用户群体',
    description: '描述项目的目标用户是谁，他们的特点是什么',
    placeholder: '例如：面向中小企业的电商卖家，年龄在25-45岁之间...',
    validation: { required: true, minLength: 20 },
    category: 'overview',
    priority: 1,
  },
  {
    id: 'core-features',
    type: 'rich-text',
    title: '核心功能',
    description: '列出项目的核心功能模块',
    placeholder: '例如：\n1. 用户注册登录\n2. 商品管理\n3. 订单管理\n4. 支付功能',
    validation: { required: true, minLength: 30 },
    category: 'functional',
    priority: 2,
  },
  {
    id: 'user-roles',
    type: 'rich-text',
    title: '用户角色',
    description: '描述系统中的用户角色及其权限',
    placeholder: '例如：\n- 管理员：拥有所有权限\n- 普通用户：只能查看和编辑自己的数据',
    validation: { required: false },
    category: 'functional',
    priority: 3,
  },
  {
    id: 'expected-users',
    type: 'number',
    title: '预期用户量',
    description: '预计的日活用户数量',
    placeholder: '10000',
    validation: { required: true, min: 1 },
    category: 'non-functional',
    priority: 4,
  },
  {
    id: 'performance-requirements',
    type: 'rich-text',
    title: '性能要求',
    description: '描述对系统性能的要求',
    placeholder: '例如：页面加载时间 < 2秒，接口响应时间 < 500ms',
    validation: { required: false },
    category: 'non-functional',
    priority: 5,
  },
  {
    id: 'security-requirements',
    type: 'multiple-choice',
    title: '安全要求',
    description: '选择需要的安全特性',
    options: [
      { value: 'authentication', label: '用户认证' },
      { value: 'authorization', label: '权限控制' },
      { value: 'encryption', label: '数据加密' },
      { value: 'audit-log', label: '审计日志' },
      { value: 'rate-limit', label: '访问限流' },
      { value: 'https', label: 'HTTPS' },
    ],
    validation: { required: false },
    category: 'non-functional',
    priority: 6,
  },
  {
    id: 'budget-constraint',
    type: 'single-choice',
    title: '预算限制',
    description: '项目的预算范围',
    options: [
      { value: 'low', label: '低预算', description: '优先选择免费/开源方案' },
      { value: 'medium', label: '中等预算', description: '可接受适度的付费服务' },
      { value: 'high', label: '充足预算', description: '可选择最佳方案，不受成本限制' },
    ],
    validation: { required: false },
    category: 'constraints',
    priority: 7,
  },
  {
    id: 'timeline',
    type: 'single-choice',
    title: '开发周期',
    description: '预期的项目开发周期',
    options: [
      { value: '1-week', label: '1 周内' },
      { value: '1-month', label: '1 个月内' },
      { value: '3-months', label: '3 个月内' },
      { value: '6-months', label: '6 个月内' },
      { value: 'long-term', label: '长期项目' },
    ],
    validation: { required: false },
    category: 'constraints',
    priority: 8,
  },
];

export const projectInitFlow: QuestionFlow = {
  id: 'project-init',
  name: '项目初始化',
  description: '收集项目基本信息，完成项目初始化配置',
  groups: [
    {
      id: 'basic-info',
      title: '基本信息',
      description: '项目的基本配置信息',
      questions: projectInitQuestions.filter(q => q.category === 'basic'),
    },
    {
      id: 'architecture',
      title: '架构设计',
      description: '项目的架构选择',
      questions: projectInitQuestions.filter(q => q.category === 'architecture'),
    },
    {
      id: 'team-info',
      title: '团队信息',
      description: '团队规模和技术背景',
      questions: projectInitQuestions.filter(q => q.category === 'team'),
    },
  ],
  order: ['basic-info', 'architecture', 'team-info'],
};

export const requirementsFlow: QuestionFlow = {
  id: 'requirements',
  name: '需求收集',
  description: '收集项目的功能需求和非功能需求',
  groups: [
    {
      id: 'overview',
      title: '项目概述',
      description: '项目的基本背景和目标',
      questions: requirementsQuestions.filter(q => q.category === 'overview'),
    },
    {
      id: 'functional',
      title: '功能需求',
      description: '系统的功能模块和用户角色',
      questions: requirementsQuestions.filter(q => q.category === 'functional'),
    },
    {
      id: 'non-functional',
      title: '非功能需求',
      description: '性能、安全等非功能性需求',
      questions: requirementsQuestions.filter(q => q.category === 'non-functional'),
    },
    {
      id: 'constraints',
      title: '约束条件',
      description: '预算、时间等约束条件',
      questions: requirementsQuestions.filter(q => q.category === 'constraints'),
    },
  ],
  order: ['overview', 'functional', 'non-functional', 'constraints'],
};

export function getQuestionFlows(): QuestionFlow[] {
  return [projectInitFlow, requirementsFlow];
}
