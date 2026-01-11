import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { type Task, calculateBurnProgress, deriveTaskState, type TaskState } from '../store/useStore'

interface PanProps {
  task: Task
  position: [number, number, number]
  onComplete: () => void
}

const RAW_COLOR = new THREE.Color('#ffaaaa')
const COOKED_COLOR = new THREE.Color('#8B4513')
const BURNT_COLOR = new THREE.Color('#1a1a1a')
const tempColor = new THREE.Color()

export function Pan({ task, position, onComplete }: PanProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const foodRef = useRef<THREE.Mesh>(null!)
  
  const [timeRemaining, setTimeRemaining] = useState(() => task.deadline - Date.now())
  const [taskState, setTaskState] = useState<TaskState>(() => deriveTaskState(task))

  const exteriorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d4d4d4',
        metalness: 1,
        roughness: 0.1,
      }),
    []
  )

  const interiorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        metalness: 0.4,
        roughness: 0.6,
      }),
    []
  )

  const handleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#222222',
        metalness: 0,
        roughness: 0.9,
      }),
    []
  )

  const rivetMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#999999',
        metalness: 0.9,
        roughness: 0.2,
      }),
    []
  )

  useFrame(() => {
    if (!foodRef.current) return

    const progress = calculateBurnProgress(task)
    const clampedProgress = Math.min(Math.max(progress, 0), 1.5)

    if (clampedProgress <= 1.0) {
      tempColor.lerpColors(RAW_COLOR, COOKED_COLOR, clampedProgress)
    } else {
      const burnProgress = (clampedProgress - 1.0) * 2
      tempColor.lerpColors(COOKED_COLOR, BURNT_COLOR, Math.min(burnProgress, 1))
    }

    const foodMat = foodRef.current.material as THREE.MeshStandardMaterial
    foodMat.color.copy(tempColor)

    if (clampedProgress > 1.0) {
      const glowIntensity = (clampedProgress - 1.0) * 3
      const group = meshRef.current.parent
      if (group && group.children[1]) {
        const mat = (group.children[1] as THREE.Mesh).material as THREE.MeshStandardMaterial
        mat.emissive.set('#ff3300')
        mat.emissiveIntensity = Math.min(glowIntensity, 1)
      }
    } else {
      const group = meshRef.current.parent
      if (group && group.children[1]) {
        const mat = (group.children[1] as THREE.Mesh).material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = 0
      }
    }
    
    const newTimeRemaining = task.deadline - Date.now()
    const newTaskState = deriveTaskState(task)
    
    if (Math.abs(newTimeRemaining - timeRemaining) > 500) {
      setTimeRemaining(newTimeRemaining)
    }
    if (newTaskState !== taskState) {
      setTaskState(newTaskState)
    }
  })

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(Math.abs(ms) / 1000)
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    const sign = ms < 0 ? '-' : ''
    return `${sign}${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const hudClassName = `timer-hud ${taskState === 'critical' ? 'critical' : ''} ${taskState === 'burnt' ? 'burnt' : ''}`

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <cylinderGeometry args={[0.185, 0.15, 0.06, 32]} />
        <primitive object={exteriorMaterial} attach="material" />
      </mesh>

      <mesh position={[0, 0.005, 0]} receiveShadow>
        <cylinderGeometry args={[0.175, 0.145, 0.055, 32]} />
        <primitive object={interiorMaterial} attach="material" />
      </mesh>

      <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.18, 0.006, 8, 32]} />
        <primitive object={exteriorMaterial} attach="material" />
      </mesh>

      <mesh position={[0.22, 0.02, 0]} castShadow>
        <boxGeometry args={[0.1, 0.015, 0.025]} />
        <primitive object={exteriorMaterial} attach="material" />
      </mesh>

      <mesh position={[0.32, 0.02, 0]} castShadow>
        <boxGeometry args={[0.15, 0.022, 0.035]} />
        <primitive object={handleMaterial} attach="material" />
      </mesh>

      <group position={[0.175, 0.02, 0]}>
        <mesh position={[0, 0, 0.012]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.01, 8]} />
          <primitive object={rivetMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0, -0.012]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.01, 8]} />
          <primitive object={rivetMaterial} attach="material" />
        </mesh>
      </group>

      <mesh ref={foodRef} position={[0, 0.035, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
        <meshStandardMaterial color={RAW_COLOR} roughness={0.7} />
      </mesh>

      <Html position={[0, 0.25, 0]} center>
        <div className={hudClassName} onClick={onComplete} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>{task.title.slice(0, 12)}</div>
          <div>{taskState === 'burnt' ? 'BURNT!' : formatTime(timeRemaining)}</div>
        </div>
      </Html>
    </group>
  )
}
