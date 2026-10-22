# UI system

Goal: a calm, evidence-first interface that does not read as template output.

- One accent (`brand` green) for primary success actions, `ink` for default actions, `coral` only in the wordmark. Status uses text plus colour (badges always carry a label).
- Radius 6px (8px cards), no shadows, no gradients, no blur. System font stack.
- Shell: `components/AppShell.tsx` (skip link, labelled nav with `aria-current`, 44px targets). Auth screens: `components/AuthCard.tsx`.
- Screens: landing, sign up / in, authenticator setup / challenge, `/workspace` (interview then profile review), `/research` (history, run, progress, cards), `/opportunity/[id]` (evidence beside claims, fit breakdown, critique, decision + note), `/saved`.
- Layout: single column on phones, two columns from `lg` on the detail page; no fixed widths; long URLs use `break-all`.
- Progress: `RunProgress` reads the persisted stage, so reload shows last saved state.

Verification status: type-checked, linted and built; page routes return 200. Not yet checked in a real browser at 320/768/1024/1440 widths or with a screen reader; do that before claiming responsive QA.
