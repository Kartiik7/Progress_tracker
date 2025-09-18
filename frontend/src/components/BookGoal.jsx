import React, { useEffect, useMemo, useState } from 'react'
import { createTask, getTasks, updateTask } from '../api/tasks'

export default function BookGoal() {
  const [goal, setGoal] = useState(null)
  const [title, setTitle] = useState('Read a book')
  const [target, setTarget] = useState('300') // pages
  const [add, setAdd] = useState('')

  useEffect(() => {
    getTasks({ category: 'reading' }).then((items)=>{
      setGoal(items[0] || null)
      if (items[0]) { setTitle(items[0].title); setTarget(String(items[0].target||0)) }
    })
  }, [])

  const pct = useMemo(() => {
    const p = goal?.progress || 0
    const t = goal?.target || parseInt(target||'0',10)
    if (!t) return 0
    return Math.min(100, Math.round((p/t)*100))
  }, [goal, target])

  const saveGoal = async () => {
    const payload = { title, frequency: 'monthly', category: 'reading', target: parseInt(target||'0',10), progress: goal?.progress||0 }
    const saved = goal ? await updateTask(goal._id, payload) : await createTask(payload)
    setGoal(saved)
  }

  const addProgress = async () => {
    if (!goal) return
    const val = parseInt(add||'0',10)
    const saved = await updateTask(goal._id, { progress: (goal.progress||0) + val })
    setGoal(saved)
    setAdd('')
  }

  return (
    <Widget title="Book Goal">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input className="p-2 rounded bg-gray-800 border border-gray-700 flex-1" placeholder="Goal title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <input className="p-2 rounded bg-gray-800 border border-gray-700 w-28" placeholder="Target pages" value={target} onChange={(e)=>setTarget(e.target.value)} />
          <button className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500" onClick={saveGoal}>Save</button>
        </div>
        <div>
          <div className="h-3 bg-gray-800 rounded">
            <div className="h-3 bg-green-600 rounded" style={{ width: pct+'%' }} />
          </div>
          <div className="text-xs text-gray-400 mt-1">{goal?.progress||0} / {goal?.target || target} pages ({pct}%)</div>
        </div>
        <div className="flex items-center gap-2">
          <input className="p-2 rounded bg-gray-800 border border-gray-700 w-28" placeholder="Add pages" value={add} onChange={(e)=>setAdd(e.target.value)} />
          <button className="px-3 py-2 rounded bg-green-600 hover:bg-green-500" onClick={addProgress} disabled={!goal}>Add</button>
        </div>
      </div>
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
