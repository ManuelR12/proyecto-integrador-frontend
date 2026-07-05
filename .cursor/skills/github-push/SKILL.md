---
name: github-push
description: Commits, pushes, and drafts PR descriptions for this repository. Use when the user asks to push to GitHub, push a branch, publish commits, or prepare a pull request after pushing.
---

# GitHub Push

## When to apply

User requests: push, push to GitHub, push the branch, publish commits, or similar.

## Push workflow

1. Run in parallel: `git status`, `git diff`, `git log -3 --oneline`, and check upstream tracking.
2. Stage only files relevant to the requested scope (do not mix unrelated features).
3. **Format and lint (required before every commit):**
   - `npx prettier --write "src/**/*.{ts,tsx}"`
   - `npm run lint`
   - If Prettier modified files, re-stage them. Fix any lint errors before committing — do not push with failing lint.
4. Commit with a concise message (1–2 sentences, focus on why). Use HEREDOC for the message.
   - Header max **72** chars; body lines max **100** chars (commitlint `body-max-line-length`).
   - Wrap long body text across multiple lines instead of one long paragraph.
5. Push: `git push -u origin HEAD` (request `all` permissions if needed).
6. Verify with `git status` after push.

Follow the user's git safety rules: no force push, no config changes, no commit unless explicitly requested.

## Required output after every push

After a successful push, **always** provide PR description text using this exact structure. Replace placeholders with content derived from the actual diff; keep the section headings and layout unchanged.

```markdown
[One-line description of the main integration or feature — e.g. what was wired and through which modules.]

## Summary

Briefly explain what this PR does and why.

## Changes

- Describe the main changes, keep it concise

## Notes

(optional) Anything reviewers should be aware of
```

### Example (profile feature)

```markdown
Wire GET/PATCH/DELETE /auth/profile and /auth/account through profileService, with shared UserProfileContext and the Perfil UI including delete-account flow.

## Summary

Briefly explain what this PR does and why.

## Changes

- Describe the main changes, keep it concise

## Notes

(optional) Anything reviewers should be aware of
```

When generating the PR body for the user:

1. Write a specific one-line lead (first paragraph) summarizing the push.
2. Fill **Summary** with 1–3 sentences on purpose and motivation.
3. Fill **Changes** with concise bullet points from the commit(s).
4. Fill **Notes** only when there is something reviewers need (env vars, breaking changes, follow-ups); otherwise keep the optional placeholder or omit substantive notes.

If the user also asks to open a PR, use `gh pr create` with this body (HEREDOC). Otherwise, output the markdown in the chat so they can paste it into GitHub.
