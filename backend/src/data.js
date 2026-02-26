export const jiraTemplates = {
  epic: ["Business value", "Success criteria", "Cross-team dependencies"],
  feature: ["Scope summary", "Acceptance criteria", "Risks"],
  userStory: ["As a <persona>", "I want <capability>", "So that <benefit>"],
  task: ["Done definition", "Dependencies", "Time estimate"],
  bug: ["Observed behavior", "Expected behavior", "Repro steps"]
};

export const tipOfTheDay = [
  "Keep issue descriptions outcome-focused, not solution-focused.",
  "Use labels for reporting themes instead of ad-hoc text in summaries.",
  "Limit work in progress on Kanban boards to expose blockers faster."
];

export const mistakesToAvoid = [
  "Skipping acceptance criteria on user stories.",
  "Using Epic issues as a dumping ground for unrelated work.",
  "Assigning story points before clarifying dependencies.",
  "Ignoring SLA clock behavior when moving support tickets to Hold."
];

export const kbSources = [
  {
    id: "jira-standard-1",
    type: "scraped",
    title: "JIRA issue hygiene",
    snippet: "Mandatory fields should be enforced by workflow validators."
  },
  {
    id: "azure-mixed-board",
    type: "scraped",
    title: "Azure DevOps board mapping",
    snippet: "Keep board columns aligned to shared states when teams mix tools."
  },
  {
    id: "ai-coach-1",
    type: "ai",
    title: "Sprint planning coaching",
    snippet: "During planning, challenge stories that lack testable outcomes."
  }
];
