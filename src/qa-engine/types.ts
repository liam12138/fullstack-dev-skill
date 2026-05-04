export type QuestionType = 
  | 'single-choice' 
  | 'multiple-choice' 
  | 'text' 
  | 'number' 
  | 'confirm' 
  | 'rich-text'
  | 'conditional';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

export interface QuestionValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: (value: unknown) => boolean;
  errorMessage?: string;
}

export interface QuestionCondition {
  field: string;
  operator: 'equals' | 'not-equals' | 'includes' | 'exists';
  value: unknown;
}

export interface Question<T = unknown> {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: T;
  options?: QuestionOption[];
  validation?: QuestionValidation;
  condition?: QuestionCondition;
  helpText?: string;
  category?: string;
  priority?: number;
  followUp?: string[];
}

export interface QuestionGroup {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  condition?: QuestionCondition;
}

export interface QuestionFlow {
  id: string;
  name: string;
  description?: string;
  groups: QuestionGroup[];
  order: string[];
}

export interface Answer {
  questionId: string;
  value: unknown;
  timestamp: string;
  isValid: boolean;
  validationErrors?: string[];
}

export interface QuestionnaireState {
  flowId: string;
  currentGroupId: string;
  currentQuestionId: string;
  answers: Map<string, Answer>;
  history: Array<{
    groupId: string;
    questionId: string;
    direction: 'forward' | 'backward';
    timestamp: string;
  }>;
  startedAt: string;
  completedAt?: string;
}

export interface QuestionnaireResult {
  flowId: string;
  answers: Record<string, unknown>;
  completedAt: string;
  duration: number;
}

export function createQuestion<T>(
  config: Omit<Question<T>, 'id'> & { id?: string }
): Question<T> {
  return {
    id: config.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...config,
  } as Question<T>;
}

export function createQuestionGroup(
  config: Omit<QuestionGroup, 'id'> & { id?: string }
): QuestionGroup {
  return {
    id: config.id || `g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...config,
  };
}

export function createQuestionFlow(
  config: Omit<QuestionFlow, 'id'> & { id?: string }
): QuestionFlow {
  return {
    id: config.id || `f_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...config,
  };
}

export function validateAnswer(
  question: Question,
  value: unknown
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validation = question.validation;

  if (!validation) {
    return { isValid: true, errors: [] };
  }

  if (validation.required && (value === undefined || value === null || value === '')) {
    errors.push(validation.errorMessage || '此字段为必填项');
    return { isValid: false, errors };
  }

  if (value === undefined || value === null || value === '') {
    return { isValid: true, errors: [] };
  }

  if (question.type === 'text' || question.type === 'rich-text') {
    const textValue = String(value);
    if (validation.minLength && textValue.length < validation.minLength) {
      errors.push(`最少需要 ${validation.minLength} 个字符`);
    }
    if (validation.maxLength && textValue.length > validation.maxLength) {
      errors.push(`最多允许 ${validation.maxLength} 个字符`);
    }
    if (validation.pattern && !new RegExp(validation.pattern).test(textValue)) {
      errors.push(validation.errorMessage || '格式不正确');
    }
  }

  if (question.type === 'number') {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      errors.push('请输入有效的数字');
    } else {
      if (validation.min !== undefined && numValue < validation.min) {
        errors.push(`数值不能小于 ${validation.min}`);
      }
      if (validation.max !== undefined && numValue > validation.max) {
        errors.push(`数值不能大于 ${validation.max}`);
      }
    }
  }

  if (question.type === 'single-choice' || question.type === 'multiple-choice') {
    const validValues = question.options?.map(o => o.value) || [];
    if (question.type === 'single-choice') {
      if (!validValues.includes(value as string)) {
        errors.push('请选择有效的选项');
      }
    } else {
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        if (!validValues.includes(v as string)) {
          errors.push(`无效的选项: ${v}`);
        }
      }
    }
  }

  if (validation.customValidator && !validation.customValidator(value)) {
    errors.push(validation.errorMessage || '验证失败');
  }

  return { isValid: errors.length === 0, errors };
}

export function evaluateQuestionCondition(
  condition: QuestionCondition,
  answers: Map<string, Answer>
): boolean {
  const answer = answers.get(condition.field);
  const value = answer?.value;

  switch (condition.operator) {
    case 'equals':
      return value === condition.value;
    case 'not-equals':
      return value !== condition.value;
    case 'includes':
      if (Array.isArray(value)) {
        return value.includes(condition.value);
      }
      return String(value).includes(String(condition.value));
    case 'exists':
      return value !== undefined && value !== null;
    default:
      return false;
  }
}
