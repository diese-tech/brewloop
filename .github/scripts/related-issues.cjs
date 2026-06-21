const AUTO_CLOSE_LINE =
  /^\s*(?:auto-close|related issues?)\s*:\s*(?<references>.+)$/gim;
const ISSUE_REFERENCE = /#(?<number>\d+)\b/g;

function extractRelatedIssueNumbers(body = "") {
  const issueNumbers = new Set();

  for (const lineMatch of body.matchAll(AUTO_CLOSE_LINE)) {
    const references = lineMatch.groups?.references ?? "";
    for (const issueMatch of references.matchAll(ISSUE_REFERENCE)) {
      issueNumbers.add(Number(issueMatch.groups.number));
    }
  }

  return [...issueNumbers];
}

module.exports = { extractRelatedIssueNumbers };
