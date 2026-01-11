import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import {
  useStore,
  type Task,
  deriveTaskState,
  calculateBurnProgress,
  selectFrontTasks,
  selectBackTasks,
  selectOvenTasks,
} from '../store/useStore'

interface TaskCardProps {
  task: Task
  onComplete: () => void
  variant: 'burner' | 'pot' | 'oven'
}

function TaskCard({ task, onComplete, variant }: TaskCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => task.deadline - Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(task.deadline - Date.now())
    }, 500)
    return () => clearInterval(interval)
  }, [task.deadline])

  const state = deriveTaskState(task)
  const progress = calculateBurnProgress(task)

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(Math.abs(ms) / 1000)
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    const sign = ms < 0 ? '+' : ''
    return `${sign}${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getCardStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '12px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontFamily: 'monospace',
      transition: 'all 0.3s ease',
      border: '2px solid',
      minWidth: '120px',
      textAlign: 'center',
    }

    if (variant === 'pot') {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #8B4513, #654321)',
        borderColor: '#a0522d',
        color: '#fff',
      }
    }

    if (variant === 'oven') {
      const isReady = timeRemaining <= 0
      return {
        ...baseStyle,
        background: isReady
          ? 'linear-gradient(135deg, #ff6b35, #ff4500)'
          : 'linear-gradient(135deg, #4a3000, #2a1a00)',
        borderColor: '#ff6600',
        color: '#fff',
        animation: isReady ? 'pulse 0.5s ease-in-out infinite' : undefined,
      }
    }

    switch (state) {
      case 'raw':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #ffcccc, #ffaaaa)',
          borderColor: '#ff9999',
          color: '#333',
        }
      case 'cooking':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #ffa500, #ff8c00)',
          borderColor: '#ff7700',
          color: '#fff',
        }
      case 'critical':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #ff4500, #cc0000)',
          borderColor: '#ff0000',
          color: '#fff',
          animation: 'pulse 0.3s ease-in-out infinite',
        }
      case 'burnt':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
          borderColor: '#444',
          color: '#888',
        }
    }
  }

  const getStatusLabel = (): string => {
    if (variant === 'pot') return 'SIMMERING'
    if (variant === 'oven') return timeRemaining <= 0 ? 'READY!' : formatTime(timeRemaining)

    switch (state) {
      case 'raw':
        return 'PREPPING'
      case 'cooking':
        return formatTime(timeRemaining)
      case 'critical':
        return `⚠️ ${formatTime(timeRemaining)}`
      case 'burnt':
        return '🔥 BURNT'
    }
  }

  return (
    <div style={getCardStyle()} onClick={onComplete} title="Click to complete">
      <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>
        {task.title.slice(0, 15)}
        {task.title.length > 15 ? '...' : ''}
      </div>
      <div style={{ fontSize: '12px', opacity: 0.9 }}>{getStatusLabel()}</div>
      {variant === 'burner' && (
        <div
          style={{
            marginTop: '6px',
            height: '4px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(progress * 100, 100)}%`,
              background: state === 'burnt' ? '#444' : state === 'critical' ? '#ff0000' : '#00ff00',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      )}
    </div>
  )
}

interface BurnerSlotProps {
  index: number
  task: Task | undefined
  onComplete: (id: string) => void
}

function BurnerSlot({ index, task, onComplete }: BurnerSlotProps) {
  const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

  return (
    <div
      style={{
        gridArea: positions[index],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      <div
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: task
            ? 'radial-gradient(circle, #ff4500 0%, #cc0000 50%, #2a2a2a 100%)'
            : 'radial-gradient(circle, #444 0%, #333 50%, #2a2a2a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: task ? '0 0 20px rgba(255, 69, 0, 0.5)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#1a1a1a',
            border: '2px solid #333',
          }}
        />
      </div>

      {task ? (
        <TaskCard task={task} onComplete={() => onComplete(task.id)} variant="burner" />
      ) : (
        <div
          style={{
            color: '#666',
            fontFamily: 'monospace',
            fontSize: '12px',
            padding: '8px',
          }}
        >
          Empty Burner
        </div>
      )}
    </div>
  )
}

function OvenStatus({ deadline }: { deadline: number }) {
  const [isDone, setIsDone] = useState(() => deadline - Date.now() <= 0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDone(deadline - Date.now() <= 0)
    }, 500)
    return () => clearInterval(interval)
  }, [deadline])

  return <>{isDone ? '🔔 DONE' : '● BAKING'}</>
}

export function Scene2D() {
  const frontTasks = useStore(useShallow(selectFrontTasks))
  const backTasks = useStore(useShallow(selectBackTasks))
  const ovenTasks = useStore(useShallow(selectOvenTasks))
  const completeTask = useStore.getState().completeTask

  const backTask = backTasks[0]
  const ovenTask = ovenTasks[0]

  const getTaskForSlot = (slotId: number) => frontTasks.find((t) => t.slotId === slotId)

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          border: '1px solid #444',
        }}
      >
        <div
          style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingBottom: '16px',
              borderBottom: '1px solid #333',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  color: '#888',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
              >
                Back Burner
              </div>

              <div
                style={{
                  width: '80px',
                  height: '50px',
                  background: 'linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%)',
                  borderRadius: '4px 4px 40% 40%',
                  border: '2px solid #555',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {backTask && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      width: '60%',
                      height: '12px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      animation: 'steam 2s ease-in-out infinite',
                    }}
                  />
                )}
              </div>

              {backTask ? (
                <TaskCard task={backTask} onComplete={() => completeTask(backTask.id)} variant="pot" />
              ) : (
                <div
                  style={{
                    color: '#555',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    padding: '8px',
                  }}
                >
                  Nothing simmering
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateAreas: `
                "top-left top-right"
                "bottom-left bottom-right"
              `,
              gap: '24px',
              justifyContent: 'center',
            }}
          >
            {[0, 1, 2, 3].map((slotId) => (
              <BurnerSlot
                key={slotId}
                index={slotId}
                task={getTaskForSlot(slotId)}
                onComplete={completeTask}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
          borderRadius: '12px',
          padding: '16px 24px',
          border: '2px solid #333',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          minWidth: '200px',
        }}
      >
        <div
          style={{
            color: '#888',
            fontFamily: 'monospace',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Oven
        </div>

        <div
          style={{
            width: '150px',
            height: '60px',
            background: ovenTask
              ? 'linear-gradient(180deg, #ff6600 0%, #cc3300 100%)'
              : 'linear-gradient(180deg, #222 0%, #111 100%)',
            borderRadius: '8px',
            border: '3px solid #444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: ovenTask ? '0 0 30px rgba(255, 102, 0, 0.4)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          {ovenTask && (
            <div
              style={{
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              <OvenStatus deadline={ovenTask.deadline} />
            </div>
          )}
        </div>

        {ovenTask ? (
          <TaskCard task={ovenTask} onComplete={() => completeTask(ovenTask.id)} variant="oven" />
        ) : (
          <div
            style={{
              color: '#555',
              fontFamily: 'monospace',
              fontSize: '12px',
              padding: '8px',
            }}
          >
            Oven empty
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes steam {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 0.6; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
