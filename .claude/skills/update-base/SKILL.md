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
   (private template: the user's git credentials must have access). Then
   `git fetch template && git remote set-head template --auto`, so `template/HEAD` points at the
   template's default branch whatever it is called (`main` or `master`).
3. Show `git diff --stat HEAD template/HEAD -- . ':!trip/trip.yaml' ':!trip/files'` and summarize
   what would change. Point out that files this trip repo changed itself (`CLAUDE.md`, skills,
   docs, `src/`) will be replaced by the template's version; if the diff shows trip-specific
   changes there, list them so the user can decide what to re-apply afterwards.
4. After the user agrees, take everything except the trip data:
   `git checkout template/HEAD -- . ':!trip/trip.yaml' ':!trip/files'`
   (this does update `trip/trip.schema.json`).
5. **Files the template removed** are not deleted by the checkout, and stale code can break the
   build. List them with `git diff --name-only --diff-filter=D HEAD template/HEAD -- . ':!trip'`
   (files here that the template doesn't have: either removed there or added by this repo). Delete
   the ones the template removed (`git rm`); keep ones this repo added on purpose, and ask if unsure.
6. If the schema changed, migrate `trip/trip.yaml` to it: renamed fields, new required fields, or a
   new structure (read `docs/data-model.md` and the template's sample trip). **Never drop the user's
   data silently**: anything with no place in the new model (a field or section that no longer
   exists) is listed for the user, who decides where it goes (e.g. into `notes` or `tips`) or
   whether to drop it. If package.json changed, run `npm install`.
7. Run `npm run build` and `npm run trip:apply` (the template's android/ carries the sample identity).
   Fix anything that broke, then commit as "Update from template".
