# Icora CLI

Icora is a CLI for fetching Icora icon components into a React TypeScript project.

## Links

- Website: https://icora.vercel.app/
- API: https://icora-api.vercel.app/api
- Package: https://www.npmjs.com/package/icora

## Requirements

- Node.js `>=18.18.0`

## Installation

Use the CLI directly:

```bash
npx icora@latest init
```

Or install it as a dev dependency:

```bash
npm install --save-dev icora
```

## Platform

Icora currently has three parts:

- `icora` CLI for adding icons to your project
- Icora website for browsing documentation and icons: https://icora.vercel.app/
- Icora API for icon delivery: https://icora-api.vercel.app/api

## Commands

Initialize or update the local config:

```bash
npx icora init
npx icora init --output src/assets/icons
```

Add one or more icons:

```bash
npx icora add ai-AiFillDelete
npx icora add ai-AiFillDelete bs-BsCartCheck
```

Add a full library bundle:

```bash
npx icora add-all ai
```

List supported libraries:

```bash
npx icora list
```

Run environment diagnostics:

```bash
npx icora doctor
```

## Output Controls

The `add` and `add-all` commands support:

- `--output <dir>` to override the configured directory for one run
- `--dry-run` to preview files without writing them
- `--force` to overwrite existing generated files
- `--skip-existing` to leave existing files untouched

## Configuration

The canonical config file is `.iconiumrc.json`.

Example:

```json
{
  "version": 1,
  "targetDirectory": "src/assets/icons"
}
```

Legacy `.iconiumrc` files are still read for compatibility, but `init` now writes `.iconiumrc.json`.

## API Usage

The CLI fetches generated icons from the Icora API.

Base URL:

```txt
https://icora-api.vercel.app/api
```

Examples:

```txt
GET /icons?library=ai&name=AiFillDelete
GET /icons/ai
```

## Error Handling

Icora prints stable error categories and actionable next steps for:

- invalid icon identifiers
- unsupported libraries
- config file issues
- API failures and timeouts
- file write conflicts and permission errors

## Supported Libraries

Run `npx icora list` to print the current supported library ids.

For interactive browsing and documentation, use the website:

https://icora.vercel.app/

## Development

```bash
npm install
npm run check
```

Quality gates:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run pack:dry-run`

## Additional Feature Ideas

- `search <query>` for icon discovery
- `info <library-icon>` for metadata inspection
- local metadata caching for faster repeated runs
- richer output targets if the package later expands beyond React TSX

## License

ISC
