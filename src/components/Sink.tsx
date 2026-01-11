import type { ThreeElements } from '@react-three/fiber'
import { RoundedBox, Html } from '@react-three/drei'
import { useShallow } from 'zustand/shallow'
import { useStore, selectSinkTasks } from '../store/useStore'

export function Sink(props: ThreeElements['group']) {
  const sinkTasks = useStore(useShallow(selectSinkTasks))
  const completeTask = useStore((state) => state.completeTask)

  const chromeMaterial = (
    <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.05} envMapIntensity={1.5} />
  )

  const sinkMaterial = (
    <meshStandardMaterial color="#f0f0f0" metalness={0.4} roughness={0.1} />
  )

  return (
    <group {...props}>
      <RoundedBox
        args={[1.2, 0.12, 0.65]}
        radius={0.02}
        smoothness={4}
        position={[0, 0.84, 0]}
        castShadow
        receiveShadow
        onClick={() => sinkTasks.length > 0 && completeTask(sinkTasks[0].id)}
        onPointerOver={() => sinkTasks.length > 0 && (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        {sinkMaterial}
      </RoundedBox>

      <mesh position={[0, 0.86, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.0, 0.45]} />
        <meshStandardMaterial color="#cccccc" metalness={0.2} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.861, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 32]} />
        <meshStandardMaterial color="#111111" metalness={0.5} roughness={0.8} />
      </mesh>

      <group position={[0, 0.9, 0.22]}>
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[0.45, 0.02, 0.08]} />
          {chromeMaterial}
        </mesh>

        <mesh position={[0, 0.045, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.05, 32]} />
          {chromeMaterial}
        </mesh>

        <group position={[0, 0.07, 0]}>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.1, 16]} />
            {chromeMaterial}
          </mesh>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.1, 16]} />
            {chromeMaterial}
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.025, 16, 16]} />
            {chromeMaterial}
          </mesh>
          <mesh position={[0, 0.2, -0.05]} rotation={[0, 0, 0]} castShadow>
            <torusGeometry args={[0.05, 0.025, 16, 32, Math.PI]} />
            {chromeMaterial}
          </mesh>
          <mesh position={[0, 0.2, -0.1]} castShadow>
            <sphereGeometry args={[0.025, 16, 16]} />
            {chromeMaterial}
          </mesh>
          <group position={[0, 0.2, -0.1]}>
            <mesh position={[0, -0.06, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.12, 16]} />
              {chromeMaterial}
            </mesh>
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.03, 16]} />
              <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </group>

        <group position={[-0.18, 0.02, 0]}>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.04, 32]} />
            {chromeMaterial}
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation={[0, Math.PI, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.12, 16]} />
            {chromeMaterial}
          </mesh>
          <mesh position={[0, 0.06, 0.06]} castShadow>
            <sphereGeometry args={[0.015, 16, 16]} />
            {chromeMaterial}
          </mesh>
        </group>

        <group position={[0.18, 0.02, 0]}>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.04, 32]} />
            {chromeMaterial}
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation={[0, Math.PI, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.12, 16]} />
            {chromeMaterial}
          </mesh>
          <mesh position={[0, 0.06, 0.06]} castShadow>
            <sphereGeometry args={[0.015, 16, 16]} />
            {chromeMaterial}
          </mesh>
        </group>
      </group>

      <mesh position={[0, 0.855, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.95, 0.4]} />
        <meshStandardMaterial
          color="#d0e8ff"
          transparent
          opacity={0.6}
          metalness={0.5}
          roughness={0}
          envMapIntensity={2.0}
        />
      </mesh>

      {sinkTasks.length > 0 && (
        <Html position={[0, 1.1, 0]} center distanceFactor={10}>
          <div className="flex flex-col gap-2 pointer-events-none">
            {sinkTasks.slice(0, 3).map((task, idx) => (
              <div
                key={task.id}
                onClick={(e) => {
                  e.stopPropagation()
                  completeTask(task.id)
                }}
                className="pointer-events-auto cursor-pointer group"
              >
                <div 
                  className="bg-sky-900/80 backdrop-blur-md border border-sky-400/50 px-3 py-1.5 rounded-sm shadow-lg
                             transform transition-all duration-200 hover:scale-105 hover:bg-sky-800/90 hover:border-sky-300"
                  style={{
                    boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)',
                    minWidth: '100px'
                  }}
                >
                  <div className="text-[10px] uppercase tracking-widest text-sky-300 font-bold mb-0.5">Sink Duty</div>
                  <div className="text-sm text-white font-medium flex items-center justify-between">
                    <span>{task.title}</span>
                    {idx === 0 && <span className="ml-2 w-2 h-2 rounded-full bg-sky-400 animate-pulse" />}
                  </div>
                </div>
              </div>
            ))}
            {sinkTasks.length > 3 && (
              <div className="text-[10px] text-sky-300/80 text-center font-bold uppercase">
                + {sinkTasks.length - 3} more
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}
