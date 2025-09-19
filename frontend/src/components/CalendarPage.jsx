import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as taskApi from '../api/tasks';
import * as projectApi from '../api/projects';
import styles from './CalendarPage.module.css';

// Main component for the full-page calendar
export default function CalendarPage() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  const { monthLabel, weeks, viewMonthIndex } = useMonthGrid(viewDate);

  const fetchEvents = useCallback(async (start, end) => {
    try {
      setLoading(true);
      const [taskData, projectData] = await Promise.all([
        taskApi.getTasks({ startDate: start.toISOString(), endDate: end.toISOString() }),
        projectApi.getProjects({ startDate: start.toISOString(), endDate: end.toISOString() })
      ]);
      setTasks(taskData);
      setProjects(projectData);
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const lastDay = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 23, 59, 59);
    fetchEvents(firstDay, lastDay);
  }, [viewDate, fetchEvents]);

  const eventsByDate = useMemo(() => {
    const map = {};
    const allItems = [...tasks, ...projects];
    allItems.forEach(item => {
      // Robust validation to prevent crashes from invalid dates
      if (!item.dueDate) {
        return; // Skip if due date is missing
      }
      const date = new Date(item.dueDate);
      // An invalid date's getTime() will return NaN. This is a reliable check.
      if (isNaN(date.getTime())) {
        console.warn(`Skipping item with invalid date: "${item.title}"`, item.dueDate);
        return; 
      }

      const dateKey = date.toISOString().split('T')[0];
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push({
        id: item._id,
        title: item.title,
        // FIX: Use the safe method to check for the property
        type: Object.prototype.hasOwnProperty.call(item, 'subTasks') ? 'project' : 'task',
      });
    });
    return map;
  }, [tasks, projects]);
  
  const onPrev = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const onNext = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const onToday = () => setViewDate(new Date());

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{monthLabel}</h1>
        <div className={styles.controls}>
          <button onClick={onPrev}>‹</button>
          <button onClick={onToday}>Today</button>
          <button onClick={onNext}>›</button>
        </div>
      </header>
      <div className={styles.grid}>
        <div className={styles.dayHeaders}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className={styles.dayCells}>
          {weeks.flat().map((day, index) => (
            <DayCell
              key={index}
              day={day}
              isCurrentMonth={day.getMonth() === viewMonthIndex}
              events={eventsByDate[day.toISOString().split('T')[0]] || []}
              onSelect={() => setSelectedDay(day)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function DayCell({ day, isCurrentMonth, events, onSelect }) {
  const isToday = new Date().toDateString() === day.toDateString();
  return (
    <div className={`${styles.dayCell} ${!isCurrentMonth ? styles.otherMonth : ''} ${isToday ? styles.today : ''}`} onClick={onSelect}>
      <div className={styles.dayNumber}>{day.getDate()}</div>
      <div className={styles.events}>
        {events.map(event => (
          <div key={event.id} className={`${styles.event} ${styles[event.type]}`}>
            {event.title}
          </div>
        ))}
      </div>
    </div>
  );
}

function useMonthGrid(viewDate) {
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const first = new Date(y, m, 1);
  const dow = first.getDay();
  const start = new Date(y, m, 1 - dow);
  const days = [];
  for (let i = 0; i < 42; i++) days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const weeks = [];
  for (let i = 0; i < 6; i++) weeks.push(days.slice(i * 7, i * 7 + 7));
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(first);
  return { monthLabel, weeks, viewMonthIndex: m };
}

