# 52A planner preview — 2026-09-16

Private implementation preview; do not advertise account save/share as ready.

Implemented: 18 furniture types; SVG placement; dimension, rotation, colors, notes, links; lock, duplicate, delete; 50-step undo/redo; grid; 1cm controls; wall alignment; ruler; overlap hints; Three.js 3D; local drafts; JSON import/export; PNG; Korean PDF.

Backend in project gledekahwxiofzpfybdg: c14_plans, c14_plan_shares; c14_save_plan optimistic revision RPC; share snapshot/revoke RPC; owner-only table access. Validation trigger in migrations/20260916_planner_validation.sql applied. Original schema SQL is retained in the dashboard query from 2026-09-16.

Verified by root: model check (`node ../checks/planner-model-check.mjs`); browser dimension/rotate/duplicate/undo; local draft reload; 3D render; 2-page Korean PDF and text extraction; 320/390/768/1440 no horizontal document overflow. Database transaction with two disposable user IDs verified private read isolation, revision increment/conflict, share read and revocation; entire test rolled back.

Pending before full release: SMTP and OTP email delivery, real two-device account round-trip and share UI, physical iOS/Android touch verification, detailed CAD wall/opening overlay. Geometry remains explicitly a visualization draft. Public preview has account entry paused until SMTP is configured. Do not add homepage menu until these release gates are met.
