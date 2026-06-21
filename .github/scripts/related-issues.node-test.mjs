import assert from "node:assert/strict";
import test from "node:test";

import relatedIssues from "./related-issues.cjs";

const { extractRelatedIssueNumbers } = relatedIssues;

test("extracts unique issue numbers from explicit auto-close lines", () => {
  assert.deepEqual(
    extractRelatedIssueNumbers(
      "Auto-close: #12, #34\nRelated issues: #34 and #56",
    ),
    [12, 34, 56],
  );
});

test("ignores ordinary references and empty template placeholders", () => {
  assert.deepEqual(
    extractRelatedIssueNumbers(
      "Refs #12 for context.\nAuto-close:\nNo issue should close.",
    ),
    [],
  );
});

test("supports singular related issue labels and mixed casing", () => {
  assert.deepEqual(extractRelatedIssueNumbers("RELATED ISSUE: #9"), [9]);
});
