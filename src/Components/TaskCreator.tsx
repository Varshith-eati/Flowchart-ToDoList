import React, { useState } from 'react';
import { ITask, PriorityLevel, TaskCategory, ISubTask } from '../Interfaces';
import { PlusIcon, SparklesIcon, CalendarIcon, TagIcon, XIcon, CheckIcon } from './Icons';
import { parseSmartTaskInput, generateSubtasks } from '../utils/aiHelper';
import { sounds } from '../utils/sound';

interface TaskCreatorProps {
  onAddTask: (newTask: Omit<ITask, 'id' | 'createdAt' | 'completed'>) => void;
}

const TaskCreator: React.FC<TaskCreatorProps> = ({ onAddTask }) => {
  const [taskText, setTaskText] = useState('');
  const [deadline, setDeadline] = useState<number>(1);
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const handleSmartParse = () => {
    if (!taskText.trim()) return;
    setIsAiLoading(true);
    sounds.playPop();

    setTimeout(() => {
      const parsed = parseSmartTaskInput(taskText);
      setTaskText(parsed.taskName);
      setDeadline(parsed.deadline);
      setCategory(parsed.category);
      setPriority(parsed.priority);
      setIsAiLoading(false);
      setAiNotice('✨ AI optimized priority, tags & timeline!');
      setTimeout(() => setAiNotice(null), 3000);
    }, 250);
  };

  const handleAiBreakdown = () => {
    if (!taskText.trim()) {
      setAiNotice('Type a task name first (e.g. "Plan presentation")');
      setTimeout(() => setAiNotice(null), 2500);
      return;
    }
    setIsAiLoading(true);
    sounds.playPop();

    setTimeout(() => {
      const generated = generateSubtasks(taskText);
      setSubtasks(generated.map((s) => s.title));
      setShowSubtasks(true);
      setIsAiLoading(false);
      setAiNotice('✨ AI generated 4 actionable subtasks!');
      setTimeout(() => setAiNotice(null), 3000);
    }, 300);
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([...subtasks, subtaskInput.trim()]);
      setSubtaskInput('');
      sounds.playPop();
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
    sounds.playDelete();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskText.trim()) return;

    const formattedSubtasks: ISubTask[] = subtasks.map((title) => ({
      id: 'sub-' + Math.random().toString(36).substring(2, 9),
      title,
      completed: false,
    }));

    onAddTask({
      taskName: taskText.trim(),
      deadline: Math.max(0, deadline),
      category,
      priority,
      pinned: false,
      subtasks: formattedSubtasks,
    });

    // Reset inputs
    setTaskText('');
    setDeadline(1);
    setCategory('Work');
    setPriority('medium');
    setSubtasks([]);
    setShowSubtasks(false);
    setAiNotice(null);
    sounds.playPop();
  };

  return (
    <div className="task-creator-card">
      <form onSubmit={handleSubmit}>
        <div className="creator-main-row">
          <div className="creator-input-container">
            <input
              type="text"
              className="creator-text-input"
              placeholder="What needs to be done? (Try 'Finish slide deck in 2 days #work !high')"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="creator-submit-btn"
            disabled={!taskText.trim()}
          >
            <PlusIcon size={18} />
            <span>Add Task</span>
          </button>
        </div>

        {/* Quick Suggestion Chips & AI Assist bar */}
        <div className="creator-quick-bar">
          <div className="quick-deadlines">
            <span className="quick-label">Due:</span>
            {[
              { label: 'Today', days: 0 },
              { label: 'Tomorrow', days: 1 },
              { label: '3 Days', days: 3 },
              { label: '1 Week', days: 7 },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className={`quick-chip ${deadline === item.days ? 'active' : ''}`}
                onClick={() => {
                  setDeadline(item.days);
                  sounds.playPop();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="ai-assist-actions">
            <button
              type="button"
              className="ai-assist-btn"
              onClick={handleSmartParse}
              title="Automatically detect priority, timeline, and category from your text"
              disabled={isAiLoading || !taskText.trim()}
            >
              <SparklesIcon size={14} className={isAiLoading ? 'spin-icon' : ''} />
              <span>Smart Detect</span>
            </button>

            <button
              type="button"
              className="ai-assist-btn secondary"
              onClick={handleAiBreakdown}
              title="Generate 3-4 bite-sized subtasks using AI"
              disabled={isAiLoading || !taskText.trim()}
            >
              <SparklesIcon size={14} />
              <span>Break Down</span>
            </button>
          </div>
        </div>

        {aiNotice && <div className="ai-toast-notice">{aiNotice}</div>}

        {/* Detailed Controls Row: Priority, Category, Deadline Days */}
        <div className="creator-details-row">
          {/* Priority selector */}
          <div className="control-group">
            <span className="control-label">Priority:</span>
            <div className="priority-pill-selector">
              {(['low', 'medium', 'high', 'urgent'] as PriorityLevel[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`priority-pill priority-${p} ${priority === p ? 'selected' : ''}`}
                  onClick={() => {
                    setPriority(p);
                    sounds.playPop();
                  }}
                >
                  <span className="priority-dot" />
                  <span className="priority-text">{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category selector */}
          <div className="control-group">
            <span className="control-label">
              <TagIcon size={13} /> Category:
            </span>
            <select
              className="category-dropdown"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as TaskCategory);
                sounds.playPop();
              }}
            >
              <option value="Work">💼 Work & Projects</option>
              <option value="Personal">🏡 Personal & Life</option>
              <option value="Health">🏃 Health & Habits</option>
              <option value="Creative">🎨 Creative & Study</option>
              <option value="Finance">💳 Finance & Bills</option>
              <option value="General">📋 General</option>
            </select>
          </div>

          {/* Exact Days Deadline */}
          <div className="control-group">
            <span className="control-label">
              <CalendarIcon size={13} /> Days:
            </span>
            <div className="deadline-stepper">
              <button
                type="button"
                className="stepper-btn"
                onClick={() => setDeadline(Math.max(0, deadline - 1))}
              >
                -
              </button>
              <input
                type="number"
                min="0"
                className="deadline-number-input"
                value={deadline}
                onChange={(e) => setDeadline(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <button
                type="button"
                className="stepper-btn"
                onClick={() => setDeadline(deadline + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Toggle subtasks checklist */}
          <button
            type="button"
            className={`toggle-subtasks-btn ${showSubtasks ? 'active' : ''}`}
            onClick={() => setShowSubtasks(!showSubtasks)}
          >
            <span>{showSubtasks ? 'Hide Subtasks' : `Subtasks (${subtasks.length})`}</span>
          </button>
        </div>

        {/* Subtasks checklist drawer */}
        {showSubtasks && (
          <div className="creator-subtasks-section">
            <div className="subtask-add-row">
              <input
                type="text"
                className="subtask-input"
                placeholder="Add subtask step (e.g. 'Draft first section')..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button
                type="button"
                className="subtask-add-btn"
                onClick={handleAddSubtask}
                disabled={!subtaskInput.trim()}
              >
                Add Step
              </button>
            </div>

            {subtasks.length > 0 && (
              <ul className="subtasks-preview-list">
                {subtasks.map((st, idx) => (
                  <li key={idx} className="subtask-preview-item">
                    <CheckIcon size={14} className="subtask-bullet-icon" />
                    <span className="subtask-preview-title">{st}</span>
                    <button
                      type="button"
                      className="subtask-delete-btn"
                      onClick={() => handleRemoveSubtask(idx)}
                    >
                      <XIcon size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default TaskCreator;

