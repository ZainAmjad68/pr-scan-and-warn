# PR Scan and Warn - GitHub Action

This action Scans the Changes in a PR and Warns about any unexpected/dangerous Words or Actions

## Inputs

### `words-to-scan-for`

**Required** A comma separated list of the words that you want to scan for in the PR.

## Outputs

### `annotations`

The Annotations to display on the PR.

## Example usage

```yaml
uses: actions/pr-scan-and-warn@e76147da8e5c81eaf017dede5645551d4b94427b
with:
  words-to-scan-for: 'destroy(), dropTable()'
```
