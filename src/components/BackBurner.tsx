import { useRef } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useShallow } from 'zustand/shallow'
import { useStore, selectBackTasks } from '../store/useStore'

export function BackBurner(props: ThreeElements['group']) {
  const backTasks = useStore(useShallow(selectBackTasks))
  const backTask = backTasks[0]
  const potRef = useRef<THREE.Group>(null!)
  const liquidRef = useRef<THREE.Mesh>(null!)
  const steamRef = useRef<THREE.Group>(null!)
  const steamTime = useRef(0)

  const steelMaterial = (
    <meshStandardMaterial
      color="#d4d4d4"
      metalness={1}
      roughness={0.25}
      envMapIntensity={1}
    />
  )

  const darkSteelMaterial = (
    <meshStandardMaterial
      color="#222222"
      metalness={0.9}
      roughness={0.4}
    />
  )

  useFrame((_state, delta) => {
    if (backTask) {
      steamTime.current += delta
      
      if (liquidRef.current) {
        liquidRef.current.scale.y = 1 + Math.sin(steamTime.current * 2) * 0.02
        liquidRef.current.position.y = 0.08 + Math.sin(steamTime.current * 2) * 0.002
      }

      if (steamRef.current) {
        steamRef.current.children.forEach((child, i) => {
          const mesh = child as THREE.Mesh
          const material = mesh.material as THREE.MeshStandardMaterial
          const speed = 0.5 + i * 0.1
          mesh.position.y = ((steamTime.current * speed + i * 0.5) % 1) * 0.4
          mesh.scale.setScalar(1 - mesh.position.y * 2)
          material.opacity = (1 - mesh.position.y * 2.5) * 0.4
        })
      }
    }
  })

  return (
    <group ref={potRef} {...props}>
      <mesh 
        position={[0, -0.08, 0]} 
        castShadow 
        receiveShadow 
        onClick={() => useStore.getState().setModalOpen(true)}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />
        {darkSteelMaterial}
      </mesh>

      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.2, 32, 1, true]} />
        {steelMaterial}
      </mesh>

      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[0.21, 0.21, 0.2, 32, 1, true]} />
        <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.5} side={THREE.BackSide} />
      </mesh>

      <mesh position={[0, -0.09, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.21, 32]} />
        <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.5} />
      </mesh>

      <mesh position={[0, 0.1, 0]} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.215, 0.01, 12, 48]} />
        {steelMaterial}
      </mesh>

      {[0, Math.PI].map((rot, i) => (
        <group key={i} rotation={[0, rot, 0]} position={[0, 0.05, 0]}>
          <mesh position={[0.21, 0.02, 0.03]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            {darkSteelMaterial}
          </mesh>
          <mesh position={[0.21, 0.02, -0.03]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            {darkSteelMaterial}
          </mesh>
          <RoundedBox args={[0.04, 0.06, 0.08]} radius={0.01} smoothness={4} position={[0.23, 0, 0]}>
            {steelMaterial}
          </RoundedBox>
          <mesh position={[0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.03, 0.008, 12, 24, Math.PI]} />
            {darkSteelMaterial}
          </mesh>
        </group>
      ))}

      {backTask && (
        <>
          <mesh ref={liquidRef} position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.21, 0.21, 0.01, 32]} />
            <meshStandardMaterial 
              color="#8B4513" 
              roughness={0.1} 
              metalness={0.2} 
              transparent 
              opacity={0.9} 
            />
          </mesh>

          <group ref={steamRef} position={[0, 0.12, 0]}>
            {[...Array(5)].map((_, i) => (
              <mesh key={i} position={[((i * 0.13) % 0.2) - 0.1, 0, ((i * 0.21) % 0.2) - 0.1]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
              </mesh>
            ))}
          </group>

          <group position={[0.4, -0.05, 0.3]} rotation={[0.2, 0, 0.3]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.23, 0.23, 0.02, 32]} />
              {steelMaterial}
            </mesh>
            <mesh position={[0, 0.03, 0]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.04, 0.01, 12, 24, Math.PI]} />
              {darkSteelMaterial}
            </mesh>
          </group>

          <Html position={[0, 0.4, 0]} center>
            <div
              className="timer-hud"
              style={{
                background: 'rgba(139, 69, 19, 0.8)',
                backdropFilter: 'blur(4px)',
                borderColor: '#654321',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ fontSize: '10px', letterSpacing: '0.1em', fontWeight: 'bold' }}>SIMMERING</div>
              <div style={{ fontSize: '14px' }}>{backTask.title}</div>
            </div>
          </Html>
        </>
      )}

      {!backTask && (
        <group position={[0, 0.11, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.23, 0.23, 0.02, 32]} />
            {steelMaterial}
          </mesh>
          <mesh position={[0, 0.03, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.04, 0.01, 12, 24, Math.PI]} />
            {darkSteelMaterial}
          </mesh>
        </group>
      )}
    </group>
  )
}
