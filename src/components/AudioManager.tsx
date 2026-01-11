import { useEffect, useRef } from 'react'
import { Howl, Howler } from 'howler'
import { useStore } from '../store/useStore'

const SOUNDS = {
  ambience: '/sounds/ambience.mp3',
  sizzle: '/sounds/sizzle.mp3',
  ding: '/sounds/ding.mp3',
}

class AudioEngine {
  private ambience: Howl | null = null
  private sizzle: Howl | null = null
  private ding: Howl | null = null
  private initialized = false

  init() {
    if (this.initialized) return

    this.ambience = new Howl({
      src: [SOUNDS.ambience],
      loop: true,
      volume: 0.15,
      html5: true,
      onloaderror: () => console.warn('Ambience audio not found - add public/sounds/ambience.mp3'),
    })

    this.sizzle = new Howl({
      src: [SOUNDS.sizzle],
      loop: true,
      volume: 0,
      html5: true,
      onloaderror: () => console.warn('Sizzle audio not found - add public/sounds/sizzle.mp3'),
    })

    this.ding = new Howl({
      src: [SOUNDS.ding],
      volume: 0.6,
      onloaderror: () => console.warn('Ding audio not found - add public/sounds/ding.mp3'),
    })

    this.initialized = true
  }

  start() {
    if (!this.initialized) this.init()
    this.ambience?.play()
    this.sizzle?.play()
  }

  setSizzleVolume(burnerCount: number) {
    const targetVolume = Math.min(burnerCount * 0.15, 0.5)
    this.sizzle?.volume(targetVolume)
  }

  playDing() {
    this.ding?.play()
  }

  setMasterVolume(volume: number) {
    Howler.volume(volume)
  }
}

const audioEngine = new AudioEngine()

export function AudioManager() {
  const audioUnlocked = useStore((state) => state.audioUnlocked)
  const activeBurnerCount = useStore((state) => state.tasks.filter((t) => t.type === 'front').length)
  const previousCount = useRef(0)
  const completedCount = useStore((state) => state.completedCount)
  const previousCompleted = useRef(0)

  useEffect(() => {
    if (audioUnlocked) {
      audioEngine.start()
    }
  }, [audioUnlocked])

  useEffect(() => {
    audioEngine.setSizzleVolume(activeBurnerCount)
    previousCount.current = activeBurnerCount
  }, [activeBurnerCount])

  useEffect(() => {
    if (completedCount > previousCompleted.current) {
      audioEngine.playDing()
    }
    previousCompleted.current = completedCount
  }, [completedCount])

  return null
}
