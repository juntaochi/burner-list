import { useState, useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { useStore, selectCounterNoteOpen, selectNoteTasks } from '../store/useStore'

export function CounterNoteModal() {
  const isOpen = useStore(selectCounterNoteOpen)
  const setOpen = useStore.getState().setCounterNoteOpen
  const noteTasks = useStore(useShallow(selectNoteTasks))
  const addTask = useStore.getState().addTask
  const updateTask = useStore.getState().updateTask

  const [content, setContent] = useState('')
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (noteTasks.length > 0) {
        setContent(noteTasks[0].content || '')
      } else {
        setContent('')
      }
    }
  }, [isOpen, noteTasks])

  if (!isOpen) return null

  const handleSave = () => {
    if (noteTasks.length > 0) {
      updateTask(noteTasks[0].id, { content, title: 'Counter Note' })
    } else {
      if (content.trim()) {
         addTask('Counter Note', 'note', 60 * 24, undefined, content)
      }
    }
    setOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const renderMarkdown = (text: string) => {
    if (!text) return null
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mb-2">{line.slice(2)}</h1>
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mb-2">{line.slice(3)}</h2>
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mb-1">{line.slice(4)}</h3>
      
      if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.slice(2)}</li>
      if (line.startsWith('* ')) return <li key={i} className="ml-4">{line.slice(2)}</li>

      if (line.trim() === '') return <br key={i} />

      const parts = line.split(/(\*\*.*?\*\*)/g)
      return (
        <p key={i} className="mb-1">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>
            }
            return part
          })}
        </p>
      )
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm" onClick={handleClose}>
      <div 
        className="bg-[#f0e6d2] w-full max-w-lg rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[70vh] border-4 border-[#d4c5a9]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#e6d5b8] p-3 border-b border-[#d4c5a9] flex justify-between items-center">
          <h2 className="text-[#5c4d3c] font-bold text-lg tracking-wider uppercase">Counter Note</h2>
          <div className="flex gap-2">
             <button 
                onClick={() => setIsPreview(!isPreview)}
                className="px-2 py-1 text-[10px] bg-[#5c4d3c] text-[#f0e6d2] rounded hover:bg-[#4a3b2c] transition-colors"
             >
               {isPreview ? 'EDIT' : 'PREVIEW'}
             </button>
             <button onClick={handleClose} className="text-[#5c4d3c] hover:text-red-600 font-bold px-2">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 min-h-[200px] text-[#2d2d2d] font-mono text-sm leading-relaxed relative">
           <div className="absolute inset-0 pointer-events-none opacity-10" 
                style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 2rem', marginTop: '1.9rem' }}>
           </div>

           {isPreview ? (
             <div className="prose prose-stone max-w-none">
               {renderMarkdown(content)}
             </div>
           ) : (
             <textarea
               className="w-full h-full bg-transparent border-none outline-none resize-none z-10 relative"
               placeholder="# Today's Specials&#10;&#10;- Soup: Tomato Basil&#10;- Fish: Salmon&#10;&#10;**Don't forget to prep the onions!**"
               value={content}
               onChange={(e) => setContent(e.target.value)}
               autoFocus
             />
           )}
        </div>

        <div className="p-3 bg-[#e6d5b8] border-t border-[#d4c5a9] flex justify-between items-center">
           <span className="text-[10px] text-[#8c7b66] uppercase tracking-widest">Markdown Supported</span>
           <div className="flex gap-2">
             <button 
               onClick={handleClose}
               className="px-3 py-1.5 text-[#5c4d3c] font-bold text-xs hover:bg-[#d4c5a9] rounded transition-colors"
             >
               CANCEL
             </button>
             <button 
               onClick={handleSave}
               className="px-4 py-1.5 bg-[#ff6b35] text-white font-bold text-xs rounded shadow-md hover:bg-[#e85a24] transition-transform active:scale-95"
             >
               SAVE NOTE
             </button>
           </div>
        </div>
      </div>
    </div>
  )
}
