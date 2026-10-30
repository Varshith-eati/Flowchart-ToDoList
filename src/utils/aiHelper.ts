import { ITask, PriorityLevel, TaskCategory, ISubTask } from '../Interfaces';

// Natural Language Parser for smart input
export function parseSmartTaskInput(input: string): {
  taskName: string;
  deadline: number;
  category: TaskCategory;
  priority: PriorityLevel;
} {
  let cleaned = input.trim();
  let deadline = 1; // default: 1 day
  let category: TaskCategory = 'General';
  let priority: PriorityLevel = 'medium';

  // Check for priority patterns: !urgent, !high, !med, !low
  if (/\b!(urgent|critical|p0)\b/i.test(cleaned)) {
    priority = 'urgent';
    cleaned = cleaned.replace(/\b!(urgent|critical|p0)\b/gi, '').trim();
  } else if (/\b!(high|p1|important)\b/i.test(cleaned)) {
    priority = 'high';
    cleaned = cleaned.replace(/\b!(high|p1|important)\b/gi, '').trim();
  } else if (/\b!(low|p3)\b/i.test(cleaned)) {
    priority = 'low';
    cleaned = cleaned.replace(/\b!(low|p3)\b/gi, '').trim();
  } else if (/\b!(med|medium|p2)\b/i.test(cleaned)) {
    priority = 'medium';
    cleaned = cleaned.replace(/\b!(med|medium|p2)\b/gi, '').trim();
  }

  // Check for categories: #work, #personal, #health, #creative, #finance
  if (/\b#(work|job|office|client)\b/i.test(cleaned)) {
    category = 'Work';
    cleaned = cleaned.replace(/\b#(work|job|office|client)\b/gi, '').trim();
  } else if (/\b#(personal|life|home|family)\b/i.test(cleaned)) {
    category = 'Personal';
    cleaned = cleaned.replace(/\b#(personal|life|home|family)\b/gi, '').trim();
  } else if (/\b#(health|fitness|gym|diet|workout)\b/i.test(cleaned)) {
    category = 'Health';
    cleaned = cleaned.replace(/\b#(health|fitness|gym|diet|workout)\b/gi, '').trim();
  } else if (/\b#(creative|design|art|write|music)\b/i.test(cleaned)) {
    category = 'Creative';
    cleaned = cleaned.replace(/\b#(creative|design|art|write|music)\b/gi, '').trim();
  } else if (/\b#(finance|money|budget|tax|bills)\b/i.test(cleaned)) {
    category = 'Finance';
    cleaned = cleaned.replace(/\b#(finance|money|budget|tax|bills)\b/gi, '').trim();
  }

  // Check for deadline patterns: "in X days", "X days", "tomorrow", "today", "in a week"
  const inDaysMatch = cleaned.match(/\bin\s+(\d+)\s+days?\b/i) || cleaned.match(/(\d+)\s+days?\b/i);
  if (inDaysMatch) {
    deadline = parseInt(inDaysMatch[1], 10);
    cleaned = cleaned.replace(inDaysMatch[0], '').trim();
  } else if (/\btomorrow\b/i.test(cleaned)) {
    deadline = 1;
    cleaned = cleaned.replace(/\btomorrow\b/gi, '').trim();
  } else if (/\btoday\b/i.test(cleaned)) {
    deadline = 0;
    cleaned = cleaned.replace(/\btoday\b/gi, '').trim();
  } else if (/\bnext\s+week\b/i.test(cleaned) || /\bin\s+a\s+week\b/i.test(cleaned)) {
    deadline = 7;
    cleaned = cleaned.replace(/\b(next\s+week|in\s+a\s+week)\b/gi, '').trim();
  }

  // If category wasn't explicit, infer by keywords
  const lower = cleaned.toLowerCase();
  if (category === 'General') {
    if (lower.includes('workout') || lower.includes('gym') || lower.includes('run') || lower.includes('doctor') || lower.includes('water') || lower.includes('walk') || lower.includes('stretch')) {
      category = 'Health';
    } else if (lower.includes('invoice') || lower.includes('tax') || lower.includes('bank') || lower.includes('pay') || lower.includes('budget') || lower.includes('rent') || lower.includes('bill')) {
      category = 'Finance';
    } else if (lower.includes('design') || lower.includes('draw') || lower.includes('write') || lower.includes('sketch') || lower.includes('article') || lower.includes('video')) {
      category = 'Creative';
    } else if (lower.includes('meeting') || lower.includes('email') || lower.includes('code') || lower.includes('deploy') || lower.includes('client') || lower.includes('presentation') || lower.includes('bug')) {
      category = 'Work';
    } else if (lower.includes('groceries') || lower.includes('clean') || lower.includes('laundry') || lower.includes('call mom') || lower.includes('dinner')) {
      category = 'Personal';
    }
  }

  return {
    taskName: cleaned || input,
    deadline: isNaN(deadline) ? 1 : deadline,
    category,
    priority,
  };
}

// AI Subtask Breakdown Assistant
export function generateSubtasks(taskName: string): ISubTask[] {
  const name = taskName.toLowerCase();

  const makeSubtask = (title: string): ISubTask => ({
    id: 'sub-' + Math.random().toString(36).substring(2, 9),
    title,
    completed: false,
  });

  if (name.includes('trip') || name.includes('vacation') || name.includes('travel')) {
    return [
      makeSubtask('Compare & book transport/flights'),
      makeSubtask('Reserve accommodation & check check-in times'),
      makeSubtask('Pack clothes, chargers & travel docs'),
      makeSubtask('Set work email out-of-office notice'),
    ];
  }

  if (name.includes('study') || name.includes('exam') || name.includes('test') || name.includes('quiz')) {
    return [
      makeSubtask('Review syllabus & summarize key topics'),
      makeSubtask('Make 15-20 flashcards for core terms'),
      makeSubtask('Solve 1 past paper or timed practice quiz'),
      makeSubtask('Review mistakes & clarify doubts'),
    ];
  }

  if (name.includes('meeting') || name.includes('presentation') || name.includes('pitch') || name.includes('slide')) {
    return [
      makeSubtask('Outline meeting goal and 3 key takeaways'),
      makeSubtask('Draft 5-7 core slides or summary doc'),
      makeSubtask('Do a 5-minute dry-run rehearsal'),
      makeSubtask('Send agenda & meeting invite to attendees'),
    ];
  }

  if (name.includes('clean') || name.includes('tidy') || name.includes('organize') || name.includes('apartment') || name.includes('room')) {
    return [
      makeSubtask('Pick up clothes and clear flat surfaces'),
      makeSubtask('Wipe down desks and kitchen counters'),
      makeSubtask('Vacuum floors & take out trash'),
      makeSubtask('Open windows for 15 min fresh air'),
    ];
  }

  if (name.includes('code') || name.includes('feature') || name.includes('bug') || name.includes('api') || name.includes('app')) {
    return [
      makeSubtask('Reproduce bug or sketch solution architecture'),
      makeSubtask('Write unit tests for expected behavior'),
      makeSubtask('Implement clean code solution & run linter'),
      makeSubtask('Open PR with clear test screenshots'),
    ];
  }

  if (name.includes('grocery') || name.includes('shop') || name.includes('cook') || name.includes('meal')) {
    return [
      makeSubtask('Check fridge & pantry inventory'),
      makeSubtask('Write down fresh produce & protein items'),
      makeSubtask('Pick up items & check off list'),
      makeSubtask('Unpack and prep veggies for easy cooking'),
    ];
  }

  if (name.includes('workout') || name.includes('gym') || name.includes('fitness') || name.includes('run')) {
    return [
      makeSubtask('5-min dynamic warmup & joint mobility'),
      makeSubtask('Main focused exercise sets (20-30 min)'),
      makeSubtask('Cool-down stretching & hydration'),
      makeSubtask('Log reps/distance in workout tracker'),
    ];
  }

  if (name.includes('budget') || name.includes('tax') || name.includes('invoice') || name.includes('finance')) {
    return [
      makeSubtask('Collect all receipts and bank statements'),
      makeSubtask('Categorize recurring expenses vs one-offs'),
      makeSubtask('Log into billing portal and send invoices'),
      makeSubtask('Transfer monthly savings to reserve fund'),
    ];
  }

  // General smart breakdown
  return [
    makeSubtask(`Clarify the outcome for "${taskName.slice(0, 25)}..."`),
    makeSubtask('Gather necessary documents or materials'),
    makeSubtask('Complete the primary 25-minute deep focus block'),
    makeSubtask('Double-check final details and sign off'),
  ];
}

// AI Daily Coach & Advice based on user's real task state
export function getDailyCoachInsight(tasks: ITask[]): {
  headline: string;
  tip: string;
  recommendedTaskId?: string;
} {
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedToday = tasks.filter((t) => t.completed).length;

  if (activeTasks.length === 0 && tasks.length > 0) {
    return {
      headline: "All clear! You've crushed today's list ✨",
      tip: "Everything on your radar is done. Relax, take a walk, or use the Scratchpad to brainstorm tomorrow's goals.",
    };
  }

  if (tasks.length === 0) {
    return {
      headline: 'Fresh canvas for today 🌿',
      tip: 'Start small: pick 1-3 essential things you want to complete before sunset. Quality beats quantity.',
    };
  }

  const urgentTasks = activeTasks.filter((t) => t.priority === 'urgent' || t.deadline <= 0);
  if (urgentTasks.length > 0) {
    const topUrgent = urgentTasks[0];
    return {
      headline: `Urgent focus needed: "${topUrgent.taskName}"`,
      tip: `This task is due immediately. Put on the Pomodoro timer and give it 25 distraction-free minutes.`,
      recommendedTaskId: topUrgent.id,
    };
  }

  const highPriority = activeTasks.filter((t) => t.priority === 'high');
  if (highPriority.length > 0) {
    return {
      headline: 'High-impact work ready for you',
      tip: `Tackle "${highPriority[0].taskName}" while your energy is highest. It will give you the strongest momentum today.`,
      recommendedTaskId: highPriority[0].id,
    };
  }

  if (completedToday >= 3) {
    return {
      headline: `Great rhythm! ${completedToday} tasks completed today 🔥`,
      tip: `You're in the flow zone. Knock out one more quick task or take a 10-minute coffee recharge.`,
    };
  }

  return {
    headline: `${activeTasks.length} pending items in flight`,
    tip: `Focus on one single task at a time. Multi-tasking drains focus; single-tasking gets you across the finish line.`,
    recommendedTaskId: activeTasks[0]?.id,
  };
}

// Starter packs for real humans
export const STARTER_PACKS = [
  {
    title: '☀️ Morning Momentum',
    description: '3 quick wins to kickstart a productive day',
    tasks: [
      { taskName: 'Hydrate with a tall glass of water & light stretch', deadline: 0, category: 'Health' as TaskCategory, priority: 'medium' as PriorityLevel },
      { taskName: 'Review top 3 priorities for today', deadline: 0, category: 'Work' as TaskCategory, priority: 'high' as PriorityLevel },
      { taskName: 'Clear inbox to zero (quick 10-min triage)', deadline: 0, category: 'Work' as TaskCategory, priority: 'low' as PriorityLevel },
    ],
  },
  {
    title: '🚀 Deep Work Sprint',
    description: 'Focused execution pack for creators & builders',
    tasks: [
      { taskName: 'Draft project architecture & outline requirements', deadline: 1, category: 'Work' as TaskCategory, priority: 'urgent' as PriorityLevel },
      { taskName: 'Ship first working prototype or key milestone', deadline: 2, category: 'Work' as TaskCategory, priority: 'high' as PriorityLevel },
      { taskName: 'Document progress and share update with team', deadline: 2, category: 'Work' as TaskCategory, priority: 'medium' as PriorityLevel },
    ],
  },
  {
    title: '🌿 Sunday Reset',
    description: 'Get life and mind organized for the week ahead',
    tasks: [
      { taskName: 'Prep grocery list and fresh meals for Monday-Wednesday', deadline: 1, category: 'Personal' as TaskCategory, priority: 'medium' as PriorityLevel },
      { taskName: 'Clean desk, wash laundry & organize workspace', deadline: 1, category: 'Personal' as TaskCategory, priority: 'low' as PriorityLevel },
      { taskName: 'Sync calendar and set 3 weekly intentions', deadline: 2, category: 'General' as TaskCategory, priority: 'medium' as PriorityLevel },
    ],
  },
];

