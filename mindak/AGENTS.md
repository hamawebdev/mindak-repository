# Agent Guidelines for Mindak (Studio Admin)

## Commands
- **Dev**: `npm run dev` (starts Next.js dev server)
- **Build**: `npm run build` (type checking and production build)
- **Lint**: `npm run lint` (ESLint check)
- **Format**: `npm run format` (Prettier format), `npm run format:check` (check formatting)
- **No test suite currently configured**

## Architecture
- **Framework**: Next.js 16 (App Router) with React 19, TypeScript strict mode
- **Structure**: `src/app/` contains route groups: `(agency)/`, `(external)/`, `(main)/`, `api/`
- **Code Organization**: `src/components/`, `src/hooks/`, `src/lib/`, `src/server/`, `src/stores/` (Zustand), `src/types/`
- **Styling**: Tailwind CSS 4, CSS custom properties in `src/app/globals.css` (read this before creating UI components)
- **State**: Zustand for state management, TanStack Query for server state
- **UI**: shadcn/ui components, Radix UI primitives, GSAP for complex animations, CSS transitions for simple effects

## Code Style
- **Imports**: React first, Next second, external, then internal; alphabetized with newlines between groups (`import/order`)
- **Files**: kebab-case naming (`unicorn/filename-case`)
- **Formatting**: Double quotes, semicolons, 120 char width, 2 spaces (see `.prettierrc`)
- **TypeScript**: Avoid `any`, prefer nullish coalescing, strict mode enabled, path alias `@/` for `src/`
- **Complexity**: Max 10 cyclomatic complexity, max 300 lines per file, max 4 nesting depth
- **React**: No array index keys, memoize context values, PascalCase components, avoid nested component definitions
