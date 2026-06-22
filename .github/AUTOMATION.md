# Repository automation

## Closing issues from merged pull requests

GitHub natively closes issues when a pull request targeting `main` contains a
closing keyword:

```text
Closes #123
Fixes #123
Resolves #123
```

BrewLoop also supports explicit grouped references:

```text
Auto-close: #123, #456
Related issues: #123, #456
```

When that pull request is merged into `main`,
`.github/workflows/auto-close-related-issues.yml` closes the listed open issues
as completed and adds a comment linking to the merged pull request.

Ordinary references such as `Refs #123` do not close an issue. This is
intentional: only explicit closing instructions should change issue state.

The parser is covered by:

```bash
node --test .github/scripts/related-issues.node-test.mjs
```

## Quality checks

`.github/workflows/quality.yml` runs on pull requests and pushes to `main`.

It verifies:

- ESLint
- Vitest unit tests
- The issue-closing parser tests
- The production Next.js build
- Playwright customer, staff, and owner browser flows

Four known-gap Playwright cases remain explicitly marked `fixme` until their
product behavior is implemented.
