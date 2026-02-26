import test from "node:test";
import assert from "node:assert/strict";
import {
  suggestStoryPoints,
  suggestPriority,
  supportSlaStatus,
  validateMandatoryFields,
  buildCoachAnswer
} from "../src/domain.js";

test("validateMandatoryFields reports missing fields", () => {
  const result = validateMandatoryFields({ components: "UI", labels: "frontend" });
  assert.equal(result.valid, false);
  assert.deepEqual(result.missing.sort(), ["byWhen", "dueDate", "fixedVersion"].sort());
});

test("suggestStoryPoints maps complexity into fibonacci-like scale", () => {
  const points = suggestStoryPoints("cross-service migration with integration and security concerns", "feature");
  assert.ok([1, 2, 3, 5, 8, 13].includes(points));
  assert.ok(points >= 5);
});

test("suggestPriority returns Highest for customer impact", () => {
  const priority = suggestPriority({ issueType: "task", dueDate: null, hasCustomerImpact: true });
  assert.equal(priority, "Highest");
});

test("supportSlaStatus pauses SLA on hold and can breach", () => {
  const oldDate = new Date(Date.now() - (6 * 24 * 60 * 60 * 1000)).toISOString();
  const result = supportSlaStatus("hold", oldDate);
  assert.equal(result.slaPaused, true);
  assert.equal(result.breached, true);
  assert.equal(result.remainingDays, 0);
});

test("buildCoachAnswer provides comment format guidance", () => {
  const answer = buildCoachAnswer({
    question: "Can you suggest a comment?",
    issueType: "task",
    storyPoints: 3,
    priority: "Medium"
  });
  assert.match(answer, /Suggested comment style/);
});
