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
      const baseIntensity = 1.5

      if (progress > 0.8 && lightRef.current) {
        lightRef.current.intensity = baseIntensity + Math.sin(state.clock.elapsedTime * 10) * 0.5
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
        glassRef.current.emissiveIntensity = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      }
    } else if (glassRef.current) {
      glassRef.current.emissiveIntensity = 0
    }
  })

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(Math.abs(ms) / 1000)
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <group position={position}>
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[1.45, 0.35, 0.2]} />
        <meshStandardMaterial color="#050505" roughness={0.9} metalness={0.1} />
      </mesh>

      <group position={[0, 0, -0.1]}>
        {[-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map((x, i) => (
          <mesh key={`v-${i}`} position={[x, 0, 0]}>
            <cylinderGeometry args={[0.002, 0.002, 0.28]} />
            <meshStandardMaterial color="#444" metalness={1} roughness={0.2} />
          </mesh>
        ))}
        {[-0.1, -0.05, 0, 0.05, 0.1].map((y, i) => (
          <mesh key={`h-${i}`} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.002, 0.002, 1.35]} />
            <meshStandardMaterial color="#444" metalness={1} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {ovenTask && (
        <pointLight
          ref={lightRef}
          position={[0, 0, -0.05]}
          color="#ff4400"
          intensity={0}
          distance={1.5}
          decay={2}
        />
      )}

      <group position={[0, 0.18, 0]}>
        <mesh>
          <boxGeometry args={[1.4, 0.06, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        <group position={[-0.5, 0, 0.011]}>
          <mesh>
            <planeGeometry args={[0.15, 0.04]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          <Text
            position={[0, 0, 0.001]}
            fontSize={0.03}
            color={ovenTask ? "#ff4400" : "#333"}
          >
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </Text>
        </group>
        {[0.3, 0.4, 0.5, 0.6].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.011]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.005, 16]} />
            <meshStandardMaterial color="#333" metalness={1} roughness={0.1} />
          </mesh>
        ))}
      </group>

      <RoundedBox args={[1.4, 0.3, 0.02]} radius={0.01} smoothness={4}>
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
      </RoundedBox>

      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[1.2, 0.2, 0.005]} />
        <meshPhysicalMaterial
          ref={glassRef}
          transmission={1}
          thickness={0.1}
          roughness={0}
          envMapIntensity={2.0}
          clearcoat={1}
          color="#222"
          emissive="#ff4400"
          emissiveIntensity={0}
        />
      </mesh>

      <group position={[0, 0.1, 0.03]}>
        <mesh position={[-0.5, 0, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.02, 16]} />
          <meshStandardMaterial color="#888" metalness={1} roughness={0.1} />
        </mesh>
        <mesh position={[0.5, 0, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.02, 16]} />
          <meshStandardMaterial color="#888" metalness={1} roughness={0.1} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, 1.1, 16]} />
          <meshStandardMaterial color="#aaa" metalness={1} roughness={0.05} />
        </mesh>
      </group>

      {ovenTask && (
        <Html position={[0.5, 0, 0.05]} center>
          <div
            className={`timer-hud ${isReady ? 'critical' : ''}`}
            onClick={() => completeTask(ovenTask.id)}
            style={{
              cursor: 'pointer',
              pointerEvents: 'auto',
              background: 'rgba(0, 0, 0, 0.85)',
              border: `1px solid ${isReady ? '#ff0000' : '#ff4400'}`,
              padding: '4px 8px',
              borderRadius: '2px',
              fontFamily: 'monospace',
              color: isReady ? '#ff0000' : '#ff4400',
              boxShadow: ovenTask ? '0 0 15px rgba(255, 68, 0, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.8 }}>{ovenTask.title}</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{isReady ? 'READY' : formatTime(timeRemaining)}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

