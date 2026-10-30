import React, { FC, useState, useEffect, useMemo } from 'react';
import './App.css';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import TaskCreator from './Components/TaskCreator';
import TodoTask from './Components/TodoTask';
import AiCoachPanel from './Components/AiCoachPanel';
import Toast from './Components/Toast';
import { ITask, PriorityLevel, TaskCategory } from './Interfaces';
import {
  FilterIcon,
  CheckCircleIcon,
  CircleIcon,
  SparklesIcon,
  RotateCcwIcon,
  LayersIcon,
} from './Components/Icons';
import { sounds } from './utils/sound';
import { fireConfetti } from './utils/confetti';

const STORAGE_KEY = 'flowcraft_tasks_v2';
const THEME_KEY = 'flowcraft_theme';

const INITIAL_SAMPLE_TASKS: ITask[] = [
  {
    id: 't-1',
    taskName: 'Review product presentation deck with design team',
    deadline: 1,
    category: 'Work',
    priority: 'high',
    completed: false,
    pinned: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    subtasks: [
      { id: 'st-1', title: 'Verify slide 4 metrics & user quotes', completed: true },
      { id: 'st-2', title: 'Polish slide transitions & typography', completed: false },
      { id: 'st-3', title: 'Do a 5-minute rehearsal run', completed: false },
    ],
  },
  {
    id: 't-2',
    taskName: 'Pick up sourdough bread & oat milk from local bakery',
    deadline: 0,
    category: 'Personal',
    priority: 'medium',
    completed: false,
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    subtasks: [],
  },
  {
    id: 't-3',
    taskName: '25-minute brisk interval run + cool-down stretch',
    deadline: 0,
    category: 'Health',
    priority: 'medium',
    completed: true,
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    completedAt: Date.now() - 1000 * 60 * 30,
    subtasks: [
      { id: 'st-4', title: 'Hydrate with electrolytes', completed: true },
      { id: 'st-5', title: 'Log distance in tracker', completed: true },
    ],
  },
  {
    id: 't-4',
    taskName: 'Audit monthly server expenses and trim unused cloud tiers',
    deadline: 2,
    category: 'Finance',
    priority: 'high',
    completed: false,
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    subtasks: [
      { id: 'st-6', title: 'Export staging usage logs', completed: false },
      { id: 'st-7', title: 'Downscale idle redis cache instances', completed: false },
    ],
  },
  {
    id: 't-5',
    taskName: 'Brainstorm creative concepts for upcoming blog piece',
    deadline: 4,
    category: 'Creative',
    priority: 'low',
    completed: false,
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    subtasks: [],
  },
];

const App: FC = () => {
  // Tasks state
  const [todoList, setTodoList] = useState<ITask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_SAMPLE_TASKS;
  });

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sounds.isEnabled());

  // Filters & search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'created' | 'alphabetical'>('deadline');

  // Undo Toast state
  const [deletedTask, setDeletedTask] = useState<ITask | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todoList));
    } catch {
      // ignore
    }
  }, [todoList]);

  // Sync theme
  useEffect(() => {
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Keyboard shortcut listener ('/' to search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add single task
  const handleAddTask = (newTaskData: Omit<ITask, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: ITask = {
      ...newTaskData,
      id: 'task-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      completed: false,
      createdAt: Date.now(),
    };
    setTodoList((prev) => [newTask, ...prev]);
  };

  // Add batch tasks (e.g. from AI breakdown or starter packs)
  const handleAddBatchTasks = (
    newTasksData: {
      taskName: string;
      deadline: number;
      category: TaskCategory;
      priority: PriorityLevel;
      subtasks?: { id: string; title: string; completed: boolean }[];
    }[]
  ) => {
    const newTasks: ITask[] = newTasksData.map((data, idx) => ({
      ...data,
      id: 'task-' + (Date.now() + idx).toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      completed: false,
      pinned: false,
      createdAt: Date.now() + idx,
      subtasks: data.subtasks || [],
    }));
    setTodoList((prev) => [...newTasks, ...prev]);
  };

  // Toggle complete
  const handleToggleComplete = (id: string) => {
    setTodoList((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const willComplete = !t.completed;
          return {
            ...t,
            completed: willComplete,
            completedAt: willComplete ? Date.now() : undefined,
          };
        }
        return t;
      })
    );
  };

  // Toggle pin
  const handleTogglePin = (id: string) => {
    setTodoList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t))
    );
  };

  // Update task
  const handleUpdateTask = (updated: ITask) => {
    setTodoList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Delete task with Undo Toast
  const handleDeleteTask = (task: ITask) => {
    sounds.playDelete();
    setDeletedTask(task);
    setToastMessage(`Deleted "${task.taskName.slice(0, 32)}${task.taskName.length > 32 ? '...' : ''}"`);
    setTodoList((prev) => prev.filter((t) => t.id !== task.id));
  };

  // Undo delete
  const handleUndoDelete = () => {
    if (deletedTask) {
      setTodoList((prev) => [deletedTask, ...prev]);
      setDeletedTask(null);
      setToastMessage(null);
      sounds.playPop();
    }
  };

  // Reset to initial sample tasks
  const handleResetSampleData = () => {
    setTodoList(INITIAL_SAMPLE_TASKS);
  };

  // Bulk actions
  const handleClearCompleted = () => {
    const completedCount = todoList.filter((t) => t.completed).length;
    if (completedCount === 0) return;
    if (window.confirm(`Clear all ${completedCount} completed tasks?`)) {
      sounds.playDelete();
      setTodoList((prev) => prev.filter((t) => !t.completed));
    }
  };

  const handleMarkAllCompleted = () => {
    const activeTasks = todoList.filter((t) => !t.completed);
    if (activeTasks.length === 0) return;
    sounds.playComplete();
    fireConfetti(0.5, 0.4);
    setTodoList((prev) =>
      prev.map((t) => ({
        ...t,
        completed: true,
        completedAt: t.completed ? t.completedAt : Date.now(),
        subtasks: t.subtasks.map((st) => ({ ...st, completed: true })),
      }))
    );
  };

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return todoList
      .filter((task) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.taskName.toLowerCase().includes(q);
          const matchesCategory = task.category.toLowerCase().includes(q);
          const matchesSubtasks = task.subtasks.some((st) => st.title.toLowerCase().includes(q));
          if (!matchesTitle && !matchesCategory && !matchesSubtasks) return false;
        }

        // Category / Views filter
        if (selectedCategory === 'today') {
          if (task.completed || task.deadline > 1) return false;
        } else if (selectedCategory === 'starred') {
          if (!task.pinned) return false;
        } else if (selectedCategory !== 'all') {
          if (task.category !== selectedCategory) return false;
        }

        // Status filter
        if (statusFilter === 'active' && task.completed) return false;
        if (statusFilter === 'completed' && !task.completed) return false;

        return true;
      })
      .sort((a, b) => {
        // Pinned tasks always on top
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        // Uncompleted tasks before completed tasks
        if (!a.completed && b.completed) return -1;
        if (a.completed && !b.completed) return 1;

        if (sortBy === 'deadline') {
          return a.deadline - b.deadline;
        }
        if (sortBy === 'priority') {
          const weights: Record<PriorityLevel, number> = {
            urgent: 4,
            high: 3,
            medium: 2,
            low: 1,
          };
          return (weights[b.priority] || 0) - (weights[a.priority] || 0);
        }
        if (sortBy === 'created') {
          return b.createdAt - a.createdAt;
        }
        if (sortBy === 'alphabetical') {
          return a.taskName.localeCompare(b.taskName);
        }
        return 0;
      });
  }, [todoList, searchQuery, selectedCategory, statusFilter, sortBy]);

  const completedCount = todoList.filter((t) => t.completed).length;

  return (
    <div className={`App flowcraft-app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        completedCount={completedCount}
        totalCount={todoList.length}
        onResetSampleData={handleResetSampleData}
      />

      {/* Main 3-Column Studio Layout */}
      <div className="studio-container">
        {/* Left Column: Sidebar & Focus Tools */}
        <Sidebar
          tasks={todoList}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Center Column: Primary Task Hub */}
        <main className="main-workspace">
          {/* Enhanced Task Creator Composer */}
          <TaskCreator onAddTask={handleAddTask} />

          {/* Filter Bar & Quick Controls */}
          <div className="workspace-toolbar">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter('all');
                  sounds.playPop();
                }}
              >
                All ({todoList.length})
              </button>
              <button
                className={`filter-tab ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter('active');
                  sounds.playPop();
                }}
              >
                In Progress ({todoList.filter((t) => !t.completed).length})
              </button>
              <button
                className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter('completed');
                  sounds.playPop();
                }}
              >
                Completed ({completedCount})
              </button>
            </div>

            <div className="toolbar-actions">
              <div className="sort-wrapper">
                <span className="sort-label">Sort:</span>
                <select
                  className="sort-dropdown"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    sounds.playPop();
                  }}
                >
                  <option value="deadline">Timeline (Earliest)</option>
                  <option value="priority">Priority (Highest)</option>
                  <option value="created">Recently Added</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>

              {completedCount > 0 && (
                <button
                  className="bulk-action-btn"
                  onClick={handleClearCompleted}
                  title="Remove completed tasks"
                >
                  Clear Done
                </button>
              )}

              {todoList.some((t) => !t.completed) && (
                <button
                  className="bulk-action-btn primary"
                  onClick={handleMarkAllCompleted}
                  title="Mark all current tasks done"
                >
                  Complete All
                </button>
              )}
            </div>
          </div>

          {/* Tasks List */}
          <div className="tasks-container">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TodoTask
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onTogglePin={handleTogglePin}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTask={handleUpdateTask}
                />
              ))
            ) : (
              /* Charming non-empty empty state */
              <div className="empty-state-card">
                <div className="empty-icon-circle">
                  {statusFilter === 'completed' ? (
                    <CheckCircleIcon size={32} />
                  ) : searchQuery || selectedCategory !== 'all' ? (
                    <FilterIcon size={32} />
                  ) : (
                    <SparklesIcon size={32} />
                  )}
                </div>
                <h3 className="empty-title">
                  {searchQuery
                    ? `No tasks matching "${searchQuery}"`
                    : selectedCategory !== 'all'
                    ? `No tasks in "${selectedCategory}" right now`
                    : statusFilter === 'completed'
                    ? 'No completed tasks yet'
                    : "You're completely caught up! 🌿"}
                </h3>
                <p className="empty-subtitle">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your search terms or clearing the active category filter.'
                    : statusFilter === 'completed'
                    ? 'Check off some tasks to see them archived here.'
                    : 'Take a breath and enjoy your calm moment, or seed your next project.'}
                </p>

                {(searchQuery || selectedCategory !== 'all' || statusFilter !== 'all') && (
                  <button
                    className="empty-action-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setStatusFilter('all');
                      sounds.playPop();
                    }}
                  >
                    Reset All Filters
                  </button>
                )}

                {todoList.length === 0 && (
                  <button
                    className="empty-action-btn primary"
                    onClick={() => {
                      handleResetSampleData();
                      sounds.playComplete();
                    }}
                  >
                    <RotateCcwIcon size={14} />
                    <span>Load Curated Sample Tasks</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Right Column: AI Productivity Coach & Activity Hub */}
        <AiCoachPanel
          tasks={todoList}
          onAddBatchTasks={handleAddBatchTasks}
        />
      </div>

      {/* Undo Toast notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onUndo={handleUndoDelete}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default App;
