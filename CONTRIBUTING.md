# Contributing to NEMO CrudeFlow

Thanks for contributing.

## Development Workflow

1. Create a feature branch from `main`.
2. Keep PRs scoped (one feature/fix per PR).
3. Run frontend and backend locally before opening PR.
4. Include screenshots for UI changes.
5. Update docs for behavior or API contract changes.

## Pull Request Checklist

- [ ] No secrets or local `.env` files in diff
- [ ] No virtualenv or `node_modules` artifacts
- [ ] Build and runtime sanity checks pass
- [ ] Relevant docs updated (`README`/`docs/*`)
- [ ] Clear PR description and test notes

## Coding Guidelines

- Prefer small, explicit functions over broad abstractions.
- Keep API contracts backward compatible when possible.
- Avoid unnecessary rewrites of stable business logic.
- Prioritize readability and operational reliability.

