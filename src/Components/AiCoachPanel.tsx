import React, { useState } from 'react';
import { ITask, PriorityLevel, TaskCategory } from '../Interfaces';
import {
  SparklesIcon,
  BarChart3Icon,
  CheckIcon,
  PlusIcon,
  FlameIcon,
  CoffeeIcon,
} from './Icons';
import { getDailyCoachInsight, generateSubtasks, STARTER_PACKS } from '../utils/aiHelper';
import { sounds } from '../utils/sound';

interface AiCoachPanelProps {
  tasks: ITask[];
  onAddBatchTasks: (
    newTasks: {
      taskName: string;
      deadline: number;
      category: TaskCategory;
      priority: PriorityLevel;
      subtasks?: { id: string; title: string; completed: boolean }[];
    }[]
  ) => void;
  onFocusTask?: (taskId: string) => void;
}

const AiCoachPanel: React.FC<AiCoachPanelProps> = ({ tasks, onAddBatchTasks }) => {
  const [breakdownInput, setBreakdownInput] = useState('');
  const [breakdownResults, setBreakdownResults] = useState<string[]>([]);
  const [activePackIndex, setActivePackIndex] = useState<number | null>(null);

  const insight = getDailyCoachInsight(tasks);

  const handleGenerateBreakdown = () => {
    if (!breakdownInput.trim()) return;
    sounds.playPop();
    const subs = generateSubtasks(breakdownInput);
    setBreakdownResults(subs.map((s) => s.title));
  };

  const handleApplyBreakdownAsTasks = () => {
    if (breakdownResults.length === 0) return;
    sounds.playComplete();

    const newTasks = breakdownResults.map((title, i) => ({
      taskName: title,
      deadline: i < 2 ? 1 : 2,
      category: 'Work' as TaskCategory,
      priority: 'medium' as PriorityLevel,
    }));

    onAddBatchTasks(newTasks);
    setBreakdownInput('');
    setBreakdownResults([]);
  };

  const handleApplyStarterPack = (packIndex: number) => {
    sounds.playComplete();
    setActivePackIndex(packIndex);
    const pack = STARTER_PACKS[packIndex];
    onAddBatchTasks(
      pack.tasks.map((t) => ({
        ...t,
        subtasks: [],
      }))
    );
    setTimeout(() => setActivePackIndex(null), 2000);
  };

  // Activity stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Mock week activity (realistic human cadence)
  const daysOfWeek = [
    { day: 'M', count: 3 },
    { day: 'T', count: 5 },
    { day: 'W', count: 4 },
    { day: 'T', count: 6 },
    { day: 'F', count: completedTasks > 0 ? completedTasks : 2, isToday: true },
    { day: 'S', count: 1 },
    { day: 'S', count: 0 },
  ];
  const maxDayCount = Math.max(...daysOfWeek.map((d) => d.count), 1);

  return (
    <aside className="ai-coach-panel">
      {/* AI Daily Coach Card */}
      <div className="coach-card">
        <div className="coach-card-header">
          <div className="coach-icon-badge">
            <SparklesIcon size={16} />
          </div>
          <div className="coach-header-title">
            <span className="coach-tag">AI FOCUS COACH</span>
            <span className="coach-status">Live Advice</span>
          </div>
        </div>

        <h3 className="coach-headline">{insight.headline}</h3>
        <p className="coach-tip">{insight.tip}</p>
      </div>

      {/* Productivity Pulse / Mini Weekly Bar Chart */}
      <div className="coach-widget">
        <div className="coach-widget-header">
          <span className="coach-widget-title">
            <BarChart3Icon size={14} /> Weekly Momentum
          </span>
          <span className="completion-rate-badge">{completionRate}% Done</span>
        </div>

        <div className="activity-chart">
          {daysOfWeek.map((item, idx) => {
            const heightPercent = Math.max(15, (item.count / maxDayCount) * 100);
            return (
              <div key={idx} className="chart-col">
                <div className="chart-bar-container">
                  <div
                    className={`chart-bar-fill ${item.isToday ? 'today-fill' : ''}`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${item.count} tasks`}
                  />
                </div>
                <span className={`chart-day-label ${item.isToday ? 'today-label' : ''}`}>
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>

        <div className="productivity-mini-stats">
          <div className="mini-stat-item">
            <span className="stat-label">Total Load</span>
            <span className="stat-val">{totalTasks} items</span>
          </div>
          <div className="mini-stat-item">
            <span className="stat-label">Velocity</span>
            <span className="stat-val stat-highlight">
              <FlameIcon size={12} /> Good Pace
            </span>
          </div>
        </div>
      </div>

      {/* AI Task Breakdown Studio */}
      <div className="coach-widget breakdown-widget">
        <div className="coach-widget-header">
          <span className="coach-widget-title">
            <SparklesIcon size={14} /> AI Step Breakdown
          </span>
        </div>
        <p className="widget-explainer">
          Turn an overwhelming goal into manageable 15-min bite-sized actions.
        </p>

        <div className="breakdown-input-row">
          <input
            type="text"
            className="breakdown-input"
            placeholder="e.g., Launch marketing campaign..."
            value={breakdownInput}
            onChange={(e) => setBreakdownInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerateBreakdown();
            }}
          />
          <button
            type="button"
            className="breakdown-btn"
            onClick={handleGenerateBreakdown}
            disabled={!breakdownInput.trim()}
          >
            Deconstruct
          </button>
        </div>

        {breakdownResults.length > 0 && (
          <div className="breakdown-results-box">
            <span className="results-heading">Suggested Milestones:</span>
            <ul className="breakdown-list">
              {breakdownResults.map((step, idx) => (
                <li key={idx} className="breakdown-item">
                  <span className="step-num">{idx + 1}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="apply-breakdown-btn"
              onClick={handleApplyBreakdownAsTasks}
            >
              <PlusIcon size={14} />
              <span>Add All to My Tasks</span>
            </button>
          </div>
        )}
      </div>

      {/* Starter Templates */}
      <div className="coach-widget starter-packs-widget">
        <div className="coach-widget-header">
          <span className="coach-widget-title">
            <CoffeeIcon size={14} /> Human Starter Packs
          </span>
        </div>
        <div className="packs-list">
          {STARTER_PACKS.map((pack, idx) => (
            <div key={idx} className="pack-card">
              <div className="pack-info">
                <span className="pack-title">{pack.title}</span>
                <span className="pack-desc">{pack.description}</span>
              </div>
              <button
                type="button"
                className={`pack-add-btn ${activePackIndex === idx ? 'applied' : ''}`}
                onClick={() => handleApplyStarterPack(idx)}
                disabled={activePackIndex === idx}
              >
                {activePackIndex === idx ? (
                  <>
                    <CheckIcon size={12} /> Added!
                  </>
                ) : (
                  <>
                    <PlusIcon size={12} /> Load
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default AiCoachPanel;

