import React, { useEffect, useMemo, useState } from 'react'
import { createTask, getTasks, updateTask } from '../api/tasks'

export default function CodingStats() {
  const [items, setItems] = useState([])
  const [minutes, setMinutes] = useState('')

  useEffect(() => {
    getTasks({ category: 'coding' }).then(setItems)
  }, [])

  const totalMinutes = useMemo(() => items.reduce((sum, i)=> sum + (i.progress||0), 0), [items])

  const logToday = async () => {
    const today = new Date()
    const title = `Code ${today.toDateString()}`
    const existing = items.find(i => i.title === title)
    const val = parseInt(minutes || '0', 10)
    if (!val) return
    let saved
    if (existing) saved = await updateTask(existing._id, { progress: (existing.progress||0) + val })
    else saved = await createTask({ title, description: 'Daily coding', frequency: 'daily', category: 'coding', progress: val })
    setItems(prev => {
      const idx = prev.findIndex(p => p._id === saved._id)
      if (idx === -1) return [saved, ...prev]
      const next = [...prev]
      next[idx] = saved
      return next
    })
    setMinutes('')
  }

  return (
    <Widget title="Coding Stats">
      <div className="flex items-center gap-2">
        <input className="p-2 rounded bg-gray-800 border border-gray-700 w-28" placeholder="Minutes" value={minutes} onChange={(e)=>setMinutes(e.target.value)} />
        <button onClick={logToday} className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500">Log</button>
        <div className="ml-auto text-sm text-gray-300">Total: {totalMinutes} min</div>
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {items.slice(0,7).map(i => (
          <li key={i._id} className="flex justify-between">
            <span>{i.title}</span>
            <span className="text-gray-400">{i.progress||0} min</span>
          </li>
        ))}
      </ul>
    </Widget>
  )
}

function Widget({ title, children }){
  return (
    <section className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      {children}
    </section>
  )
}
