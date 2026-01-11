import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Suspense, useState } from 'react'

import { CameraRig } from './components/CameraRig'
import { Stove } from './components/Stove'
import { FrontBurners } from './components/FrontBurners'
import { BackBurner } from './components/BackBurner'
import { Oven } from './components/Oven'
import { Sink } from './components/Sink'
import { SteamParticles } from './components/SteamParticles'
import { TicketRack } from './components/TicketRack'
import { Clock } from './components/Clock'
import { Counter } from './components/Counter'
import { AudioManager } from './components/AudioManager'
import { AddTaskModal } from './components/AddTaskModal'
import { CounterNoteModal } from './components/CounterNoteModal'
import { Scene2D } from './components/Scene2D'
import {
  useStore,
  selectAudioUnlocked,
  selectCompletedCount,
  selectBurntCount,
  selectCameraView,
} from './store/useStore'
import { detectWebGLSupport } from './utils/webgl'

function StartOverlay() {
  const audioUnlocked = useStore(selectAudioUnlocked)
  const unlockAudio = useStore.getState().unlockAudio

  if (audioUnlocked) return null

  return (
    <div className="start-overlay" onClick={unlockAudio}>
      <h1>THE LINE</h1>
      <p>Click anywhere to start your shift</p>
    </div>
  )
}

function Scene3D() {
  return (
    <>
      <CameraRig />

      <ambientLight intensity={0.4} color="#ffd4a3" />
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[0, 4, 1]} intensity={2.0} color="#fff4e5" />
      <pointLight position={[-4, 3, 2]} intensity={1.5} color="#ffffff" />
      <pointLight position={[4, 3, 2]} intensity={1.5} color="#ffffff" />

      <group position={[0, 4.8, 2]}>
        <mesh position={[-2, 0, 0]}>
          <boxGeometry args={[1.5, 0.1, 0.4]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-2, -0.051, 0]}>
          <boxGeometry args={[1.4, 0.01, 0.3]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
        </mesh>
        <mesh position={[2, 0, 0]}>
          <boxGeometry args={[1.5, 0.1, 0.4]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[2, -0.051, 0]}>
          <boxGeometry args={[1.4, 0.01, 0.3]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
        </mesh>
      </group>

      <Suspense fallback={null}>
        <Environment preset="warehouse" environmentIntensity={0.5} />
      </Suspense>

      <Stove />
      <FrontBurners />
      
      <group position={[0, 0, 6]}>
        <group>
            <mesh position={[0, 1.5, 0.45]} receiveShadow>
                <boxGeometry args={[6, 3, 0.1]} />
                <meshStandardMaterial color="#999" roughness={0.2} metalness={0.8} />
            </mesh>
            
            <mesh position={[0, 0.8, 0]} receiveShadow>
                <boxGeometry args={[6, 0.05, 1.0]} />
                <meshStandardMaterial color="#888" roughness={0.2} metalness={0.9} />
            </mesh>
            
            <mesh position={[0, 0.4, 0.45]} receiveShadow>
                <boxGeometry args={[6, 0.8, 0.9]} />
                <meshStandardMaterial color="#666" roughness={0.4} metalness={0.6} />
            </mesh>

            <mesh position={[0, 2.5, 0.35]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 6, 16]} />
              <meshStandardMaterial color="#555" metalness={1} roughness={0.4} />
            </mesh>
            <mesh position={[0, 2.3, 0.35]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 6, 16]} />
              <meshStandardMaterial color="#555" metalness={1} roughness={0.4} />
            </mesh>
        </group>

        <BackBurner position={[0, 0.85, 0]} />
        
        <Oven position={[-1.8, 1.2, 0.4]} />

        <Sink position={[1.8, 0, 0]} rotation={[0, Math.PI, 0]} />

        <group position={[-0.8, 0.825, 0.1]} rotation={[0, 0.1, 0]}>
          {[0, 0.015, 0.03, 0.045].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <boxGeometry args={[0.4, 0.01, 0.3]} />
              <meshStandardMaterial color="#aaa" metalness={1} roughness={0.2} />
            </mesh>
          ))}
        </group>

        <group position={[0.7, 0.825, -0.2]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
            <meshStandardMaterial color="#444" roughness={0.5} />
          </mesh>
          <mesh position={[0.1, 0.04, 0.05]}>
            <cylinderGeometry args={[0.03, 0.03, 0.08, 16]} />
            <meshStandardMaterial color="#666" roughness={0.5} />
          </mesh>
        </group>
      </group>

      <SteamParticles />

      <TicketRack />
      <Clock />
      <Counter />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#3a1c1a" roughness={0.9} metalness={0.05} />
      </mesh>
      <gridHelper args={[40, 20, "#111", "#1a1a1a"]} position={[0, 0.001, 0]} />

      <group position={[0, 5, -5]}>
        <mesh position={[0, -3.5, 0]}>
          <planeGeometry args={[40, 3]} />
          <meshStandardMaterial color="#777" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <planeGeometry args={[40, 5]} />
          <meshStandardMaterial color="#ddd" roughness={0.2} />
        </mesh>
        <mesh position={[0, -2, 0.01]}>
          <boxGeometry args={[40, 0.05, 0.05]} />
          <meshStandardMaterial color="#555" metalness={1} roughness={0.2} />
        </mesh>
      </group>

      <group position={[-10, 5, 3.5]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, -3.5, 0]}>
          <planeGeometry args={[20, 3]} />
          <meshStandardMaterial color="#777" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <planeGeometry args={[20, 5]} />
          <meshStandardMaterial color="#ddd" roughness={0.2} />
        </mesh>
      </group>

      <group position={[10, 5, 3.5]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, -3.5, 0]}>
          <planeGeometry args={[20, 3]} />
          <meshStandardMaterial color="#777" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <planeGeometry args={[20, 5]} />
          <meshStandardMaterial color="#ddd" roughness={0.2} />
        </mesh>
      </group>
    </>
  )
}

function HUD() {
  const completedCount = useStore(selectCompletedCount)
  const burntCount = useStore(selectBurntCount)
  const setModalOpen = useStore.getState().setModalOpen
  const cameraView = useStore(selectCameraView)
  const setCameraView = useStore.getState().setCameraView

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        right: '16px',
        color: '#fff',
        fontFamily: 'monospace',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: '#00ff00', fontWeight: 'bold' }}>SERVED: {completedCount}</span>
          {burntCount > 0 && <span style={{ color: '#ff4444', marginLeft: '16px', fontWeight: 'bold' }}>BURNT: {burntCount}</span>}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            background: '#ff6b35',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          + NEW ORDER
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
        <button
          onClick={() => setCameraView('front')}
          style={{
            background: cameraView === 'front' ? '#fff' : 'rgba(0,0,0,0.5)',
            color: cameraView === 'front' ? '#000' : '#fff',
            border: '1px solid #fff',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
          }}
        >
          FRONT
        </button>
        <button
          onClick={() => setCameraView('back')}
          style={{
            background: cameraView === 'back' ? '#fff' : 'rgba(0,0,0,0.5)',
            color: cameraView === 'back' ? '#000' : '#fff',
            border: '1px solid #fff',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
          }}
        >
          BACK
        </button>
      </div>
    </div>
  )
}

function App() {
  const [webglSupported] = useState(() => detectWebGLSupport())

  return (
    <>
      {webglSupported ? (
        <Canvas shadows camera={{ position: [0, 1.6, 2.5], fov: 55 }}>
          <Scene3D />
        </Canvas>
      ) : (
        <Scene2D />
      )}

      <HUD />
      <AddTaskModal />
      <CounterNoteModal />
      <AudioManager />
      <StartOverlay />
    </>
  )
}

export default App
