import React, { useEffect, useMemo, useState } from 'react'
import { getTasks } from '../api/tasks'

export default function CalendarWidget() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [viewDate, setViewDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const todayISO = toISO(new Date())

  useEffect(() => {
    let isMounted = true
    getTasks().then((data) => { if (isMounted) setTasks(data) }).finally(()=> setLoading(false))
    return () => { isMounted = false }
  }, [])

  const marks = useMemo(() => buildMarks(tasks), [tasks])
  const { monthLabel, weeks, viewMonthIndex } = useMonthGrid(viewDate)

  const onPrev = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth()-1, 1))
  const onNext = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth()+1, 1))
  const onToday = () => setViewDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  return (
    <section className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button onClick={onPrev} className="px-2 py-1 rounded border border-gray-800 hover:bg-gray-800">‹</button>
          <button onClick={onNext} className="px-2 py-1 rounded border border-gray-800 hover:bg-gray-800">›</button>
          <button onClick={onToday} className="px-2 py-1 rounded border border-gray-800 hover:bg-gray-800">Today</button>
        </div>
        <h3 className="text-lg font-semibold">{monthLabel}</h3>
        <div />
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 text-xs text-gray-400 mb-1">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weeks.map((week, i) => (
              <React.Fragment key={i}>
                {week.map((d) => {
                  const iso = toISO(d)
                  const isToday = iso === todayISO
                  const isCurrentMonth = d.getMonth() === viewMonthIndex
                  const isSelected = selected && toISO(selected) === iso
                  const mark = marks[iso]
                  return (
                    <button
                      key={iso}
                      onClick={()=> setSelected(d)}
                      className={[
                        'relative aspect-square rounded-md flex items-center justify-center select-none border text-sm',
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : isToday
                          ? 'bg-gray-800 text-gray-100 border-gray-700 ring-1 ring-indigo-500/50'
                          : 'bg-gray-900 text-gray-200 border-gray-800 hover:bg-gray-800',
                        !isCurrentMonth ? 'opacity-50' : ''
                      ].join(' ')}
                    >
                      <span>{d.getDate()}</span>
                      {mark && <DayMark mark={mark} />}
                    </button>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function DayMark({ mark }){
  const { type, count } = mark
  if (count) {
    return <span className="absolute bottom-1 right-1 rounded-full text-[10px] leading-none px-1.5 py-0.5 bg-gray-700 text-gray-200" title={`${count} item${count>1?'s':''} - ${type||'activity'}`}>{count}</span>
  }
  const dotClass = type === 'completed' ? 'bg-emerald-500' : type === 'activity' ? 'bg-sky-500' : 'bg-indigo-500'
  return <span className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${dotClass}`} title={type||'activity'} />
}

function useMonthGrid(viewDate){
  const y = viewDate.getFullYear()
  const m = viewDate.getMonth()
  const first = new Date(y, m, 1)
  const dow = first.getDay()
  const start = new Date(y, m, 1 - dow)
  const days = []
  for (let i=0;i<42;i++) days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate()+i))
  const weeks = []
  for (let i=0;i<6;i++) weeks.push(days.slice(i*7, i*7+7))
  const monthLabel = new Intl.DateTimeFormat(undefined, { month:'long', year:'numeric' }).format(first)
  return { monthLabel, weeks, viewMonthIndex: m }
}

function toISO(d){
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2,'0')
  const day = String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}

function buildMarks(tasks){
  const map = {}
  for (const t of tasks){
    if (!t.dueDate) continue
    const k = toISO(new Date(t.dueDate))
    map[k] ||= { count: 0, completed: 0 }
    map[k].count++
    if (t.status==='completed') map[k].completed++
  }
  const out = {}
  for (const [k, v] of Object.entries(map)){
    let type = 'activity'
    if (v.completed === v.count) type = 'completed'
    else if (v.completed > 0) type = 'mixed'
    out[k] = { type, count: v.count }
  }
  return out
}
