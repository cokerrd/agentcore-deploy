# Contributing

Thanks for your interest in contributing! Bug reports, fixes, docs improvements, and feature ideas are all welcome.

## Reporting bugs

Open a [bug report](https://github.com/cokerrd/agentcore-deploy/issues/new?template=bug_report.yml) with:

- What you expected to happen and what happened instead
- Your workflow snippet (remove any secrets and account IDs)
- The relevant log output from the failed step

## Suggesting features

Open a [feature request](https://github.com/cokerrd/agentcore-deploy/issues/new?template=feature_request.yml) describing the problem you want to solve. Please wait for feedback before writing a large change.

Small fixes and docs changes can go straight to a pull request.

## Questions and discussion

Have a question, an early idea, or want to talk through a use case? Start a [discussion](https://github.com/cokerrd/agentcore-deploy/discussions).

## Development

This action runs on Node 24 and is executed from the bundled `dist/index.js`.

```bash
pnpm install
pnpm test:all      # run lint and tests
pnpm action        # test the github action locally
```

## Submitting a pull request

1. Fork the repository and create a branch from `main`.
2. Make your change and add or update tests where it makes sense.
3. Run `pnpm test:all` and optionally `pnpm action`.
4. Open a pull request and describe what changed and why. Mention the related issue number if there is one.

## Pull request checklist

- [ ] Tests pass
- [ ] README and `action.yml` are updated if inputs or outputs changed
- [ ] Commit messages are clear and descriptive

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE)