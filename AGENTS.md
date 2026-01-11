# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-11
**Project:** The Line (burner-list)

## OVERVIEW

3D skeuomorphic productivity app using kitchen metaphor. Tasks = orders on burners that visually "burn" as deadlines approach. React 19 + Vite 7 + React Three Fiber + Zustand 5 + Tailwind 4.

## STRUCTURE

```
burner-list/
├── src/
│   ├── components/     # 3D scene objects + 2D UI (flat, not separated)
│   ├── store/          # Zustand store (single file)
│   ├── App.tsx         # Canvas + Scene + HUD orchestration
│   └── main.tsx        # Standard React entry
├── public/sounds/      # Audio assets (ding.mp3 required, others optional)
└── index.html
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add task types/slots | `src/store/useStore.ts` | Modify `TaskType`, `getAvailableSlot` |
| New 3D object | `src/components/` | Use procedural geometry pattern |
| Styling | `src/index.css` | Tailwind v4 (no config file) |
| Audio | `src/components/AudioManager.tsx` | Howler.js, requires user gesture |
| Task burn progress | `calculateBurnProgress`, `deriveTaskState` | Pure functions in store |

## CONVENTIONS

### Zustand v5 + React 19 (CRITICAL)

**Selectors returning new references cause infinite loops.**

```typescript
// WRONG - causes infinite re-render
const tasks = useStore((state) => state.tasks.filter(t => t.type === 'front'))

// CORRECT - wrap with useShallow
import { useShallow } from 'zustand/shallow'
const tasks = useStore(useShallow((state) => state.tasks.filter(t => t.type === 'front')))

// CORRECT - primitive values are safe
const count = useStore((state) => state.tasks.filter(t => t.type === 'front').length)
```

### React Three Fiber

- Procedural geometry preferred over GLTF assets
- Materials: Create outside component body OR use inline JSX `<meshStandardMaterial>`
- Never: `new Material()` inside render body (memory leak)
- useFrame for animations, receives delta time

### Time-Based State

Progress calculated on-the-fly from timestamps, not stored:
```typescript
const progress = (Date.now() - task.createdAt) / (task.deadline - task.createdAt)
```

## ANTI-PATTERNS (THIS PROJECT)

| Pattern | Why Forbidden |
|---------|---------------|
| `useStore(state => state.someFunction)` | Functions as state = infinite loops |
| `.filter()` in selector without `useShallow` | New array ref each call |
| `as any`, `@ts-ignore` | Type safety required |
| Material inside component body | Memory leak, perf |
| Empty audio files | Howler silently fails |

## COMMANDS

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## AUDIO REQUIREMENTS

- `public/sounds/ding.mp3` - Service bell (required for completion feedback)
- `public/sounds/sizzle.mp3` - Frying loop (optional)
- `public/sounds/ambience.mp3` - Kitchen background (optional)

Browser requires user gesture before audio plays. `StartOverlay` handles this.

## NOTES

- Tailwind v4: No `tailwind.config.js`. Uses `@tailwindcss/vite` plugin directly.
- React 19: Uses new `createRoot` API, strict mode behaviors.
- Build warning about chunk size is expected (Three.js is large).
- Back burner tasks never "burn" - `deriveTaskState` returns 'cooking' for type 'back'.
