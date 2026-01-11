import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useShallow } from 'zustand/shallow'
import { useStore, selectFrontTasks, selectBackTasks } from '../store/useStore'

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
}

const PARTICLE_COUNT = 60

function createParticles(): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      position: new THREE.Vector3(0, -10, 0),
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 2,
    })
  }
  return particles
}

export function SteamParticles() {
  const frontTasks = useStore(useShallow(selectFrontTasks))
  const backTasks = useStore(useShallow(selectBackTasks))
  const backTask = backTasks[0]
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particles = useMemo(() => createParticles(), [])

  const burnerPositions: [number, number, number][] = useMemo(() => {
    const positions: [number, number, number][] = []

    frontTasks.forEach((task) => {
      const slotPositions: [number, number, number][] = [
        [-0.5, 0.95, 0.25],
        [0.5, 0.95, 0.25],
        [-0.5, 0.95, -0.25],
        [0.5, 0.95, -0.25],
      ]
      positions.push(slotPositions[task.slotId])
    })

    if (backTask) {
      positions.push([0, 0.95, -0.45])
    }

    return positions
  }, [frontTasks, backTask])

  useFrame((_, delta) => {
    if (!meshRef.current || burnerPositions.length === 0) {
      if (meshRef.current) {
        meshRef.current.visible = false
      }
      return
    }

    meshRef.current.visible = true

    particles.forEach((particle, i) => {
      particle.life -= delta

      if (particle.life <= 0 && burnerPositions.length > 0) {
        const sourceIndex = Math.floor(Math.random() * burnerPositions.length)
        const source = burnerPositions[sourceIndex]

        particle.position.set(source[0] + (Math.random() - 0.5) * 0.15, source[1], source[2] + (Math.random() - 0.5) * 0.15)

        particle.velocity.set((Math.random() - 0.5) * 0.1, 0.3 + Math.random() * 0.2, (Math.random() - 0.5) * 0.1)

        particle.life = 1 + Math.random()
        particle.maxLife = particle.life
      }

      particle.position.add(particle.velocity.clone().multiplyScalar(delta))

      const lifeRatio = particle.life / particle.maxLife
      const scale = lifeRatio * 0.08

      dummy.position.copy(particle.position)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.15} 
        depthWrite={false} 
        roughness={0}
        metalness={0}
        emissive="#ffffff"
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  )
}
