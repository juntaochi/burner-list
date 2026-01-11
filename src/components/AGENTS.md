# COMPONENTS KNOWLEDGE BASE

## OVERVIEW

Mixed 3D scene objects and 2D UI components. All R3F components render inside `<Canvas>`.

## STRUCTURE

| Component | Type | Purpose |
|-----------|------|---------|
| `Stove.tsx` | 3D | Procedural stove geometry |
| `Pan.tsx` | 3D | Task visualization with burn color lerp |
| `FrontBurners.tsx` | 3D | Maps 4 front slots to Pan components |
| `BackBurner.tsx` | 3D | Stewing pot (no burn) |
| `Oven.tsx` | 3D | Timed tasks with glow effect |
| `SteamParticles.tsx` | 3D | Instanced particle system |
| `TicketRack.tsx` | 3D | 3D Text labels for active orders |
| `Clock.tsx` | 3D | LED digital clock |
| `Counter.tsx` | 3D | Clickable prep station |
| `CameraRig.tsx` | 3D | POV camera with mouse parallax |
| `AudioManager.tsx` | Logic | Howler.js audio (renders null) |
| `AddTaskModal.tsx` | 2D | HTML modal for task creation |

## CONVENTIONS

### 3D Components

```typescript
// Materials: OUTSIDE component or inline JSX
const material = useMemo(() => new THREE.MeshStandardMaterial({...}), [])

// Animation: useFrame with delta
useFrame((state, delta) => {
  meshRef.current.rotation.y += delta
})

// Color lerping: Use shared Color instance
const tempColor = new THREE.Color()
tempColor.lerpColors(colorA, colorB, progress)
```

### Zustand Subscriptions

```typescript
// Array filter: MUST use useShallow
const tasks = useStore(useShallow((state) => state.tasks.filter(...)))

// Single item: .find() is safe (returns same ref or undefined)
const task = useStore((state) => state.tasks.find(t => t.id === id))

// Action: Direct selection is safe
const complete = useStore((state) => state.completeTask)
```

### Html Overlay (drei)

```tsx
<Html position={[0, 0.25, 0]} center>
  <div className="timer-hud" style={{ pointerEvents: 'auto' }}>
    {/* 2D content */}
  </div>
</Html>
```

## ANTI-PATTERNS

- Creating materials/geometries inside render body
- Selecting functions from Zustand store
- `.filter()` without `useShallow`
- Modifying THREE objects in render (use useFrame)
