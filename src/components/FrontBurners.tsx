import { Pan } from './Pan'
import { useStore, selectFrontTasks } from '../store/useStore'
import { useShallow } from 'zustand/shallow'

const BURNER_POSITIONS: [number, number, number][] = [
  [-0.5, 0.87, 0.25],
  [0.5, 0.87, 0.25],
  [-0.5, 0.87, -0.25],
  [0.5, 0.87, -0.25],
]

export function FrontBurners() {
  const frontTasks = useStore(useShallow(selectFrontTasks))
  const completeTask = useStore.getState().completeTask

  return (
    <group>
      {BURNER_POSITIONS.map((pos, i) => (
        <group 
          key={`burner-${i}`} 
          position={pos} 
          onClick={() => useStore.getState().setModalOpen(true)}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <mesh visible={false}>
            <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
          </mesh>
        </group>
      ))}
      {frontTasks.map((task) => (
        <Pan
          key={task.id}
          task={task}
          position={BURNER_POSITIONS[task.slotId]}
          onComplete={() => completeTask(task.id)}
        />
      ))}
    </group>
  )
}
