// Improved validators covering full dataset relationships with all required logic

export interface Task {
  TaskID: string;
  TaskName: string;
  Category: string;
  Duration: number;
  RequiredSkills: string;
  PreferredPhases: string;
  MaxConcurrent: number;
}

export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number;
  RequestedTaskIDs: string;
  GroupTag: string;
  AttributesJSON: string;
}

export interface Worker {
  WorkerID: string;
  WorkerName: string;
  Skills: string;
  AvailableSlots: string;
  MaxLoadPerPhase: number;
  WorkerGroup: string;
  QualificationLevel: string;
}

const safeJSONParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

// Normalize PreferredPhases to explicit array
const normalizePhases = (phases: string): number[] => {
  if (phases.includes("-")) {
    const [start, end] = phases.split("-").map(Number);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  if (phases.includes("[")) {
    try {
      const list = JSON.parse(phases);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }
  return [];
};

export function validateData(
  tasks: Task[],
  clients: Client[],
  workers: Worker[]
) {
  const validTaskIDs = new Set(tasks.map((t) => t.TaskID));
  const allRequiredSkills = new Set(
    workers.flatMap((w) => w.Skills.split(",").map((s) => s.trim()))
  );
  const validWorkerIDs = new Set(workers.map((w) => w.WorkerID));

  // Normalize PreferredPhases in tasks
  tasks.forEach((task) => {
    (task as any).NormalizedPreferredPhases = normalizePhases(
      task.PreferredPhases
    );
  });

  const workerSlots = workers.map((w) => ({
    id: w.WorkerID,
    slots: safeJSONParse(w.AvailableSlots) || [],
  }));

  const invalidTasks = tasks.filter((task) => {
    const durationValid = Number(task.Duration) >= 1;
    const skillsValid = task.RequiredSkills.split(",").every((skill) =>
      allRequiredSkills.has(skill.trim())
    );
    const maxConcurrentValid =
      Number.isInteger(Number(task.MaxConcurrent)) &&
      Number(task.MaxConcurrent) >= 0;
    const phasesValid =
      (task as any).NormalizedPreferredPhases.length > 0 &&
      (task as any).NormalizedPreferredPhases.every(Number.isInteger);
    return !(durationValid && skillsValid && phasesValid && maxConcurrentValid);
  });

  const invalidClients = clients.filter((client) => {
    const priorityValid = [1, 2, 3, 4, 5].includes(
      Number(client.PriorityLevel)
    );
    const attributesValid = safeJSONParse(client.AttributesJSON) !== null;
    const requestedTasksValid = client.RequestedTaskIDs.split(",").every((id) =>
      validTaskIDs.has(id.trim())
    );
    return !(priorityValid && attributesValid && requestedTasksValid);
  });

  const invalidWorkers = workers.filter((worker) => {
    const skillsValid = worker.Skills.split(",").every(
      (skill) => skill.trim().length > 0
    );
    const availableSlotsParsed = safeJSONParse(worker.AvailableSlots);
    const slotsArrayValid =
      Array.isArray(availableSlotsParsed) &&
      availableSlotsParsed.every((p) => Number.isInteger(p));
    const maxLoadValid =
      Number.isInteger(Number(worker.MaxLoadPerPhase)) &&
      Number(worker.MaxLoadPerPhase) >= 0;
    return !(skillsValid && slotsArrayValid && maxLoadValid);
  });

  // Cross-Reference: Tasks must have at least one qualified worker for required skills
  const uncoveredSkillsTasks = tasks.filter((task) => {
    const requiredSkills = task.RequiredSkills.split(",").map((s) => s.trim());
    return !workers.some((worker) => {
      const workerSkills = worker.Skills.split(",").map((s) => s.trim());
      return requiredSkills.every((rs) => workerSkills.includes(rs));
    });
  });

  // Phase-slot saturation: total task durations per phase should not exceed total worker slots
  const phaseDurationMap: Record<number, number> = {};
  tasks.forEach((task) => {
    (task as any).NormalizedPreferredPhases.forEach((phase) => {
      phaseDurationMap[phase] =
        (phaseDurationMap[phase] || 0) + Number(task.Duration);
    });
  });

  const totalWorkerSlotsMap: Record<number, number> = {};
  workerSlots.forEach((ws) => {
    ws.slots.forEach((phase) => {
      totalWorkerSlotsMap[phase] = (totalWorkerSlotsMap[phase] || 0) + 1;
    });
  });

  const saturatedPhases = Object.entries(phaseDurationMap)
    .filter(([phase, duration]) => {
      const totalSlots = totalWorkerSlotsMap[Number(phase)] || 0;
      return duration > totalSlots;
    })
    .map(([phase]) => Number(phase));

  // Overloaded workers: tasks assigned per worker per phase should not exceed MaxLoadPerPhase (assumes future assignment logic)
  // For now, we only flag workers whose AvailableSlots < MaxLoadPerPhase overall
  const overloadedWorkers = workers.filter((worker) => {
    const availableSlotsParsed = safeJSONParse(worker.AvailableSlots) || [];
    return availableSlotsParsed.length < worker.MaxLoadPerPhase;
  });

  return {
    invalidTasks,
    invalidClients,
    invalidWorkers,
    uncoveredSkillsTasks,
    saturatedPhases,
    overloadedWorkers,
  };
}
export function generateRulesJson(
  rules: any[],
  priorities: Record<string, number>
) {
  return {
    rules,
    priorities,
    generatedAt: new Date().toISOString(),
  };
}
