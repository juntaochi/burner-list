import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useShallow } from 'zustand/shallow'
import { useStore, calculateBurnProgress, selectOvenTasks } from '../store/useStore'

export function Oven({ position = [0, 0.22, 0.58] }: { position?: [number, number, number] }) {
  const ovenTasks = useStore(useShallow(selectOvenTasks))
  const ovenTask = ovenTasks[0]
  const completeTask = useStore((state) => state.completeTask)
  const lightRef = useRef<THREE.PointLight>(null!)
  const glassRef = useRef<THREE.MeshPhysicalMaterial>(null!)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isReady, setIsReady] = useState(false)

  useFrame((state) => {
    if (ovenTask) {
      const progress = calculateBurnProgress(ovenTask)
      const baseIntensity = 3.0

      if (progress > 0.8 && lightRef.current) {
        lightRef.current.intensity = baseIntensity + Math.sin(state.clock.elapsedTime * 10) * 1.5
      } else if (lightRef.current) {
        lightRef.current.intensity = baseIntensity
      }

      const newTimeRemaining = ovenTask.deadline - Date.now()
      const newIsReady = newTimeRemaining <= 0

      if (Math.abs(newTimeRemaining - timeRemaining) > 500) {
        setTimeRemaining(newTimeRemaining)
      }
      if (newIsReady !== isReady) {
        setIsReady(newIsReady)
      }

      if (glassRef.current) {
        glassRef.current.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      }
    } else if (glassRef.current) {
      glassRef.current.emissiveIntensity = 0.05
    }
  })

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(Math.abs(ms) / 1000)
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <group 
      position={position} 
      onClick={(e) => {
        e.stopPropagation()
        if (ovenTask) {
          completeTask(ovenTask.id)
        } else {
          useStore.getState().setModalOpen(true)
        }
      }} 
      onPointerOver={() => (document.body.style.cursor = 'pointer')} 
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[1.5, 0.45, 0.3]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.8} />
      </mesh>

      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[1.25, 0.25, 0.2]} />
        <meshStandardMaterial color="#111" metalness={0.2} roughness={0.8} side={THREE.BackSide} />
      </mesh>

      <group position={[0, 0, -0.15]}>
        {[-0.1, 0, 0.1].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 0.2]} />
            <meshStandardMaterial color="#333" metalness={1} roughness={0.3} wireframe />
          </mesh>
        ))}
      </group>

      {ovenTask && (
        <pointLight
          ref={lightRef}
          position={[0, 0.1, -0.1]}
          color="#ff6600"
          intensity={0}
          distance={1.5}
          decay={1.5}
        />
      )}

      <group position={[0, 0.23, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 0.08, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
        </mesh>
        
        <group position={[-0.45, 0, 0.051]}>
          <mesh>
            <planeGeometry args={[0.25, 0.05]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          <Text
            position={[0, 0, 0.001]}
            fontSize={0.035}
            color={ovenTask ? "#ff4400" : "#00ff00"}
            anchorX="center"
          >
            {ovenTask ? "375\u00B0F" : "READY"}
          </Text>
        </group>

        <group position={[-0.15, 0, 0.051]}>
          <mesh>
            <planeGeometry args={[0.2, 0.05]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          <Text
            position={[0, 0, 0.001]}
            fontSize={0.03}
            color="#ffcc00"
          >
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </Text>
        </group>

        {[0.3, 0.4, 0.5, 0.6].map((x, i) => (
          <group key={i} position={[x, 0, 0.05]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.02, 32]} />
              <meshStandardMaterial color="#333" metalness={1} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.005, 0.02, 0.03]} />
              <meshStandardMaterial color="#888" metalness={1} roughness={0.1} />
            </mesh>
          </group>
        ))}
      </group>

      <RoundedBox args={[1.45, 0.35, 0.04]} radius={0.01} smoothness={4} position={[0, 0.02, 0]}>
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
      </RoundedBox>

      <mesh position={[0, 0.02, 0.02]}>
        <boxGeometry args={[1.2, 0.22, 0.01]} />
        <meshPhysicalMaterial
          ref={glassRef}
          transmission={0.95}
          thickness={0.05}
          roughness={0.05}
          envMapIntensity={2.5}
          clearcoat={1}
          color="#111"
          emissive="#ff4400"
          emissiveIntensity={0}
        />
      </mesh>

      <group position={[0, 0.14, 0.06]}>
        <mesh position={[-0.55, 0, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.04, 16]} />
          <meshStandardMaterial color="#666" metalness={1} roughness={0.2} />
        </mesh>
        <mesh position={[0.55, 0, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.04, 16]} />
          <meshStandardMaterial color="#666" metalness={1} roughness={0.2} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 1.2, 32]} />
          <meshStandardMaterial color="#aaa" metalness={1} roughness={0.1} />
        </mesh>
      </group>

      <group position={[0, -0.18, 0.01]}>
        {[-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[0.1, 0.005, 0.01]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        ))}
      </group>

      {ovenTask && (
        <Html position={[0.55, 0, 0.08]} center>
          <div
            className={`timer-hud ${isReady ? 'critical' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              completeTask(ovenTask.id)
            }}
            style={{
              cursor: 'pointer',
              pointerEvents: 'auto',
              background: 'rgba(0, 0, 0, 0.9)',
              border: `2px solid ${isReady ? '#ff0000' : '#ff6600'}`,
              padding: '6px 12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              color: isReady ? '#ff0000' : '#ff6600',
              boxShadow: isReady ? '0 0 20px rgba(255, 0, 0, 0.4)' : '0 0 15px rgba(255, 102, 0, 0.3)',
              transition: 'all 0.2s ease',
              textAlign: 'center',
              minWidth: '120px'
            }}
          >
            <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '1px' }}>{ovenTask.title}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '2px 0' }}>{isReady ? 'DONE' : formatTime(timeRemaining)}</div>
            <div style={{ fontSize: '8px', color: '#fff', opacity: 0.5 }}>CLICK TO REMOVE</div>
          </div>
        </Html>
      )}
    </group>
  )
}

