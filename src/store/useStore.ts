import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

export type TaskType = 'front' | 'back' | 'oven' | 'note' | 'sink'
export type CameraView = 'front' | 'back'
export type TaskState = 'raw' | 'cooking' | 'critical' | 'burnt'

export interface Task {
  id: string
  title: string
  notes?: string
  content?: string
  type: TaskType
  createdAt: number
  deadline: number
  slotId: number
}

interface StoreState {
  tasks: Task[]
  audioUnlocked: boolean
  modalOpen: boolean
  counterNoteOpen: boolean
  cameraView: CameraView
  completedCount: number
  burntCount: number
}

interface StoreActions {
  addTask: (title: string, type: TaskType, durationMinutes: number, notes?: string, content?: string) => void
  updateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'notes' | 'content'>>) => void
  updateTaskNotes: (id: string, notes: string) => void
  completeTask: (id: string) => void
  removeTask: (id: string) => void
  setModalOpen: (open: boolean) => void
  setCounterNoteOpen: (open: boolean) => void
  setCameraView: (view: CameraView) => void
  unlockAudio: () => void
}

type Store = StoreState & StoreActions

export const calculateBurnProgress = (task: Task): number => {
  const now = Date.now()
  const duration = task.deadline - task.createdAt
  const elapsed = now - task.createdAt
  return elapsed / duration
}

export const deriveTaskState = (task: Task): TaskState => {
  if (task.type === 'back' || task.type === 'oven' || task.type === 'note' || task.type === 'sink') return 'cooking'

  const progress = calculateBurnProgress(task)
  if (progress < 0.2) return 'raw'
  if (progress < 0.8) return 'cooking'
  if (progress < 1.0) return 'critical'
  return 'burnt'
}

const getAvailableSlot = (tasks: Task[], type: TaskType): number | null => {
  if (type === 'oven' || type === 'back' || type === 'note' || type === 'sink') {
    // Return a unique slot ID for types with unlimited slots
    const typeTasks = tasks.filter((t) => t.type === type)
    if (typeTasks.length === 0) return 0
    return Math.max(...typeTasks.map((t) => t.slotId)) + 1
  }
  
  const typeTasks = tasks.filter((t) => t.type === type)
  const usedSlots = new Set(typeTasks.map((t) => t.slotId))
  const maxSlots = 4 // Only front has 4 slots now
  
  for (let i = 0; i < maxSlots; i++) {
    if (!usedSlots.has(i)) return i
  }
  return null
}

export const useStore = create<Store>()((set, get) => ({
  tasks: [],
  audioUnlocked: false,
  modalOpen: false,
  counterNoteOpen: false,
  cameraView: 'front',
  completedCount: 0,
  burntCount: 0,

  addTask: (title, type, durationMinutes, notes, content) => {
    const slotId = getAvailableSlot(get().tasks, type)
    if (slotId === null) {
      console.warn(`No available slot for task type: ${type}`)
      return
    }

    const now = Date.now()
    const duration = durationMinutes * 60 * 1000

    const newTask: Task = {
      id: uuidv4(),
      title,
      type,
      notes,
      content,
      createdAt: now,
      deadline: now + duration,
      slotId: slotId,
    }

    set((state) => ({
      tasks: [...state.tasks, newTask],
      modalOpen: false,
    }))
  },
  
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  },
  
  updateTaskNotes: (id, notes) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, notes } : t)),
    }))
  },

  completeTask: (id) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return

    const wasBurnt = deriveTaskState(task) === 'burnt'

    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      completedCount: state.completedCount + 1,
      burntCount: wasBurnt ? state.burntCount + 1 : state.burntCount,
    }))
  },

  removeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }))
  },

  setModalOpen: (open) => set({ modalOpen: open }),
  setCounterNoteOpen: (open) => set({ counterNoteOpen: open }),
  setCameraView: (view) => set({ cameraView: view }),
  unlockAudio: () => set({ audioUnlocked: true }),
}))

export const selectFrontTasks = (state: Store) => state.tasks.filter((t) => t.type === 'front')
export const selectBackTasks = (state: Store) => state.tasks.filter((t) => t.type === 'back')
export const selectOvenTasks = (state: Store) => state.tasks.filter((t) => t.type === 'oven')
export const selectSinkTasks = (state: Store) => state.tasks.filter((t) => t.type === 'sink')
export const selectNoteTasks = (state: Store) => state.tasks.filter((t) => t.type === 'note')
export const selectTasks = (state: Store) => state.tasks
export const selectCompleteTask = (state: Store) => state.completeTask
export const selectAddTask = (state: Store) => state.addTask
export const selectUpdateTask = (state: Store) => state.updateTask
export const selectUpdateTaskNotes = (state: Store) => state.updateTaskNotes
export const selectSetModalOpen = (state: Store) => state.setModalOpen
export const selectSetCounterNoteOpen = (state: Store) => state.setCounterNoteOpen
export const selectSetCameraView = (state: Store) => state.setCameraView
export const selectCameraView = (state: Store) => state.cameraView
export const selectUnlockAudio = (state: Store) => state.unlockAudio
export const selectAudioUnlocked = (state: Store) => state.audioUnlocked
export const selectModalOpen = (state: Store) => state.modalOpen
export const selectCounterNoteOpen = (state: Store) => state.counterNoteOpen
export const selectCompletedCount = (state: Store) => state.completedCount
export const selectBurntCount = (state: Store) => state.burntCount
export const selectActiveBurnerCount = (state: Store) => state.tasks.filter((t) => t.type === 'front').length

export const hasAvailableSlot = (tasks: Task[], type: TaskType): boolean => {
  return getAvailableSlot(tasks, type) !== null
}

