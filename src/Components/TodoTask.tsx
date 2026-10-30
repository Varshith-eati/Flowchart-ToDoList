import React, { useState } from 'react';
import { ITask, PriorityLevel, TaskCategory } from '../Interfaces';
import {
  CheckIcon,
  TrashIcon,
  StarIcon,
  EditIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  CircleIcon,
  CalendarIcon,
  TagIcon,
  CheckCheckIcon,
} from './Icons';
import { sounds } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';

interface Props {
  task: ITask;
  // Backward compatibility:
  completeTask?: (taskNameToDelete: string) => void;
  // Modern rich handlers:
  onToggleComplete?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onDeleteTask?: (task: ITask) => void;
  onUpdateTask?: (updated: ITask) => void;
}

const TodoTask: React.FC<Props> = ({
  task,
  completeTask,
  onToggleComplete,
  onTogglePin,
  onDeleteTask,
  onUpdateTask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.taskName);
  const [editDeadline, setEditDeadline] = useState(task.deadline);
  const [editPriority, setEditPriority] = useState<PriorityLevel>(task.priority || 'medium');
  const [editCategory, setEditCategory] = useState<TaskCategory>(task.category || 'General');
  const [showSubtasks, setShowSubtasks] = useState(false);

  const subtasks = task.subtasks || [];
  const completedSubtasksCount = subtasks.filter((st) => st.completed).length;

  const handleToggle = () => {
    if (onToggleComplete) {
      const willBeCompleted = !task.completed;
      if (willBeCompleted) {
        sounds.playComplete();
        fireConfetti(0.5, 0.5);
      } else {
        sounds.playPop();
      }
      onToggleComplete(task.id);
    } else if (completeTask) {
      completeTask(task.taskName);
    }
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    if (onUpdateTask) {
      onUpdateTask({
        ...task,
        taskName: editTitle.trim(),
        deadline: editDeadline,
        priority: editPriority,
        category: editCategory,
      });
      sounds.playPop();
    }
    setIsEditing(false);
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    if (!onUpdateTask) return;
    const updatedSubtasks = subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    // If all subtasks become completed, also check if task should complete
    const allDone = updatedSubtasks.every((st) => st.completed);
    if (allDone && updatedSubtasks.length > 0 && !task.completed) {
      sounds.playComplete();
      fireConfetti(0.5, 0.6);
    } else {
      sounds.playPop();
    }

    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
    });
  };

  const formatDeadlineLabel = (days: number) => {
    if (days < 0) return { label: `${Math.abs(days)}d overdue`, status: 'overdue' };
    if (days === 0) return { label: 'Due today', status: 'today' };
    if (days === 1) return { label: 'Tomorrow', status: 'tomorrow' };
    return { label: `In ${days} days`, status: 'future' };
  };

  const deadlineInfo = formatDeadlineLabel(task.deadline);

  return (
    <div
      className={`task-card priority-border-${task.priority || 'medium'} ${
        task.completed ? 'completed' : ''
      } ${task.pinned ? 'pinned' : ''}`}
    >
      {/* Top Main Row */}
      <div className="task-main-row">
        {/* Checkbox button */}
        <button
          type="button"
          className={`task-checkbox ${task.completed ? 'checked' : ''}`}
          onClick={handleToggle}
          title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed ? <CheckIcon size={14} /> : null}
        </button>

        {/* Task Title & Meta */}
        <div className="task-content">
          {isEditing ? (
            <div className="task-edit-box">
              <input
                type="text"
                className="task-edit-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
              />
              <div className="edit-controls-row">
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
                  className="edit-mini-select"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Priority</option>
                </select>

                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as TaskCategory)}
                  className="edit-mini-select"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Health">Health</option>
                  <option value="Creative">Creative</option>
                  <option value="Finance">Finance</option>
                  <option value="General">General</option>
                </select>

                <div className="edit-deadline-stepper">
                  <span>Days:</span>
                  <input
                    type="number"
                    min="0"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(Math.max(0, parseInt(e.target.value) || 0))}
                    className="edit-mini-input"
                  />
                </div>

                <div className="edit-buttons">
                  <button className="edit-save-btn" onClick={handleSaveEdit}>
                    Save
                  </button>
                  <button className="edit-cancel-btn" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="task-title-line">
                <span className="task-title-text">{task.taskName}</span>
                {task.pinned && (
                  <span className="pinned-badge" title="Pinned to top">
                    <StarIcon size={12} filled className="text-gold" />
                  </span>
                )}
              </div>

              {/* Task Badges: Category, Deadline, Priority, Subtasks progress */}
              <div className="task-badges-row">
                <span className="task-badge badge-category">
                  <TagIcon size={11} />
                  <span>{task.category || 'General'}</span>
                </span>

                <span className={`task-badge badge-deadline badge-${deadlineInfo.status}`}>
                  <CalendarIcon size={11} />
                  <span>{deadlineInfo.label}</span>
                </span>

                <span className={`task-badge badge-priority badge-priority-${task.priority || 'medium'}`}>
                  <span className="priority-mini-dot" />
                  <span>{(task.priority || 'medium').toUpperCase()}</span>
                </span>

                {subtasks.length > 0 && (
                  <button
                    type="button"
                    className="task-badge badge-subtasks"
                    onClick={() => setShowSubtasks(!showSubtasks)}
                  >
                    <CheckCheckIcon size={12} />
                    <span>
                      {completedSubtasksCount}/{subtasks.length} steps
                    </span>
                    {showSubtasks ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Task Actions Toolbar */}
        <div className="task-actions-toolbar">
          {onTogglePin && (
            <button
              type="button"
              className={`task-action-btn pin-btn ${task.pinned ? 'active' : ''}`}
              title={task.pinned ? 'Unpin task' : 'Pin task to top'}
              onClick={() => {
                onTogglePin(task.id);
                sounds.playPop();
              }}
            >
              <StarIcon size={15} filled={task.pinned} />
            </button>
          )}

          {!isEditing && onUpdateTask && (
            <button
              type="button"
              className="task-action-btn edit-btn"
              title="Edit task"
              onClick={() => {
                setIsEditing(true);
                sounds.playPop();
              }}
            >
              <EditIcon size={15} />
            </button>
          )}

          <button
            type="button"
            className="task-action-btn delete-btn"
            title="Delete task"
            onClick={() => {
              if (onDeleteTask) {
                onDeleteTask(task);
              } else if (completeTask) {
                completeTask(task.taskName);
              }
            }}
          >
            <TrashIcon size={15} />
          </button>
        </div>
      </div>

      {/* Expandable Subtasks Checklist */}
      {showSubtasks && subtasks.length > 0 && (
        <div className="task-subtasks-dropdown">
          <div className="subtasks-dropdown-header">
            <span>Checklist ({completedSubtasksCount} of {subtasks.length} completed)</span>
            <div className="subtasks-mini-progress">
              <div
                className="subtasks-mini-fill"
                style={{
                  width: `${(completedSubtasksCount / subtasks.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <ul className="subtasks-items-list">
            {subtasks.map((st) => (
              <li
                key={st.id}
                className={`subtask-item ${st.completed ? 'completed' : ''}`}
                onClick={() => handleSubtaskToggle(st.id)}
              >
                <button
                  type="button"
                  className={`subtask-check-circle ${st.completed ? 'checked' : ''}`}
                >
                  {st.completed ? <CheckCircleIcon size={14} /> : <CircleIcon size={14} />}
                </button>
                <span className="subtask-text">{st.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TodoTask;
