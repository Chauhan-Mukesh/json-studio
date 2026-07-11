# Deploying JSON Studio to GitHub Pages

**Live site:** https://chauhan-mukesh.github.io/json-studio/

> This file covers first-time GitHub Pages setup and the workflow anatomy.
> For the full release / tagging / rollback playbook (with copy-paste commands
> for both bash and Windows CMD), see [`../DEPLOY.txt`](../DEPLOY.txt) at the
> repo root.

## One-time setup (2 minutes)

1. **Create the repo** on GitHub. Make it Public — GitHub Pages on a Free
   plan requires public repos. On Team/Enterprise it can be Private.

2. **Push this project as the repo root.** From the `json-studio/` folder:

   ```bash
   git init
   git branch -m main
   git add .
   git commit -m "chore: initial commit of JSON Studio"
   git remote add origin https://github.com/<your-user>/<repo-name>.git
   git push -u origin main
   ```

3. **Enable GitHub Pages via Actions.** In the repo:

   > Settings → Pages → Build and deployment → Source: **GitHub Actions**

   No branch, no folder — the workflow already knows what to publish.

That's the whole setup. The next push to `main` will:

- run the Playwright suite,
- build a static `./site/` folder from `json-studio.html`,
- publish it to `https://<user>.github.io/<repo>/`.

## What the workflow does

`.github/workflows/ci-and-pages.yml` has three jobs:

| Job     | When                     | What                                                      |
|---------|--------------------------|-----------------------------------------------------------|
| `test`  | every push, every PR     | `npm ci`, cached Playwright chromium, run the full spec suite. |
| `build` | push to `main` only      | Assemble `./site/` (index.html + json-studio.html + BUILD_INFO). |
| `deploy`| push to `main` only, after `build` | Publish `./site/` via `actions/deploy-pages@v4`. |

Pull requests run only the `test` job — they never publish. That's on purpose:
a Pages deploy is world-visible and shouldn't be triggerable by a fork's PR.

**What a healthy PR check panel looks like** (this is the expected state, not a bug):

```
✓  CI + GitHub Pages / Test (Playwright)      Successful   [Required]
✓  GitGuardian Security Checks                No secrets detected
⊘  CI + GitHub Pages / Build Pages site       Skipped
⊘  CI + GitHub Pages / Deploy to GitHub Pages Skipped
```

The two "Skipped" entries are the safety guard in action — `build` and `deploy`
are gated to `push` events on `main`, so PRs correctly can't publish. Merging
the PR runs all three jobs on the resulting main-branch push.

## Safety features already wired

- **Least-privilege permissions.** Workflow-level default is read-only.
  Only the `deploy` job gets `pages: write` + `id-token: write`, nothing else.
- **Pinned action majors.** `@v4` on every action — a bad patch release
  can't silently ship into your deploys.
- **Concurrency guard.** Two rapid `main` pushes queue rather than race.
- **Environment.** Publishes to the `github-pages` environment, so if you
  later add required reviewers or a wait timer in Settings → Environments,
  this workflow picks them up automatically.
- **Failure artifacts.** Playwright HTML report is uploaded for 14 days on
  every run; failure traces for 7 days when a test breaks.

## Rollback

Two options:

- **Redeploy an older commit:** Actions tab → pick the old green run →
  "Re-run all jobs".
- **Delete the Pages deployment:** Settings → Pages → "Unpublish site" (kept
  as an escape hatch for accidental content).

## Custom domain (optional)

If you have one:

1. Add a `CNAME` file to the repo root containing just your domain,
   e.g. `json.example.com`.
2. Edit the build step in `ci-and-pages.yml` to copy it:
   `cp CNAME site/CNAME`.
3. In DNS, `CNAME` your subdomain to `<user>.github.io`.
4. Settings → Pages → Custom domain → enter the domain → wait for the
   HTTPS certificate to provision (Let's Encrypt via GitHub, ~10 min).

## Troubleshooting

- **"HttpError: Not Found" on first deploy** — you skipped step 3 of one-time
  setup. Toggle Pages source to GitHub Actions and re-run the workflow.
- **`npm ci` fails on CI but works locally** — your `package-lock.json` is
  out of date; run `npm install` locally and commit the updated lock.
- **Playwright download slow on cold cache** — the first run downloads
  ~170 MB of Chromium. It's cached after that; subsequent runs are ~30 s.
- **PR shows "2 skipped, 2 successful checks"** — this is the intended state,
  not a failure. See the check panel example above. Build/Deploy only run on
  push-to-main.
- **`git push` rejected as "non-fast-forward" on first push** — the GitHub
  wizard added a README/gitignore/license commit that isn't on your local
  main. Fix: `git pull --rebase origin main` then push again.
- **Windows CMD: `'\' is outside repository` when pasting bash commands** —
  CMD doesn't accept `\` for line continuation. Join to one line, or use `^`
  at end of each line. See `../DEPLOY.txt` "SHELL NOTE" for details.

For releases, tags, hotfixes, and rollback, see [`../DEPLOY.txt`](../DEPLOY.txt).
