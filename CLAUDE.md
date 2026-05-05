# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is a Claude Code / Trae IDE skill that guides developers through a structured 5-stage workflow: project initialization → requirements collection → tech spec generation → code generation → project delivery. It supports monolithic, frontend-backend-separated, and microservice architectures. All UI text and documentation output is in Chinese (zh-CN).

## Commands

```bash
npm run build      # tsc — compile TypeScript to ./dist
npm run dev        # tsc --watch
npm run test       # vitest
npm run lint       # eslint src --ext .ts,.tsx
```

## Architecture

```
src/
  index.ts                  # Main entry — FullstackDevSkill singleton, stage router
  core/
    index.ts                # Re-exports + constants (STAGES, STAGE_NAMES, etc.)
    types.ts                # All domain types (ProjectConfig, TechStack, SessionState, etc.)
    specs.ts                # RequirementSpec, TechSolution, and related types
    state-manager.ts        # In-memory session/state store (Map-based)
    templates.ts            # Code template types + condition evaluation helpers
  qa-engine/
    index.ts                # Re-exports + initializeQaEngine()
    engine.ts               # QaEngine — drives questionnaire flows, answers, progress
    questions.ts            # Concrete question definitions for init + requirements flows
    types.ts                # Question/Answer/Flow types + validation
  doc-generator/
    index.ts                # Re-exports
    generator.ts            # DocumentGenerator — renders Markdown docs from spec data
```

**Module responsibilities:**

- **`core`** — All shared types, specs, and state management. `StateManager` stores sessions in a `Map<string, SessionState>` and supports rollback. `templates.ts` defines the shape of code generation templates but has no concrete templates yet.
- **`qa-engine`** — Interactive questionnaire system. `QaEngine` manages `QuestionFlow` instances (each containing ordered `QuestionGroup`s). Supports conditional questions, answer validation, history-based back-navigation, and progress tracking. Two flows are defined: `project-init` (6 questions) and `requirements` (8 questions).
- **`doc-generator`** — `DocumentGenerator` takes structured data (`RequirementSpec`, `TechSolution`) and produces Markdown documents with tables of contents, mermaid diagrams, and grouped sections.

**Key patterns:**

- Singletons exported at module level: `fullstackDevSkill`, `stateManager`, `qaEngine`, `documentGenerator`
- The `FullstackDevSkillImpl.processUserInput()` method routes by `session.currentStage` through a switch statement to stage-specific handlers
- `StateManager.updateCollectedData()` is the mechanism for persisting stage outputs (project config, requirement spec, tech solution) into the session
- Path aliases are configured in `tsconfig.json` (`@core/*`, `@qa-engine/*`, `@doc-generator/*`, `@code-generator/*`, `@platform-adapters/*`) but the code uses relative imports — the aliases are setup for future use

**Unfinished areas:**

- `handleTechSpecStage`, `handleCodeGenStage`, and `handleDeliveryStage` in `src/index.ts` are stubs returning placeholder responses
- The `@code-generator/*` and `@platform-adapters/*` path aliases exist in tsconfig but no corresponding source directories exist
- The `templates/` directory referenced in README does not exist
