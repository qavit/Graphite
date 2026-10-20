# Stage 0 · Gate 2 — Consumer boundary decision

Question: how does `qavit/kakau-lab` consume Graphite without a second `DiagramSpec`, a local-only dependency, or heavy infrastructure?

## Audit

**Graphite**
- `packages/diagram-spec` (types, constants), `packages/render-svg` (pure `renderToSVG`), `packages/templates` (not needed by Lab).
- Both packages were `private`, had `main: dist/index.js` but **no `type`, no `exports`**, and `tsc` emitted ESM with extensionless specifiers. `dist/` is git-ignored. License `UNLICENSED`.
- Interaction code (`applyDiagramEditIntent`, selection resolver, pointer→spec mapping) lives in `apps/web`, not in a package.

**Kakau Lab**
- Next 16 on `vinext` (Vite) deployed to Cloudflare Workers via wrangler; `npm` + `package-lock.json`; `"type": "module"`.
- Unit tests are `node --test tests/*.test.mjs` importing `.ts` source directly (Node type stripping). Anything a model/adapter imports must therefore resolve in **plain Node ESM**, not just in a bundler.
- FBD: `models/fbd.ts` (`FbdLabState`, `updateFbdForce`), `lib/science/fbd.ts`, `components/FbdLab.tsx` (hand-written inline SVG, slider-driven direction), `/fbd` route.
- AGENTS.md layering: `models` may import only `lib/science`; `components` combines layers. A Graphite adapter therefore belongs in `components/`, never in `models/`.

## Options and experiments (all throwaway, in a scratch dir)

| Option | Result |
|---|---|
| **A. Packages** (`npm pack` → install both tarballs) | Installs fine. **Bundler (Vite lib build): works** on the original packages, tree-shaking test-only code. **Plain Node ESM: failed** (`ERR_MODULE_NOT_FOUND …/dist/renderer`). After the mechanical packaging fix in this PR (`type: module`, `exports`, `.js` specifiers, `files`): **Node ESM, Node `.ts`, and Vite bundle all pass**. Tarball is ~11 kB bundled output. |
| **B. Git dependency** (`npm i github:qavit/Graphite#branch`) | Installs the whole monorepo as one package `graphite-monorepo`: no `@graphite/*` resolution, no `dist` (git-ignored, no `prepare`), lockfile records `git+ssh`. Not viable without a build-on-install step and subpath support npm doesn't have. **Rejected.** |
| **C. Build artifact / browser module** | Would work (the bundle is 11 kB) but adds a second artifact to version and to hand-write types for; no advantage over A once A resolves. **Rejected unless A is blocked.** |
| **D. Subtree / copy / monorepo** | Not tried; creates a second `DiagramSpec`. **High cost, not recommended.** |

## Recommendation

**A — publish `diagram-spec` and `render-svg` as small versioned packages.** Keep `templates` and the Workbench UI out of the consumer surface.

- The packaging fix in this PR is the only code change needed for Lab to import them; it changes no behaviour (all tests unchanged and green).
- **Open decision (owner):** registry and name. `@graphite` is not an owned npm scope (`npm view` 404, `qavit` scope not found). Options: claim an npm scope, or GitHub Packages under `@qavit`. Lab's Cloudflare build needs `npm ci` to resolve it, so a registry (not a local path) is required before a Lab PR can merge. License must also change from `UNLICENSED`.
- **Interim for Gate 3 development only:** install the two tarballs (`npm pack`) or `file:` links into a Lab working branch. That is explicitly non-reproducible and must not be merged.
- **Interaction code:** Lab needs the neutral `DiagramEditIntent` and a pointer→spec helper. Expected minimal move: extract `interaction.ts` (pure) into a package or into `diagram-spec`; leave React/DOM wiring consumer-side. Deferred to Gate 3, driven by what the Lab adapter actually imports.

## Maintenance and rollback
- Maintenance: two versioned artifacts, a schema change is a semver event, Lab pins a version. Cost is a publish step per Graphite change Lab wants.
- Rollback: remove the dependency and the one adapter file in `components/`; Lab's inline-SVG FBD keeps working because the integration is additive. Reverting this PR is a packaging-only revert.

## Risks
- Registry/scope not decided (blocks merge of any Lab PR, not development).
- `DiagramSpec` still has no stable published version policy.
- Node `.ts` import of a package that ships `.js` + `.d.ts` was verified only with Node 26 type stripping.
