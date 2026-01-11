import { useState, useEffect } from 'react'
import { Text, Html, useCursor } from '@react-three/drei'
import { useStore, type TaskType, type Task } from '../store/useStore'
import { useShallow } from 'zustand/shallow'

interface TicketProps {
  position: [number, number, number]
  task?: Task
  slotId: number
  isMenuOpen: boolean
  onToggleMenu: (slotId: number) => void
  onCloseMenu: () => void
}

function Ticket({ position, task, slotId, isMenuOpen, onToggleMenu, onCloseMenu }: TicketProps) {
  const [hovered, setHover] = useState(false)
  useCursor(hovered)
  
  const addTask = useStore.getState().addTask
  const [creationStep, setCreationStep] = useState<'type' | 'details'>('type')
  const [newOrderType, setNewOrderType] = useState<TaskType>('front')
  const [newOrderTitle, setNewOrderTitle] = useState('')
  const [newOrderDuration, setNewOrderDuration] = useState(5)
  const [hasTimer, setHasTimer] = useState(true)

  useEffect(() => {
    if (!isMenuOpen) {
      setCreationStep('type')
      setNewOrderTitle('')
      setNewOrderDuration(5)
      setHasTimer(true)
    }
  }, [isMenuOpen])

  const handleCreate = () => {
    if (!newOrderTitle.trim()) return
    const duration = hasTimer ? newOrderDuration : 24 * 60 
    addTask(newOrderTitle.trim(), newOrderType, duration)
    onCloseMenu()
  }

  const typeConfig: Record<string, { label: string; color: string; bg: string; border: string; desc: string }> = {
    front: { label: 'Front Burner', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', desc: 'For urgent and important tasks.' },
    back: { label: 'Back Burner', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', desc: 'For important but not urgent tasks.' },
    sink: { label: 'The Sink', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', desc: 'For tasks that are done or need cleaning.' },
    oven: { label: 'Oven', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', desc: 'High heat, set and forget.' },
    note: { label: 'Note', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', desc: 'A quick reminder or detail.' },
  }

  const creationTypes: TaskType[] = ['front', 'back', 'sink']

  return (
    <group position={position}>
      <mesh 
        onClick={(e) => {
          e.stopPropagation()
          onToggleMenu(slotId)
        }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[0.25, 0.35, 0.005]} />
        <meshStandardMaterial 
          color={task ? "#fdfbf7" : "#ffffff"} 
          transparent
          opacity={task ? 1 : 0.2}
          roughness={0.8}
          metalness={0.1}
          emissive={task ? "#000000" : "#ffffff"}
          emissiveIntensity={task ? 0 : (hovered ? 0.2 : 0.1)}
        />
      </mesh>

      {task && (
        <group position={[0, 0, 0.004]}>
          <Text 
            position={[0, 0.05, 0]} 
            fontSize={0.035} 
            color="#1a1a1a" 
            anchorX="center" 
            anchorY="middle" 
            maxWidth={0.22}
          >
            {task.title}
          </Text>
          <Text 
            position={[0, -0.05, 0]} 
            fontSize={0.02} 
            color="#666666" 
            anchorX="center" 
            anchorY="middle" 
          >
            #{task.id.slice(0, 4)}
          </Text>
        </group>
      )}

      {!task && (
        <Text 
          position={[0, 0, 0.004]} 
          fontSize={0.04} 
          color="white" 
          fillOpacity={0.5}
          anchorX="center" 
          anchorY="middle"
        >
          +
        </Text>
      )}

      {isMenuOpen && !task && (
        <Html 
          position={[0, -0.18, 0.05]} 
          center 
          transform 
          zIndexRange={[100, 0]} 
          scale={0.22}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div 
            className="w-52 bg-[#0a0a0a] backdrop-blur-2xl border border-white/10 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden font-sans text-white p-3 flex flex-col gap-3 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            
            {creationStep === 'type' ? (
              <>
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1 font-bold">New Ticket</div>
                  <div className="text-lg font-light text-white/90">Select Station</div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {creationTypes.map((type) => (
                    <button 
                      key={type}
                      className={`w-full text-left px-4 py-3 ${typeConfig[type].bg} ${typeConfig[type].border} border rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between group`}
                      onClick={() => {
                        setNewOrderType(type)
                        setCreationStep('details')
                      }}
                    >
                      <div className="flex flex-col">
                        <span className={`${typeConfig[type].color} font-medium text-[11px]`}>{typeConfig[type].label}</span>
                        <span className="text-[8px] text-white/30 leading-tight">
                          {typeConfig[type].desc}
                        </span>
                      </div>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50">→</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-[10px] uppercase tracking-[0.2em] font-bold ${typeConfig[newOrderType].color}`}>
                      {typeConfig[newOrderType].label}
                    </div>
                    <div className="text-lg font-light text-white/90">Order Details</div>
                  </div>
                  <button 
                    onClick={() => setCreationStep('type')}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-xs text-white/40 italic">back</span>
                  </button>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/30 uppercase tracking-widest ml-1">Title</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Ribeye Steak"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                    value={newOrderTitle}
                    onChange={(e) => setNewOrderTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreate()
                      if (e.key === 'Escape') onCloseMenu()
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] text-white/30 uppercase tracking-widest">Duration</label>
                    <button 
                      onClick={() => setHasTimer(!hasTimer)}
                      className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${
                        hasTimer 
                        ? 'border-white/10 text-white/40 hover:text-white' 
                        : 'border-orange-400/50 text-orange-400 bg-orange-400/10'
                      }`}
                    >
                      {hasTimer ? 'Disable Timer' : 'No Timer Set'}
                    </button>
                  </div>
                  
                  {hasTimer ? (
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1">
                      <input
                        type="range"
                        min="1"
                        max="60"
                        value={newOrderDuration}
                        onChange={(e) => setNewOrderDuration(parseInt(e.target.value))}
                        className="flex-1 ml-2 accent-white"
                      />
                      <div className="w-12 text-center font-mono text-sm font-bold text-white/90">
                        {newOrderDuration}m
                      </div>
                    </div>
                  ) : (
                    <div className="py-3 px-4 bg-white/5 border border-white/5 border-dashed rounded-xl text-center">
                      <span className="text-[10px] text-white/20 italic">This task will never burn</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!newOrderTitle.trim()}
                  className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 active:scale-[0.98] disabled:opacity-20 disabled:grayscale transition-all text-xs uppercase tracking-widest mt-2"
                >
                  Confirm Order
                </button>
              </div>
            )}
            
          </div>
        </Html>
      )}
    </group>
  )
}

export function TicketRack() {
  const frontTasks = useStore(useShallow((state) => state.tasks.filter((t) => t.type === 'front')))
  
  const slots = [0, 1, 2, 3]
  const [openMenuSlot, setOpenMenuSlot] = useState<number | null>(null)

  const handleToggleMenu = (slotId: number) => {
    setOpenMenuSlot(current => current === slotId ? null : slotId)
  }

  return (
    <group position={[0, 1.7, -0.6]}>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 1.8, 16]} />
        <meshStandardMaterial color="#888888" metalness={1} roughness={0.1} envMapIntensity={1.5} />
      </mesh>

      <mesh position={[-0.9, 0.1, 0]} castShadow>
        <boxGeometry args={[0.02, 0.2, 0.02]} />
        <meshStandardMaterial color="#888888" metalness={1} roughness={0.1} envMapIntensity={1.5} />
      </mesh>
      <mesh position={[0.9, 0.1, 0]} castShadow>
        <boxGeometry args={[0.02, 0.2, 0.02]} />
        <meshStandardMaterial color="#888888" metalness={1} roughness={0.1} envMapIntensity={1.5} />
      </mesh>

      {slots.map((slotIndex) => {
        const taskInSlot = frontTasks.find(t => t.slotId === slotIndex)
        const xPos = -0.6 + slotIndex * 0.4

        return (
          <Ticket 
            key={slotIndex}
            slotId={slotIndex}
            position={[xPos, 0, 0]}
            task={taskInSlot}
            isMenuOpen={openMenuSlot === slotIndex}
            onToggleMenu={handleToggleMenu}
            onCloseMenu={() => setOpenMenuSlot(null)}
          />
        )
      })}
    </group>
  )
}
