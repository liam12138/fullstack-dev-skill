import { TechStackSelection } from './types';

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  techStack: TechStackSelection;
  type: 'frontend' | 'backend' | 'fullstack' | 'service';
  files: TemplateFile[];
  directories: TemplateDirectory[];
  postGenerate?: PostGenerateAction[];
  metadata: TemplateMetadata;
}

export interface TemplateFile {
  path: string;
  content: string | TemplateContentGenerator;
  condition?: TemplateCondition;
  encoding?: 'utf-8' | 'binary';
}

export type TemplateContentGenerator = (context: TemplateContext) => string;

export interface TemplateDirectory {
  path: string;
  description?: string;
  condition?: TemplateCondition;
}

export interface TemplateCondition {
  type: 'equals' | 'includes' | 'exists' | 'custom';
  field: string;
  value: unknown;
  customEvaluator?: (context: TemplateContext) => boolean;
}

export interface TemplateContext {
  project: {
    name: string;
    description: string;
    author?: string;
    version?: string;
  };
  techStack: TechStackSelection;
  config: Record<string, unknown>;
  customData?: Record<string, unknown>;
}

export interface TemplateMetadata {
  author: string;
  version: string;
  tags: string[];
  minNodeVersion?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface PostGenerateAction {
  type: 'install' | 'init-git' | 'run-script' | 'create-file';
  command?: string;
  args?: string[];
  description: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
  description?: string;
  size: number;
}

export interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  directories: string[];
  actions: PostGenerateAction[];
  errors: GenerationError[];
  summary: string;
}

export interface GenerationError {
  file?: string;
  message: string;
  code: string;
}

export interface TemplateRegistry {
  templates: Map<string, CodeTemplate>;
  categories: Map<string, string[]>;
}

export function createTemplateContext(
  projectName: string,
  projectDescription: string,
  techStack: TechStackSelection,
  config: Record<string, unknown> = {}
): TemplateContext {
  return {
    project: {
      name: projectName,
      description: projectDescription,
    },
    techStack,
    config,
  };
}

export function evaluateCondition(
  condition: TemplateCondition,
  context: TemplateContext
): boolean {
  const { type, field, value, customEvaluator } = condition;
  
  const fieldValue = getNestedValue(context, field);
  
  switch (type) {
    case 'equals':
      return fieldValue === value;
    case 'includes':
      return Array.isArray(fieldValue) 
        ? fieldValue.includes(value) 
        : String(fieldValue).includes(String(value));
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null;
    case 'custom':
      return customEvaluator ? customEvaluator(context) : false;
    default:
      return false;
  }
}

<<<<<<< HEAD
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
=======
function getNestedValue(obj: object, path: string): unknown {
  return path.split('.').reduce((current: any, key) => {
>>>>>>> d812423 (Initial commit)
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}
