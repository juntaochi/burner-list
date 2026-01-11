import { RoundedBox } from '@react-three/drei'
import { useStore } from '../store/useStore'

export function Stove() {
  const bodyMaterial = {
    color: "#a0a0a0",
    metalness: 1,
    roughness: 0.25,
    envMapIntensity: 1,
  }

  const blackMetalMaterial = {
    color: "#111111",
    metalness: 0.9,
    roughness: 0.4,
  }

  const burnerPositions: [number, number, number][] = [
    [-0.5, 0.82, 0.25],
    [0.5, 0.82, 0.25],
    [-0.5, 0.82, -0.25],
    [0.5, 0.82, -0.25],
  ]

  return (
    <group position={[0, 0, 0]}>
      {/* Main Body */}
      <group position={[0, 0.4, 0]}>
        <RoundedBox args={[2.2, 0.8, 1.2]} radius={0.02} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial {...bodyMaterial} color="#d0d0d0" />
        </RoundedBox>
        
        {/* Toe Kick */}
        <mesh position={[0, -0.35, 0.55]}>
          <boxGeometry args={[2.1, 0.1, 0.1]} />
          <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.5} />
        </mesh>
      </group>

      {/* Top Surface */}
      <group position={[0, 0.81, 0.1]}>
        <RoundedBox args={[2.1, 0.04, 1.0]} radius={0.01} smoothness={4} receiveShadow>
          <meshStandardMaterial color="#252525" metalness={0.9} roughness={0.2} />
        </RoundedBox>
      </group>

      {/* Burners */}
      {burnerPositions.map((pos, i) => (
        <group 
          key={i} 
          position={pos}
          onClick={() => useStore.getState().setModalOpen(true)}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          {/* Burner Base */}
          <mesh receiveShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 32]} />
            <meshStandardMaterial {...blackMetalMaterial} />
          </mesh>
          
          {/* Inner Coil Detail */}
          <mesh position={[0, 0.021, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.12, 0.02, 12, 32]} />
            <meshStandardMaterial color="#222222" metalness={1} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.021, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.06, 0.015, 12, 32]} />
            <meshStandardMaterial color="#222222" metalness={1} roughness={0.2} />
          </mesh>

          {/* Grates */}
          <group position={[0, 0.04, 0]}>
            {[0, Math.PI / 2].map((rotation, j) => (
              <mesh key={j} rotation={[0, rotation, 0]}>
                <boxGeometry args={[0.48, 0.02, 0.02]} />
                <meshStandardMaterial {...blackMetalMaterial} />
              </mesh>
            ))}
            {/* Corner diagonal grates */}
            {[Math.PI / 4, -Math.PI / 4].map((rotation, j) => (
              <mesh key={j + 2} rotation={[0, rotation, 0]}>
                <boxGeometry args={[0.4, 0.015, 0.015]} />
                <meshStandardMaterial {...blackMetalMaterial} />
              </mesh>
            ))}
          </group>
        </group>
      ))}

      {/* Back Guard / Control Panel */}
      <group position={[0, 0.9, -0.45]}>
        <RoundedBox args={[2.1, 0.25, 0.1]} radius={0.02} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial {...bodyMaterial} />
        </RoundedBox>
        
        {/* Knobs */}
        {[-0.7, -0.35, 0.35, 0.7].map((x, i) => (
          <group key={i} position={[x, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            {/* Knob Base */}
            <mesh castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.04, 24]} />
              <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.4} />
            </mesh>
            {/* Indicator Notch */}
            <mesh position={[0, 0.025, -0.04]}>
              <boxGeometry args={[0.01, 0.01, 0.03]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Hood */}
      <group position={[0, 2.0, -0.2]}>
        <RoundedBox args={[2.4, 0.3, 1.0]} radius={0.03} smoothness={4} castShadow>
          <meshStandardMaterial {...bodyMaterial} />
        </RoundedBox>
        
        {/* Under-hood panel */}
        <mesh position={[0, -0.151, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.3, 0.9]} />
          <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Light under hood */}
        <mesh position={[0, -0.152, 0.2]}>
          <boxGeometry args={[0.8, 0.01, 0.2]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
      </group>
      
      {/* Front Panel Mesh/Texture */}
      <group position={[0, 0.4, 0.605]}>
        <mesh castShadow>
          <boxGeometry args={[2.0, 0.7, 0.01]} />
          <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.05} />
        </mesh>
        {/* Handle */}
        <mesh position={[0, 0.25, 0.04]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 1.6, 12]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
      </group>
    </group>
  )
}


