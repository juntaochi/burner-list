import { useRef, useState, useEffect } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

export function Clock() {
  const [time, setTime] = useState(new Date())
  const boxRef = useRef<THREE.Mesh>(null!)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  return (
    <group position={[0.7, 1.85, -0.55]}>
      <mesh ref={boxRef} castShadow>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.1} />
      </mesh>

      <Text position={[0, 0, 0.03]} fontSize={0.06} color="#00ff44" anchorX="center" anchorY="middle">
        {formatTime(time)}
      </Text>

      <mesh position={[0, 0, 0.026]}>
        <boxGeometry args={[0.32, 0.09, 0.001]} />
        <meshStandardMaterial color="#001a00" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}
