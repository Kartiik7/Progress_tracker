import React, { useEffect, useState } from 'react'
import { createTask, deleteTask, getTasks, updateTask } from '../api/tasks'

export default function ProjectMilestones() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')

  const refresh = () => getTasks({ category: 'milestone' }).then(setItems)
  useEffect(() => { refresh() }, [])

  const add = async () => {
    if (!title) return
    const payload = { title, frequency: 'monthly', category: 'milestone', dueDate: due? new Date(due): undefined }
    const saved = await createTask(payload)
    setItems(prev => [saved, ...prev])
    setTitle(''); setDue('')
  }

  const toggle = async (m) => {
    const saved = await updateTask(m._id, { status: m.status==='completed'?'pending':'completed' })
    setItems(prev => prev.map(p => p._id===saved._id? saved: p))
  }

  const remove = async (m) => {
    await deleteTask(m._id)
    setItems(prev => prev.filter(p=>p._id!==m._id))
  }

  return (
    <Widget title="Project Milestones">
      <div className="flex items-center gap-2">
        <input className="p-2 rounded bg-gray-800 border border-gray-700 flex-1" placeholder="Milestone title" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <input className="p-2 rounded bg-gray-800 border border-gray-700" type="date" value={due} onChange={(e)=>setDue(e.target.value)} />
        <button className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500" onClick={add}>Add</button>
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map(m => (
          <li key={m._id} className="flex items-center gap-2 justify-between border border-gray-800 rounded p-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={m.status==='completed'} onChange={()=>toggle(m)} />
              <div>
                <div className={m.status==='completed'? 'line-through text-gray-500':''}>{m.title}</div>
                {m.dueDate && <div className="text-xs text-gray-500">Due {new Date(m.dueDate).toLocaleDateString()}</div>}
              </div>
            </div>
            <button onClick={()=>remove(m)} className="text-red-400 hover:text-red-300">Delete</button>
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
