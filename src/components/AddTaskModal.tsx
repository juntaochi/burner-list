import { useState, useRef, useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { 
  useStore, 
  selectModalOpen, 
  selectTasks,
  hasAvailableSlot,
  type TaskType
} from '../store/useStore'

interface Option {
  value: string | number
  label: string
  sublabel?: string
  disabled?: boolean
  color?: string
}

interface CustomSelectProps {
  options: Option[]
  value: string | number
  onChange: (value: string | number) => void
  label: string
}

function CustomSelect({ options, value, onChange, label }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative mb-3" ref={containerRef}>
      <label className="block text-[8px] text-white/30 uppercase tracking-[0.2em] mb-1 ml-0.5 font-bold">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left bg-white/5 border ${isOpen ? 'border-white/20' : 'border-white/10'} rounded px-2 py-1.5 text-white flex items-center justify-between hover:bg-white/10 transition-colors`}
      >
        <div className="flex flex-col overflow-hidden">
          <span className={`text-[11px] font-medium truncate ${selectedOption?.color || 'text-white'}`}>
            {selectedOption?.label}
          </span>
        </div>
        <span className={`text-white/20 text-[8px] transition-transform ml-1 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#0a0a0a] border border-white/10 rounded shadow-2xl overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full text-left px-2 py-2 flex flex-col transition-colors
                ${option.disabled ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5 cursor-pointer'}
                ${option.value === value ? 'bg-white/5' : ''}
              `}
            >
              <span className={`text-[11px] font-bold ${option.color || 'text-white'}`}>
                {option.label}
              </span>
              {option.sublabel && (
                <span className="text-[8px] text-white/30 mt-0.5 leading-tight">{option.sublabel}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function AddTaskModal() {
  const modalOpen = useStore(selectModalOpen)
  const setModalOpen = useStore.getState().setModalOpen
  const addTask = useStore.getState().addTask
  const tasks = useStore(useShallow(selectTasks))

  const [title, setTitle] = useState('')
  const [type, setType] = useState<TaskType>('front')
  const [duration, setDuration] = useState(5)

  if (!modalOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    addTask(title.trim(), type, duration)
    handleClose()
  }

  const handleClose = () => {
    setModalOpen(false)
    setTitle('')
    setType('front')
    setDuration(5)
  }

  const frontAvailable = hasAvailableSlot(tasks, 'front')
  const backAvailable = hasAvailableSlot(tasks, 'back')

  const typeOptions: Option[] = [
    {
      value: 'front',
      label: 'Front Burner',
      sublabel: 'For urgent and important tasks.',
      disabled: !frontAvailable,
      color: 'text-orange-300'
    },
    {
      value: 'back',
      label: 'Back Burner',
      sublabel: 'For important but not urgent tasks.',
      disabled: !backAvailable,
      color: 'text-blue-300'
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <div 
        className="w-full max-w-[240px] bg-black/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden font-sans transform transition-all scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3 py-2 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-white font-medium text-xs tracking-tight uppercase opacity-80">New Order</h2>
          <button 
            onClick={handleClose}
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-3 pt-2">
          <div className="mb-3">
            <label className="block text-[8px] text-white/30 uppercase tracking-[0.2em] mb-1 ml-0.5 font-bold">
              Order Name
            </label>
            <input
              type="text"
              placeholder="Order ID..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white placeholder-white/10 focus:outline-none focus:border-white/20 transition-all font-medium text-[11px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <CustomSelect
              label="Station"
              options={typeOptions}
              value={type}
              onChange={(val) => setType(val as TaskType)}
            />
            
            <div className="relative mb-3">
              <label className="block text-[8px] text-white/30 uppercase tracking-[0.2em] mb-1 ml-0.5 font-bold">
                Minutes
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white focus:outline-none focus:border-white/20 transition-all font-medium text-[11px]"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-1 pt-3 border-t border-white/5">
            <button 
              type="button" 
              onClick={handleClose}
              className="flex-1 px-2 py-1.5 rounded border border-white/5 text-white/40 hover:text-white hover:bg-white/5 transition-colors font-medium text-[9px] uppercase tracking-wider"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!title.trim()}
              className="flex-1 px-2 py-1.5 rounded bg-white text-black font-bold hover:bg-gray-200 disabled:opacity-10 disabled:grayscale transition-colors text-[9px] uppercase tracking-wider"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
