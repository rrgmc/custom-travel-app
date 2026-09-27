---
name: update-base
description: Bring app improvements from the custom-travel-app template into this trip repo without touching the trip data.
disable-model-invocation: true
---

# Update from the template

Trip repos are created with "Use this template", so they share no git history with the template.
Update by copying files, not by merging.

1. Make sure the working tree is clean (`git status`). If it isn't, stop and ask.
2. Add the remote if missing: `git remote add template https://github.com/rrgmc/custom-travel-app.git`
   (private template: the user's git credentials must have access). Then `git fetch template main`.
3. Show `git diff --stat HEAD template/main -- . ':!trip/trip.yaml' ':!trip/files'` and summarize
   what would change.
4. After the user agrees, take everything except the trip data:
   `git checkout template/main -- . ':!trip/trip.yaml' ':!trip/files'`
   (this does update `trip/trip.schema.json`).
5. If the schema changed, migrate `trip/trip.yaml` (renamed or newly required fields).
   If package.json changed, run `npm install`.
6. Run `npm run build` and `npm run trip:apply` (the template's android/ carries the sample identity).
   Fix anything that broke, then commit as "Update from template".
