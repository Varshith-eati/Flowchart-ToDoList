import React, { useState, useEffect } from 'react';
import { ITask, TaskCategory } from '../Interfaces';
import {
  FlameIcon,
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  StickyNoteIcon,
  StarIcon,
  ClockIcon,
  TagIcon,
  CheckCircleIcon,
} from './Icons';
import { sounds } from '../utils/sound';

interface SidebarProps {
  tasks: ITask[];
  selectedCategory: string; // 'all' | 'today' | 'starred' | TaskCategory
  setSelectedCategory: (cat: string) => void;
  userStreak?: number;
}

const CATEGORIES: { name: TaskCategory; color: string; label: string }[] = [
  { name: 'Work', color: '#3B82F6', label: 'Work & Projects' },
  { name: 'Personal', color: '#10B981', label: 'Life & Personal' },
  { name: 'Health', color: '#EC4899', label: 'Health & Habits' },
  { name: 'Creative', color: '#8B5CF6', label: 'Creative & Study' },
  { name: 'Finance', color: '#F59E0B', label: 'Finance & Bills' },
  { name: 'General', color: '#6B7280', label: 'General / Inbox' },
];

const Sidebar: React.FC<SidebarProps> = ({
  tasks,
  selectedCategory,
  setSelectedCategory,
  userStreak = 3,
}) => {
  // Scratchpad note state
  const [scratchpad, setScratchpad] = useState<string>(() => {
    return localStorage.getItem('flowcraft_scratchpad') || '💡 Quick thoughts & brain dump:\n- Call dentist on Monday\n- Remember oat milk';
  });

  // Pomodoro state
  const [pomoTime, setPomoTime] = useState<number>(25 * 60);
  const [pomoRunning, setPomoRunning] = useState<boolean>(false);
  const [pomoMode, setPomoMode] = useState<'work' | 'break'>('work');

  // Greeting calculation
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  // Category counts
  const totalCount = tasks.length;
  const todayUrgentCount = tasks.filter((t) => !t.completed && t.deadline <= 1).length;
  const starredCount = tasks.filter((t) => t.pinned).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const getCategoryCount = (cat: TaskCategory) => {
    return tasks.filter((t) => t.category === cat).length;
  };

  // Save scratchpad
  useEffect(() => {
    localStorage.setItem('flowcraft_scratchpad', scratchpad);
  }, [scratchpad]);

  // Pomodoro timer tick
  useEffect(() => {
    let interval: number | null = null;
    if (pomoRunning) {
      interval = window.setInterval(() => {
        setPomoTime((prev) => {
          if (prev <= 1) {
            sounds.playTimerBell();
            setPomoRunning(false);
            if (pomoMode === 'work') {
              alert('🎉 Focus block finished! Take a well-deserved 5-minute break.');
              setPomoMode('break');
              return 5 * 60;
            } else {
              alert('✨ Break over! Ready for the next sprint?');
              setPomoMode('work');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomoRunning, pomoMode]);

  const togglePomo = () => {
    setPomoRunning(!pomoRunning);
    sounds.playPop();
  };

  const resetPomo = (mode: 'work' | 'break' = 'work') => {
    setPomoRunning(false);
    setPomoMode(mode);
    setPomoTime(mode === 'work' ? 25 * 60 : 5 * 60);
    sounds.playPop();
  };

  const formatPomoTime = () => {
    const mins = Math.floor(pomoTime / 60);
    const secs = pomoTime % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <aside className="app-sidebar">
      {/* Daily Pulse Card */}
      <div className="daily-pulse-card">
        <div className="pulse-header">
          <div>
            <h2 className="greeting-text">{greeting} 👋</h2>
            <p className="date-subtext">{todayFormatted}</p>
          </div>
          <div className="streak-badge" title="Daily completion streak">
            <FlameIcon size={14} className="streak-icon" />
            <span>{userStreak}d streak</span>
          </div>
        </div>

        <div className="pulse-summary">
          <div className="summary-stat">
            <span className="stat-number">{tasks.filter((t) => !t.completed).length}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="summary-stat-divider" />
          <div className="summary-stat">
            <span className="stat-number stat-green">{completedCount}</span>
            <span className="stat-label">Done</span>
          </div>
          <div className="summary-stat-divider" />
          <div className="summary-stat">
            <span className="stat-number stat-amber">{todayUrgentCount}</span>
            <span className="stat-label">Due Soon</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-section">
        <span className="section-title">VIEWS</span>
        <nav className="nav-list">
          <button
            className={`nav-item ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory('all');
              sounds.playPop();
            }}
          >
            <div className="nav-item-left">
              <CheckCircleIcon size={16} />
              <span>All Tasks</span>
            </div>
            <span className="nav-count-badge">{totalCount}</span>
          </button>

          <button
            className={`nav-item ${selectedCategory === 'today' ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory('today');
              sounds.playPop();
            }}
          >
            <div className="nav-item-left">
              <ClockIcon size={16} className="text-amber" />
              <span>Today & Urgent</span>
            </div>
            {todayUrgentCount > 0 && (
              <span className="nav-count-badge badge-urgent">{todayUrgentCount}</span>
            )}
          </button>

          <button
            className={`nav-item ${selectedCategory === 'starred' ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory('starred');
              sounds.playPop();
            }}
          >
            <div className="nav-item-left">
              <StarIcon size={16} filled={selectedCategory === 'starred'} className="text-gold" />
              <span>Starred / Focus</span>
            </div>
            {starredCount > 0 && <span className="nav-count-badge">{starredCount}</span>}
          </button>
        </nav>
      </div>

      {/* Categories */}
      <div className="sidebar-section">
        <span className="section-title">CATEGORIES</span>
        <nav className="nav-list">
          {CATEGORIES.map((cat) => {
            const count = getCategoryCount(cat.name);
            return (
              <button
                key={cat.name}
                className={`nav-item ${selectedCategory === cat.name ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  sounds.playPop();
                }}
              >
                <div className="nav-item-left">
                  <span className="category-dot" style={{ backgroundColor: cat.color }} />
                  <span>{cat.label}</span>
                </div>
                {count > 0 && <span className="nav-count-badge">{count}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Focus Station (Mini Pomodoro) */}
      <div className="sidebar-widget pomo-widget">
        <div className="widget-header">
          <span className="widget-title">
            <ClockIcon size={14} /> Focus Station
          </span>
          <div className="pomo-mode-pills">
            <button
              className={`pomo-pill ${pomoMode === 'work' ? 'active' : ''}`}
              onClick={() => resetPomo('work')}
            >
              25m Focus
            </button>
            <button
              className={`pomo-pill ${pomoMode === 'break' ? 'active' : ''}`}
              onClick={() => resetPomo('break')}
            >
              5m Break
            </button>
          </div>
        </div>

        <div className="pomo-display">
          <span className={`pomo-digits ${pomoRunning ? 'pulsing' : ''}`}>
            {formatPomoTime()}
          </span>
          <div className="pomo-actions">
            <button
              className={`pomo-btn ${pomoRunning ? 'pomo-btn-pause' : 'pomo-btn-start'}`}
              onClick={togglePomo}
            >
              {pomoRunning ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
              <span>{pomoRunning ? 'Pause' : 'Start'}</span>
            </button>
            <button
              className="pomo-icon-btn"
              title="Reset timer"
              onClick={() => resetPomo(pomoMode)}
            >
              <RotateCcwIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Scratchpad Brain Dump */}
      <div className="sidebar-widget scratchpad-widget">
        <div className="widget-header">
          <span className="widget-title">
            <StickyNoteIcon size={14} /> Brain Dump Scratchpad
          </span>
        </div>
        <textarea
          className="scratchpad-textarea"
          value={scratchpad}
          onChange={(e) => setScratchpad(e.target.value)}
          placeholder="Unstructured notes, ideas, phone numbers..."
          rows={3}
        />
        <span className="scratchpad-hint">Auto-saves locally • Keep thoughts clear</span>
      </div>
    </aside>
  );
};

export default Sidebar;

