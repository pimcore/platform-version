# Pull Request Guidelines for Contributors

Before the Pimcore team reviews a pull request, it must pass several automated checks. PRs that do not meet these requirements are automatically converted to draft and will not be reviewed until the issues are resolved.

## 1. Issue Link

Every PR must reference a valid tracking issue in pimcore/platform-version using a closing keyword in the PR description (not in a comment).

Examples of valid references:

```
Closes pimcore/platform-version#1234
Fixes pimcore/platform-version#1234
```

The referenced issue must exist and be open. References to other repositories are not accepted.

## 2. CI & Merge Readiness

The PR must have no merge conflicts with the base branch, and all CI checks must pass before the team will review it. As long as checks are still running, the PR remains in its current state — it is only converted to draft on a definitive failure.

### What happens on failure

If either check fails, the PR is automatically converted to draft and a comment is posted explaining the exact reason. Once the issue is resolved, mark the PR as Ready for review to trigger a new evaluation.

## Living framework

These rules reflect our current quality baseline and will evolve over time. We may add, adjust, or remove checks as the project's needs change. Check this document for the latest requirements before opening a PR.
