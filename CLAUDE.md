# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a **microfrontend monorepo** using Vite Module Federation (`@module-federation/vite`). The `shell` app is the host; the other three apps are federated remotes that the shell loads at runtime.

```
apps/
├── shell    (host, port 3000) — sidebar nav, lazy-loads remote apps
├── todo     (remote, port 3001) — react-router-dom used internally
├── notes    (remote, port 3002) — localStorage persistence
└── weather  (remote, port 3003) — axios for API calls
```

**How federation works:**

- Each remote exposes its root component as `./App` via `exposes` in `vite.config.js`, built into `remoteEntry.js` (`filename: 'remoteEntry.js'`).
- The shell's `vite.config.js` declares each remote under an alias (`todoApp`, `notesApp`, `weatherApp`) and imports it as `todoApp/App` etc. in [apps/shell/src/App.jsx](apps/shell/src/App.jsx), wrapped in `React.lazy()` + `Suspense`.
- React and ReactDOM are shared as eager singletons (`{ singleton: true, eager: true }`) in every app to prevent duplicate copies.

**Where the shell loads remotes from — currently localhost.** The shell's `remotes` point at `http://localhost:{3001,3002,3003}/remoteEntry.js`. So the shell needs **all three remote dev servers running** to load them (see Development below). The production Vercel URLs are kept as commented-out lines beside each `entry` in the shell's `vite.config.js`; swap them back in once the apps are redeployed (the Vercel deployments are currently down).

**Known quirk:** all three remotes set `name: 'todoApp'` in their `federation()` config (copy-paste). This is harmless only because each remote is built and deployed independently to its own origin; the shell distinguishes them by alias + URL, not by the internal `name`. Keep this in mind before assuming the `name` field is meaningful.

**Entry point:** each app's `index.html` loads `src/main.jsx`, which renders the React root directly. A `src/bootstrap.jsx` file exists in each remote but is **unused legacy** — `@module-federation/vite` with eager shared singletons does not need the classic dynamic-import bootstrap indirection.

## Development

Every app is a standalone Vite project. Run commands from within the app directory (`apps/shell`, `apps/todo`, etc.):

```bash
pnpm dev        # dev server with HMR (shell:3000, todo:3001, notes:3002, weather:3003)
pnpm build      # production build to dist/
pnpm preview    # preview the production build
pnpm lint       # ESLint check
pnpm serve      # build + preview (remotes only — the shell has no serve script)
```

Because the shell currently targets localhost remotes, **all four dev servers must be running** to use the shell — start each in its own terminal:

```bash
cd apps/shell   && pnpm dev   # http://localhost:3000
cd apps/todo    && pnpm dev   # http://localhost:3001
cd apps/notes   && pnpm dev   # http://localhost:3002
cd apps/weather && pnpm dev   # http://localhost:3003
```

Each remote can also be opened directly on its own port to develop it in isolation.

There are no tests. The root `pnpm test` is a placeholder that exits non-zero.

## Deployment

Each app deploys independently to Vercel at its own origin (see the URLs in the shell's `remotes`). A remote change is only visible in the deployed shell after that remote is redeployed.

## Key Patterns

- **State:** Each app owns its state. Shell uses `useState` for active-tab switching. Notes persists to `localStorage`. `zustand` is a dependency in shell and todo but is **not imported anywhere yet** — no store is wired up.
- **Routing:** No global router. The shell switches views via state, not URL. Only the todo app uses `react-router-dom` internally.
- **Styling:** Inline `style={{}}` objects (see the shell sidebar) — no CSS framework.
- **ESLint:** Flat config (`eslint.config.js`) per app; `no-unused-vars` ignores names starting with uppercase or `_`. React 19 + Vite 5.
- **pnpm workspaces:** Root `package.json` (`packageManager: pnpm@10.27.0`) declares the workspace; app deps live in each app's `package.json`.
