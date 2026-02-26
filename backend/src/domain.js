export const MANDATORY_FIELDS = [
  "components",
  "fixedVersion",
  "dueDate",
  "labels",
  "byWhen"
];

export const ISSUE_TYPES = [
  "feature",
  "epic",
  "user story",
  "task",
  "subtask",
  "bug",
  "initiative"
];

export const SUPPORT_REQUIRED_FIELDS = ["csatFeedback", "helpTopic", "assignee", "component"];

const POINT_SCALE = [1, 2, 3, 5, 8, 13];

export function normalizeIssueType(issueType = "task") {
  return String(issueType).trim().toLowerCase();
}

export function suggestStoryPoints(description = "", issueType = "task") {
  const normalized = normalizeIssueType(issueType);
  const text = String(description).toLowerCase();
  const complexityKeywords = ["integration", "migration", "security", "multi-team", "unknown", "legacy", "cross-service"];
  const keywordCount = complexityKeywords.filter((keyword) => text.includes(keyword)).length;
  const lengthWeight = text.length > 360 ? 2 : text.length > 180 ? 1 : 0;

  const base = normalized === "bug" ? 2 : normalized === "epic" || normalized === "initiative" ? 5 : 3;
  const raw = base + keywordCount + lengthWeight;
  const nearest = POINT_SCALE.reduce((prev, curr) => (Math.abs(curr - raw) < Math.abs(prev - raw) ? curr : prev), POINT_SCALE[0]);

  return nearest;
}

export function suggestPriority({ issueType, dueDate, hasCustomerImpact }) {
  const normalized = normalizeIssueType(issueType);

  if (Boolean(hasCustomerImpact)) return "Highest";
  if (normalized === "bug") return "High";

  if (dueDate) {
    const due = new Date(dueDate);
    if (!Number.isNaN(due.getTime())) {
      const now = new Date();
      const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      if (days <= 1) return "Highest";
      if (days <= 3) return "High";
      if (days <= 7) return "Medium";
    }
  }

  return "Low";
}

export function supportSlaStatus(status, enteredAt) {
  const normalizedStatus = String(status || "open").toLowerCase().trim();
  const pausedStatuses = ["waiting for information", "hold"];

  if (!pausedStatuses.includes(normalizedStatus)) {
    return { slaPaused: false, remainingDays: null, breached: false };
  }

  const entered = new Date(enteredAt);
  const enteredMs = entered.getTime();

  if (Number.isNaN(enteredMs)) {
    return { slaPaused: true, remainingDays: 5, breached: false };
  }

  const elapsedDays = Math.floor((Date.now() - enteredMs) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, 5 - elapsedDays);

  return {
    slaPaused: true,
    remainingDays,
    breached: remainingDays === 0
  };
}

export function validateMandatoryFields(payload = {}) {
  const missing = MANDATORY_FIELDS.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === "";
  });

  return {
    valid: missing.length === 0,
    missing
  };
}

export function buildCoachAnswer({ question, issueType, storyPoints, priority }) {
  const normalizedType = normalizeIssueType(issueType);
  const q = String(question || "").toLowerCase();

  const base = `For this ${normalizedType}, plan work so it is demonstrable within a sprint, and align Jira/Azure DevOps states to avoid board drift.`;

  if (q.includes("comment")) {
    return `${base} Suggested comment style: context → decision → owner → due date.`;
  }

  if (q.includes("scrum") || q.includes("coach")) {
    return `${base} Scrum master coaching: challenge unclear acceptance criteria before commitment.`;
  }

  return `${base} Recommended point size: ${storyPoints}, priority: ${priority}.`;
}
