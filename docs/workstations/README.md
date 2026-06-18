# BrewLoop Workstations

BrewLoop uses a lightweight Cowork-style workstation system.

The goal is to route planning and implementation work to the smallest relevant context bundle instead of loading every document for every task.

## How to use

1. Start with `docs/DECISIONS.md`.
2. Use the Cowork Routing Map to select the relevant workstation.
3. Load that workstation's `CLAUDE.md`.
4. Load the listed resource docs.
5. Check the workstation `MEMORY.md` for local notes.
6. Update durable decisions in `docs/DECISIONS.md` or ADRs.

## Workstations

| Workstation | Use for |
|---|---|
| `product-strategy` | Roadmap, scope, North Star, version placement |
| `architecture` | Multi-tenant design, database, RLS, auth, Supabase |
| `menu-system` | Menu setup, imports, item options, future modifiers |
| `product-experience` | Customer/staff/owner flows and acceptance criteria |
| `production-readiness` | Testing, deployment, secrets, observability, launch readiness |
| `business-model` | SaaS vs client-owned infrastructure, pricing packages, support boundaries |
| `documentation-ops` | Decision log, ADRs, doc cleanup, handoff material |

## File pattern

Each workstation should have:

- `CLAUDE.md`: how the module should behave
- `MEMORY.md`: relevant state, notes, and open questions
- Optional resources folder later if the module needs examples, templates, or checklists

## Rule

If the project gains a new durable domain, add a new workstation and update the routing map in `docs/DECISIONS.md`.
