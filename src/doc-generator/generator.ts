import { RequirementSpec, TechSolution } from '../core/specs';
import { ProjectConfig, ArchitectureType } from '../core/types';

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'requirements' | 'tech-spec' | 'api-contract' | 'architecture';
  render: (data: unknown) => string;
}

export interface DocumentGenerationOptions {
  format: 'markdown' | 'html';
  includeTableOfContents: boolean;
  includeDiagrams: boolean;
  language: 'zh-CN' | 'en-US';
}

export class DocumentGenerator {
  private templates: Map<string, DocumentTemplate> = new Map();
  private defaultOptions: DocumentGenerationOptions = {
    format: 'markdown',
    includeTableOfContents: true,
    includeDiagrams: true,
    language: 'zh-CN',
  };

  registerTemplate(template: DocumentTemplate): void {
    this.templates.set(template.id, template);
  }

  generateRequirementsDocument(
    spec: RequirementSpec,
    options: Partial<DocumentGenerationOptions> = {}
  ): string {
    const opts = { ...this.defaultOptions, ...options };
    const sections: string[] = [];

    if (opts.includeTableOfContents) {
      sections.push(this.generateTableOfContents('requirements', spec));
    }

    sections.push(this.generateDocumentHeader('需求规格说明书', spec.overview.name));
    sections.push(this.generateProjectOverview(spec.overview));
    sections.push(this.generateFunctionalRequirements(spec.functionalRequirements));
    sections.push(this.generateNonFunctionalRequirements(spec.nonFunctionalRequirements));
    sections.push(this.generateUserRoles(spec.userRoles));
    sections.push(this.generateDataEntities(spec.dataEntities));
    sections.push(this.generateConstraints(spec.constraints));

    return sections.join('\n\n');
  }

  generateTechSpecDocument(
    solution: TechSolution,
    projectConfig: ProjectConfig,
    options: Partial<DocumentGenerationOptions> = {}
  ): string {
    const opts = { ...this.defaultOptions, ...options };
    const sections: string[] = [];

    if (opts.includeTableOfContents) {
      sections.push(this.generateTableOfContents('tech-spec', solution));
    }

    sections.push(this.generateDocumentHeader('技术方案文档', projectConfig.name));
    sections.push(this.generateTechOverview(solution.overview));
    sections.push(this.generateArchitectureSection(solution.architectureType, opts.includeDiagrams));
    sections.push(this.generateTechStackSection(solution.techStack));
    sections.push(this.generateModulesSection(solution.modules));
    sections.push(this.generateApiSection(solution.apiDesign));
    sections.push(this.generateDataSection(solution.dataDesign));
    sections.push(this.generateDeploymentSection(solution.deploymentDesign));
    sections.push(this.generateRisksSection(solution.risks));

    return sections.join('\n\n');
  }

  generateMultiAppTechSpecDocument(
    solutions: TechSolution[],
    projectConfig: ProjectConfig,
    options: Partial<DocumentGenerationOptions> = {}
  ): string {
    const opts = { ...this.defaultOptions, ...options };
    const sections: string[] = [];

    sections.push(this.generateDocumentHeader('整体架构文档', projectConfig.name));
    sections.push(this.generateOverallArchitecture(solutions, opts.includeDiagrams));
    
    for (const solution of solutions) {
      sections.push(`\n---\n\n## 应用: ${solution.id}\n\n`);
      sections.push(this.generateTechSpecDocument(solution, projectConfig, { ...opts, includeTableOfContents: false }));
    }

    return sections.join('\n\n');
  }

  private generateDocumentHeader(title: string, projectName: string): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN');
    
    return `# ${title}

**项目名称**: ${projectName}

**文档版本**: 1.0.0

**创建日期**: ${dateStr}

---`;
  }

  private generateTableOfContents(type: string, data: unknown): string {
    if (type === 'requirements') {
      return `## 目录

1. [项目概述](#项目概述)
2. [功能需求](#功能需求)
3. [非功能需求](#非功能需求)
4. [用户角色](#用户角色)
5. [数据实体](#数据实体)
6. [约束条件](#约束条件)`;
    }
    
    return `## 目录

1. [方案概述](#方案概述)
2. [系统架构](#系统架构)
3. [技术选型](#技术选型)
4. [模块设计](#模块设计)
5. [API 设计](#api-设计)
6. [数据设计](#数据设计)
7. [部署方案](#部署方案)
8. [风险评估](#风险评估)`;
  }

  private generateProjectOverview(overview: RequirementSpec['overview']): string {
    return `## 项目概述

### 项目名称

${overview.name}

### 项目描述

${overview.description}

### 项目目标

${overview.goals.map(g => `- ${g}`).join('\n')}

### 目标用户

${overview.targetUsers.map(u => `- ${u}`).join('\n')}

${overview.businessContext ? `### 业务背景\n\n${overview.businessContext}` : ''}

${overview.successCriteria ? `### 成功标准\n\n${overview.successCriteria.map(c => `- ${c}`).join('\n')}` : ''}`;
  }

  private generateFunctionalRequirements(requirements: RequirementSpec['functionalRequirements']): string {
    if (requirements.length === 0) {
      return `## 功能需求

*暂无功能需求*`;
    }

    const groupedByCategory = this.groupByCategory(requirements);
    const sections: string[] = ['## 功能需求'];

    for (const [category, reqs] of Object.entries(groupedByCategory)) {
      sections.push(`\n### ${category || '其他'}\n`);
      
      for (const req of reqs) {
        sections.push(`#### ${req.name} [${req.priority}]\n`);
        sections.push(`${req.description}\n`);
        
        if (req.userStories.length > 0) {
          sections.push(`**用户故事:**\n`);
          for (const story of req.userStories) {
            sections.push(`- 作为${story.asA}，我希望${story.iWantTo}，以便${story.soThat}`);
          }
        }
        
        if (req.acceptanceCriteria.length > 0) {
          sections.push(`\n**验收标准:**\n`);
          for (const criteria of req.acceptanceCriteria) {
            sections.push(`- ${criteria}`);
          }
        }
      }
    }

    return sections.join('\n');
  }

  private generateNonFunctionalRequirements(requirements: RequirementSpec['nonFunctionalRequirements']): string {
    if (requirements.length === 0) {
      return `## 非功能需求

*暂无非功能需求*`;
    }

    const groupedByCategory = this.groupByCategory(requirements);
    const sections: string[] = ['## 非功能需求'];

    for (const [category, reqs] of Object.entries(groupedByCategory)) {
      const categoryName = this.getCategoryDisplayName(category);
      sections.push(`\n### ${categoryName}\n`);
      
      for (const req of reqs) {
        sections.push(`#### ${req.name} [${req.priority}]\n`);
        sections.push(`${req.description}`);
        
        if (req.metrics && req.metrics.length > 0) {
          sections.push(`\n\n**指标:**\n`);
          for (const metric of req.metrics) {
            sections.push(`- ${metric.name}: ${metric.target} ${metric.unit}`);
          }
        }
      }
    }

    return sections.join('\n');
  }

  private generateUserRoles(roles: RequirementSpec['userRoles']): string {
    if (roles.length === 0) {
      return `## 用户角色

*暂无用户角色定义*`;
    }

    const sections: string[] = ['## 用户角色'];

    for (const role of roles) {
      sections.push(`\n### ${role.name}\n`);
      sections.push(`${role.description}\n`);
      
      if (role.permissions.length > 0) {
        sections.push(`**权限:** ${role.permissions.join(', ')}`);
      }
      
      if (role.responsibilities.length > 0) {
        sections.push(`\n\n**职责:**\n`);
        for (const resp of role.responsibilities) {
          sections.push(`- ${resp}`);
        }
      }
    }

    return sections.join('\n');
  }

  private generateDataEntities(entities: RequirementSpec['dataEntities']): string {
    if (entities.length === 0) {
      return `## 数据实体

*暂无数据实体定义*`;
    }

    const sections: string[] = ['## 数据实体'];

    for (const entity of entities) {
      sections.push(`\n### ${entity.name}\n`);
      sections.push(`${entity.description}\n\n`);
      sections.push(`| 字段名 | 类型 | 必填 | 描述 |`);
      sections.push(`|--------|------|------|------|`);
      
      for (const field of entity.fields) {
        sections.push(`| ${field.name} | ${field.type} | ${field.required ? '是' : '否'} | ${field.description || '-'} |`);
      }
      
      if (entity.relationships && entity.relationships.length > 0) {
        sections.push(`\n**关联关系:**\n`);
        for (const rel of entity.relationships) {
          sections.push(`- ${rel.type} 关联 ${rel.targetEntity}${rel.description ? `: ${rel.description}` : ''}`);
        }
      }
    }

    return sections.join('\n');
  }

  private generateConstraints(constraints: RequirementSpec['constraints']): string {
    if (constraints.length === 0) {
      return `## 约束条件

*暂无约束条件*`;
    }

    const groupedByType = this.groupByCategory(constraints);
    const sections: string[] = ['## 约束条件'];

    for (const [type, items] of Object.entries(groupedByType)) {
      const typeName = this.getConstraintTypeDisplayName(type);
      sections.push(`\n### ${typeName}\n`);
      
      for (const item of items) {
        sections.push(`- [${item.impact}] ${item.description}`);
      }
    }

    return sections.join('\n');
  }

  private generateTechOverview(overview: TechSolution['overview']): string {
    const sections: string[] = ['## 方案概述'];

    sections.push(`\n${overview.summary}\n`);

    if (overview.keyDecisions.length > 0) {
      sections.push(`### 关键决策\n`);
      for (const decision of overview.keyDecisions) {
        sections.push(`#### ${decision.decision}\n`);
        sections.push(`**理由**: ${decision.reason}\n`);
        if (decision.tradeoffs.length > 0) {
          sections.push(`**权衡**: ${decision.tradeoffs.join(', ')}`);
        }
      }
    }

    if (overview.assumptions.length > 0) {
      sections.push(`\n### 假设条件\n`);
      for (const assumption of overview.assumptions) {
        sections.push(`- ${assumption}`);
      }
    }

    return sections.join('\n');
  }

  private generateArchitectureSection(architectureType: ArchitectureType, includeDiagrams: boolean): string {
    const typeName = this.getArchitectureTypeName(architectureType);
    const sections: string[] = ['## 系统架构'];

    sections.push(`\n### 架构类型\n`);
    sections.push(`本项目采用 **${typeName}** 架构。\n`);

    if (includeDiagrams) {
      sections.push(`### 架构图\n`);
      sections.push('```mermaid');
      
      if (architectureType === 'monolithic') {
        sections.push(`graph TB
    subgraph Application["应用层"]
        UI["用户界面"]
        Business["业务逻辑"]
        Data["数据访问"]
    end
    
    subgraph Infrastructure["基础设施"]
        DB[("数据库")]
        Cache[("缓存")]
    end
    
    UI --> Business
    Business --> Data
    Data --> DB
    Business --> Cache`);
      } else if (architectureType === 'frontend-backend-separated') {
        sections.push(`graph LR
    subgraph Frontend["前端"]
        FE["React/Vue 应用"]
    end
    
    subgraph Backend["后端"]
        API["API 服务"]
        Auth["认证服务"]
    end
    
    subgraph Data["数据层"]
        DB[("数据库")]
        Cache[("缓存")]
    end
    
    FE -->|REST/GraphQL| API
    API --> Auth
    API --> DB
    API --> Cache`);
      } else if (architectureType === 'microservices') {
        sections.push(`graph TB
    subgraph Gateway["API 网关"]
        GW["网关"]
    end
    
    subgraph Services["微服务"]
        S1["服务 A"]
        S2["服务 B"]
        S3["服务 C"]
    end
    
    subgraph Infrastructure["基础设施"]
        Registry["服务注册"]
        Config["配置中心"]
        MQ["消息队列"]
    end
    
    GW --> S1
    GW --> S2
    GW --> S3
    S1 <--> MQ
    S2 <--> MQ
    S1 --> Registry
    S2 --> Registry
    S3 --> Registry`);
      }
      
      sections.push('```');
    }

    return sections.join('\n');
  }

  private generateTechStackSection(techStack: TechSolution['techStack']): string {
    const sections: string[] = ['## 技术选型'];

    if (techStack.frontend) {
      sections.push(`\n### 前端技术栈\n`);
      sections.push(`| 技术 | 选型 | 说明 |`);
      sections.push(`|------|------|------|`);
      sections.push(`| 框架 | ${techStack.frontend.framework} | - |`);
      sections.push(`| 语言 | ${techStack.frontend.language} | - |`);
      sections.push(`| 构建工具 | ${techStack.frontend.buildTool} | - |`);
      if (techStack.frontend.uiLibrary) {
        sections.push(`| UI 库 | ${techStack.frontend.uiLibrary} | - |`);
      }
      if (techStack.frontend.stateManagement) {
        sections.push(`| 状态管理 | ${techStack.frontend.stateManagement} | - |`);
      }
    }

    if (techStack.backend) {
      sections.push(`\n### 后端技术栈\n`);
      sections.push(`| 技术 | 选型 | 说明 |`);
      sections.push(`|------|------|------|`);
      sections.push(`| 框架 | ${techStack.backend.framework} | - |`);
      sections.push(`| 语言 | ${techStack.backend.language} | - |`);
      if (techStack.backend.orm) {
        sections.push(`| ORM | ${techStack.backend.orm} | - |`);
      }
      if (techStack.backend.authentication) {
        sections.push(`| 认证方式 | ${techStack.backend.authentication} | - |`);
      }
    }

    if (techStack.database) {
      sections.push(`\n### 数据存储\n`);
      sections.push(`| 类型 | 技术 | 说明 |`);
      sections.push(`|------|------|------|`);
      sections.push(`| 主数据库 | ${techStack.database.primary} | - |`);
      if (techStack.database.secondary) {
        sections.push(`| 辅助存储 | ${techStack.database.secondary} | - |`);
      }
    }

    return sections.join('\n');
  }

  private generateModulesSection(modules: TechSolution['modules']): string {
    if (modules.length === 0) {
      return `## 模块设计\n\n*暂无模块设计*`;
    }

    const sections: string[] = ['## 模块设计'];

    for (const module of modules) {
      sections.push(`\n### ${module.name}\n`);
      sections.push(`${module.description}\n`);
      
      if (module.responsibilities.length > 0) {
        sections.push(`**职责:**\n`);
        for (const resp of module.responsibilities) {
          sections.push(`- ${resp}`);
        }
      }
      
      if (module.dependencies.length > 0) {
        sections.push(`\n**依赖:** ${module.dependencies.join(', ')}`);
      }
    }

    return sections.join('\n');
  }

  private generateApiSection(apiDesign: TechSolution['apiDesign']): string {
    if (apiDesign.length === 0) {
      return `## API 设计\n\n*暂无 API 设计*`;
    }

    const sections: string[] = ['## API 设计'];

    for (const api of apiDesign) {
      sections.push(`\n### ${api.name}\n`);
      sections.push(`**类型**: ${api.type.toUpperCase()}`);
      sections.push(`**Base URL**: ${api.baseUrl}`);
      
      if (api.authentication) {
        sections.push(`**认证**: ${api.authentication}`);
      }
      
      if (api.endpoints.length > 0) {
        sections.push(`\n| 方法 | 路径 | 描述 |`);
        sections.push(`|------|------|------|`);
        for (const endpoint of api.endpoints) {
          sections.push(`| ${endpoint.method} | ${endpoint.path} | ${endpoint.description} |`);
        }
      }
    }

    return sections.join('\n');
  }

  private generateDataSection(dataDesign: TechSolution['dataDesign']): string {
    const sections: string[] = ['## 数据设计'];

    sections.push(`\n### 数据库类型\n`);
    sections.push(`${dataDesign.databaseType}\n`);

    if (dataDesign.schemas.length > 0) {
      for (const schema of dataDesign.schemas) {
        sections.push(`\n### ${schema.name}\n`);
        sections.push(`| 表名 | 说明 |`);
        sections.push(`|------|------|`);
        for (const table of schema.tables) {
          sections.push(`| ${table.name} | ${table.columns.length} 个字段 |`);
        }
      }
    }

    if (dataDesign.caching.length > 0) {
      sections.push(`\n### 缓存策略\n`);
      for (const cache of dataDesign.caching) {
        sections.push(`- ${cache.entity}: ${cache.strategy}`);
      }
    }

    return sections.join('\n');
  }

  private generateDeploymentSection(deployment: TechSolution['deploymentDesign']): string {
    const sections: string[] = ['## 部署方案'];

    sections.push(`\n### 环境配置\n`);
    for (const env of deployment.environment) {
      sections.push(`\n#### ${env.name}\n`);
      sections.push(`- 基础设施: ${env.infrastructure}`);
      sections.push(`- 资源配置: CPU ${env.resources.cpu}, 内存 ${env.resources.memory}`);
      if (env.resources.replicas) {
        sections.push(`- 副本数: ${env.resources.replicas}`);
      }
    }

    if (deployment.ciCd.platform) {
      sections.push(`\n### CI/CD\n`);
      sections.push(`- 平台: ${deployment.ciCd.platform}`);
      sections.push(`- 触发条件: ${deployment.ciCd.triggers.join(', ')}`);
    }

    return sections.join('\n');
  }

  private generateRisksSection(risks: TechSolution['risks']): string {
    if (risks.length === 0) {
      return `## 风险评估\n\n*暂无已识别风险*`;
    }

    const sections: string[] = ['## 风险评估'];

    sections.push(`\n| 风险 | 类别 | 概率 | 影响 | 缓解措施 |`);
    sections.push(`|------|------|------|------|----------|`);

    for (const risk of risks) {
      sections.push(`| ${risk.description} | ${risk.category} | ${risk.probability} | ${risk.impact} | ${risk.mitigation} |`);
    }

    return sections.join('\n');
  }

  private generateOverallArchitecture(solutions: TechSolution[], includeDiagrams: boolean): string {
    const sections: string[] = ['## 整体架构'];

    sections.push(`\n### 应用列表\n`);
    sections.push(`| 应用 | 类型 | 描述 |`);
    sections.push(`|------|------|------|`);

    for (const solution of solutions) {
      sections.push(`| ${solution.id} | - | - |`);
    }

    if (includeDiagrams) {
      sections.push(`\n### 应用拓扑图\n`);
      sections.push('```mermaid');
      sections.push(`graph LR`);
      for (const solution of solutions) {
        sections.push(`    ${solution.id}["${solution.id}"]`);
      }
      sections.push('```');
    }

    return sections.join('\n');
  }

  private groupByCategory<T extends { category?: string }>(items: T[]): Record<string, T[]> {
    return items.reduce((acc, item) => {
      const category = item.category || '其他';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  }

  private getCategoryDisplayName(category: string): string {
    const names: Record<string, string> = {
      performance: '性能需求',
      security: '安全需求',
      scalability: '可扩展性',
      availability: '可用性',
      usability: '易用性',
      maintainability: '可维护性',
    };
    return names[category] || category;
  }

  private getConstraintTypeDisplayName(type: string): string {
    const names: Record<string, string> = {
      technical: '技术约束',
      business: '业务约束',
      resource: '资源约束',
      time: '时间约束',
      compliance: '合规约束',
    };
    return names[type] || type;
  }

  private getArchitectureTypeName(type: ArchitectureType): string {
    const names: Record<ArchitectureType, string> = {
      monolithic: '单体应用',
      'frontend-backend-separated': '前后端分离',
      microservices: '微服务架构',
    };
    return names[type];
  }
}

export const documentGenerator = new DocumentGenerator();
