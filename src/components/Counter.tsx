import { useShallow } from 'zustand/shallow'
import { useStore, selectNoteTasks } from '../store/useStore'
import { Text, RoundedBox } from '@react-three/drei'

export function Counter() {
  const setCounterNoteOpen = useStore.getState().setCounterNoteOpen
  const noteTasks = useStore(useShallow(selectNoteTasks))
  
  const hasNote = noteTasks.length > 0 && noteTasks[0].content && noteTasks[0].content.trim().length > 0

  return (
    <group position={[-1.8, 0, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.9, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      <group position={[0, 0.45, 0.301]}>
        <mesh position={[-0.2, 0, 0]}>
          <cylinderGeometry args={[0.002, 0.002, 0.8, 6]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.002, 0.002, 0.8, 6]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.85, 6]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>

      <mesh position={[0, 1.15, -0.28]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.5, 0.02]} />
        <meshStandardMaterial 
          color="#888" 
          roughness={0.1} 
          metalness={0.8} 
          envMapIntensity={1}
        />
      </mesh>
      
      <group position={[0, 0.925, 0]}>
        <RoundedBox 
          args={[0.9, 0.05, 0.6]} 
          radius={0.01} 
          smoothness={4}
          castShadow 
          receiveShadow
        >
          <meshStandardMaterial 
            color="#ffffff" 
            roughness={0.1} 
            metalness={0.2} 
            envMapIntensity={1.5}
          />
        </RoundedBox>

        <mesh position={[0, 0, 0.3]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.9, 12, 1, false, 0, Math.PI]} />
          <meshStandardMaterial 
            color="#ffffff" 
            roughness={0.1} 
            metalness={0.2}
            envMapIntensity={1.5}
          />
        </mesh>
      </group>

      <mesh position={[0, 1.5, 0]} onClick={(e) => {
        e.stopPropagation()
        setCounterNoteOpen(true)
      }} visible={false}>
         <boxGeometry args={[1, 1, 1]} />
         <meshBasicMaterial color="red" wireframe />
      </mesh>

      <group position={[0, 0.95, 0]}>
        {hasNote && (
          <group position={[0, 0.01, 0.2]} rotation={[0, 0.1, 0]}>
             <mesh castShadow receiveShadow>
               <boxGeometry args={[0.3, 0.005, 0.4]} />
               <meshStandardMaterial color="#fff" />
             </mesh>
             <mesh position={[0, 0.004, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[0.25, 0.35]} />
                <meshBasicMaterial color="#eee" />
             </mesh>
              <Text 
                position={[0, 0.01, -0.1]} 
                rotation={[-Math.PI/2, 0, 0]} 
                fontSize={0.012} 
                color="#333"
                maxWidth={0.25}
                textAlign="left"
              >
                {noteTasks[0].content?.slice(0, 100) + '...'}
              </Text>
          </group>
        )}

        <mesh position={[-0.1, 0.05, 0.05]} castShadow>
            <cylinderGeometry args={[0.03, 0.025, 0.12, 8]} />
            <meshStandardMaterial color="#ff6600" roughness={0.7} />
        </mesh>
        <mesh position={[0.05, 0.05, -0.05]} castShadow>
            <cylinderGeometry args={[0.025, 0.02, 0.1, 8]} />
            <meshStandardMaterial color="#ff6600" roughness={0.7} />
        </mesh>
        
        <mesh position={[0.2, 0.01, -0.1]} castShadow rotation={[0, 0.3, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 0.15, 8]} />
            <meshStandardMaterial color="#333" />
        </mesh>
      </group>
    </group>
  )
}
