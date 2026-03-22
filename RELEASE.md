# Release Process

## Versioning

This repository uses Semantic Versioning (`MAJOR.MINOR.PATCH`).

## Prepare a release

1. Update spec docs and schemas.
2. Update `CHANGELOG.md`.
3. Update `VERSION`.
4. Commit changes to `main`.

## Publish a release

```bash
git tag v$(cat VERSION)
git push origin main --tags
```

Pushing a tag `vX.Y.Z` triggers GitHub Actions to create a GitHub Release.
