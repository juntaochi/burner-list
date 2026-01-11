import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useStore, selectCameraView } from '../store/useStore'

const RADIUS = 2.5
const HEIGHT = 1.6
const DAMP_FACTOR = 0.05

export function CameraRig() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!)
  const cameraView = useStore(selectCameraView)
  
  const currentRotationY = useRef(0)

  useFrame((state) => {
    if (!cameraRef.current) return

    const targetRotationY = cameraView === 'front' ? 0 : Math.PI

    currentRotationY.current = THREE.MathUtils.lerp(
      currentRotationY.current,
      targetRotationY,
      DAMP_FACTOR
    )

    const { x, y } = state.pointer
    
    const parallaxX = x * 0.1
    const parallaxY = y * 0.05

    cameraRef.current.position.set(parallaxX, HEIGHT + parallaxY, RADIUS)
    
    cameraRef.current.rotation.set(-parallaxY * 0.5, currentRotationY.current + parallaxX * 0.5, 0, 'YXZ')
  })

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, HEIGHT, RADIUS]} fov={55} near={0.1} far={100} />
}


