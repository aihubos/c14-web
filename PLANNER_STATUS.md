# 52A / 84A / 84B planner — 2026-09-16

Homepage-linked visualization preview; do not advertise account save/share as ready.

Added: 84A/84B CAD wall and window traces, approximate room/fixture zones, original CAD door arcs; independent floor-version drafts; on-canvas width/depth and rotation controls in 2D and 3D. Floor switching preserves local drafts. 84 geometry is a visualization draft, not construction dimensions.

Implemented: 18 furniture types; SVG placement; dimension, rotation, colors, notes, links; lock, duplicate, delete; 50-step undo/redo; grid; 1cm controls; wall alignment; ruler; overlap hints; Three.js 3D; local drafts; JSON import/export; PNG; Korean PDF.

Backend in project gledekahwxiofzpfybdg: c14_plans, c14_plan_shares; c14_save_plan optimistic revision RPC; share snapshot/revoke RPC; owner-only table access. Validation trigger in migrations/20260916_planner_validation.sql applied. Original schema SQL is retained in the dashboard query from 2026-09-16.

Verified by root: model check (`node ../checks/planner-model-check.mjs`); browser dimension/rotate/duplicate/undo; local draft reload; 3D render; 2-page Korean PDF and text extraction; 320/390/768/1440 no horizontal document overflow. Database transaction with two disposable user IDs verified private read isolation, revision increment/conflict, share read and revocation; entire test rolled back.

Pending before full release: SMTP and OTP email delivery, real two-device account round-trip and share UI, physical iOS/Android touch verification, detailed CAD wall/opening overlay. Geometry remains explicitly a visualization draft. Public preview has account entry paused until SMTP is configured. User explicitly requested homepage menu exposure on this turn; menu label is 우리 집 가구 배치. Account save/share remains visibly paused.

Backend floor-version allowlist expanded by migrations/20260916_planner_floor_types.sql in the active project. SQL editor returned Success. No rows returned. End-user cloud save remains gated by email delivery.

Root verified this update: 84B survives reload; 2D/3D inline width/depth/rotation values update, 3D remains active; direct 3D sofa picking and undo; no horizontal overflow at 320/390/768/1440.
