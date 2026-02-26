import express from "express";
import cors from "cors";
import { jiraTemplates, tipOfTheDay, mistakesToAvoid, kbSources } from "./data.js";
import {
  MANDATORY_FIELDS,
  ISSUE_TYPES,
  SUPPORT_REQUIRED_FIELDS,
  validateMandatoryFields,
  suggestStoryPoints,
  suggestPriority,
  supportSlaStatus,
  buildCoachAnswer,
  normalizeIssueType
} from "./domain.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/meta", (req, res) => {
  res.json({
    issueTypes: ISSUE_TYPES,
    mandatoryFields: MANDATORY_FIELDS,
    supportRequiredFields: SUPPORT_REQUIRED_FIELDS,
    boards: ["Azure DevOps Board", "Sprint Board", "Kanban Board"]
  });
});

app.get("/api/tip", (req, res) => {
  const tip = tipOfTheDay[Math.floor(Math.random() * tipOfTheDay.length)];
  res.json({ tip });
});

app.get("/api/mistakes", (req, res) => {
  res.json({ mistakes: mistakesToAvoid });
});

app.get("/api/kb", (req, res) => {
  const mode = String(req.query.mode || "all").toLowerCase();
  const allowedModes = ["all", "scraped", "ai"];

  if (!allowedModes.includes(mode)) {
    return res.status(400).json({ error: `Invalid mode '${mode}'. Allowed: ${allowedModes.join(", ")}` });
  }

  const items = mode === "all" ? kbSources : kbSources.filter((source) => source.type === mode);
  return res.json({ mode, items });
});

app.post("/api/coach", (req, res) => {
  const {
    question = "",
    issueType = "task",
    description = "",
    dueDate,
    hasCustomerImpact = false,
    components,
    fixedVersion,
    labels,
    byWhen
  } = req.body || {};

  const mandatoryCheck = validateMandatoryFields({ components, fixedVersion, dueDate, labels, byWhen });
  if (!mandatoryCheck.valid) {
    return res.status(400).json({
      error: "Mandatory Jira fields are missing",
      missingFields: mandatoryCheck.missing
    });
  }

  const normalizedType = normalizeIssueType(issueType);
  if (!ISSUE_TYPES.includes(normalizedType)) {
    return res.status(400).json({
      error: `Unsupported issue type '${issueType}'`,
      supportedIssueTypes: ISSUE_TYPES
    });
  }

  const storyPoints = suggestStoryPoints(description || question, normalizedType);
  const priority = suggestPriority({ issueType: normalizedType, dueDate, hasCustomerImpact });
  const templateKey = normalizedType === "user story" ? "userStory" : normalizedType;
  const templates = jiraTemplates[templateKey] || jiraTemplates.task;

  return res.json({
    answer: buildCoachAnswer({ question, issueType: normalizedType, storyPoints, priority }),
    suggestedStoryPoints: storyPoints,
    suggestedPriority: priority,
    recommendedTemplateSections: templates,
    issueType: normalizedType
  });
});

app.post("/api/support/sla", (req, res) => {
  const { status = "Open", enteredAt = new Date().toISOString() } = req.body || {};
  res.json(supportSlaStatus(status, enteredAt));
});

app.listen(PORT, () => {
  console.log(`JiraSense backend running on port ${PORT}`);
});
