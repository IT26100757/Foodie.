# New GitHub repository and IntelliJ workflow

No GitHub repository, local project Git history, commits, branches or pushes were created by this delivery. The names below are the requested future branch plan, not existing remote branches. Each member must use their own GitHub identity and make commits only for work they genuinely perform. An initial baseline import is not proof that the importer authored all original UI/backend code. Preserve provenance/credits; do not fabricate historical commits, authors or dates.

## A. Owner: create an empty repository

1. Sign in to your own GitHub account. Choose New repository, set a name such as Foodie, select owner/visibility and add a description. Keep it private unless your team/course permits public publication.
2. Leave Add README, .gitignore and license initialization unchecked: this delivery already supplies README/.gitignore. Choose a license only after deciding the rights to the original sources. Do not import an old backend/repository or use an automatic code-generation option.
3. Create the empty repository yourself and copy its HTTPS or SSH clone URL. Never put a token/password into a committed URL.
4. Invite the five other real teammates through repository access settings; give only the access they need. No invitations are sent by this delivery.

GitHub recommends leaving optional initial files unselected when importing existing code: [Create a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository).

## B. Clone in IntelliJ and import this baseline

1. In IntelliJ welcome screen choose Get from VCS / Clone Repository (or File → New → Project from Version Control; wording varies by version).
2. Paste the new repository URL; choose a NEW empty local directory. Authenticate yourself through IntelliJ/GitHub. Clone it.
3. Extract the complete delivery ZIP elsewhere. Copy the CONTENTS of its Foodie folder into the cloned directory: backend/, frontend/, docs/, README.md and the hidden root .gitignore. Do not create Foodie/Foodie nesting or copy/replace the clone's .git folder. Enable hidden files in Explorer so .gitignore is copied.
4. Open the cloned root; link backend/pom.xml, choose JDK17 and follow INTELLIJ_SETUP.md. Keep Aiven/Cloudinary/SMTP variables in private IDE/environment settings. Do not connect/write live data until separately approved.
5. Open the Commit tool window and inspect every file. Source, pom.xml, package.json/locks, Vite configs and docs belong in the commit. node_modules, target, build, dist, JARs, ZIPs, private environment/truststore/IDE files and logs must be ignored. .gitignore does not remove files already tracked; inspect the staged list before your FIRST commit.
6. Make a truthful initial commit, for example “Import verified Foodie baseline with original UIs and new backend”. Use your own configured name/email. It records the import, not fabricated authorship for six members.
7. Ensure the branch is main. If your empty clone initially uses another name, rename it to main through the branch widget after the first commit, or run git branch -M main yourself in IntelliJ Terminal.
8. Use Git → Push / the Push action to push main to origin and set upstream. Review the outgoing files. No pushes have been performed for you.

Official IDE instructions: [Clone/set up Git](https://www.jetbrains.com/help/idea/set-up-a-git-repository.html), [Commit and push](https://www.jetbrains.com/help/idea/commit-and-push-changes.html).

## C. Create the requested branches

Branch roles:

| Branch | Purpose |
|---|---|
| main | Stable tested release baseline; live-cloud verification limits still documented |
| develop | Six-member integration |
| feature/user-management | Account/auth/approval/profile/documents/favourites/notifications work |
| feature/restaurant-menu-management | Restaurant/menu ownership, images and catalogue |
| feature/order-management | Quotes/checkout/orders/guest access/charge consent |
| feature/payment-management | Pending/collected payments, encrypted banks, wallet/payout/refund safeguards |
| feature/delivery-management | Driver onboarding/vehicle/availability/assignment/tracking/earnings |
| feature/review-management | Completed-order reviews, rating/ownership rules and related UI |

1. Checkout main, ensure it is clean and up to date.
2. In the branch widget choose New Branch → develop, checkout it, then Push to origin/develop. No extra placeholder commit is needed: a branch may point to the baseline commit.
3. From develop create and push each of the six feature branches. Return to develop before each creation so every feature starts from the same integration base. Alternatively each assigned member can create/push their branch from origin/develop after cloning.

Equivalent optional commands for YOU to run after the initial commit/push (not executed by this delivery):

```text
git switch main
git switch -c develop
git push -u origin develop
git switch -c feature/user-management develop
git push -u origin feature/user-management
git switch -c feature/restaurant-menu-management develop
git push -u origin feature/restaurant-menu-management
git switch -c feature/order-management develop
git push -u origin feature/order-management
git switch -c feature/payment-management develop
git push -u origin feature/payment-management
git switch -c feature/delivery-management develop
git push -u origin feature/delivery-management
git switch -c feature/review-management develop
git push -u origin feature/review-management
git switch develop
```

Branches contain the WHOLE repository, not just one module. Do not create six disconnected repositories or move source files to a branch-named directory. [IntelliJ branch management](https://www.jetbrains.com/help/idea/manage-branches.html).

## D. Fresh clone build/run

Generated files are present in the delivery ZIP for convenience but ignored by Git. After cloning from GitHub, each member must run npm ci then npm run build -- --configLoader native in EACH of the four frontend folders BEFORE mvn clean verify or running the one-server application. The asset-serving tests intentionally verify actual built portal assets. Then run the backend from IntelliJ with private Aiven/Cloudinary/email settings after approved schema preparation. No local MySQL is needed. See INTELLIJ_SETUP.md.

## E. Genuine member contributions and pull requests

1. Each member clones the SAME repository with their own account. Fetch, checkout their assigned feature branch (create a local tracking branch from origin if it already exists), and merge the latest origin/develop into it before working.
2. Read TEAM_MODULES.md and their module ZIP README/manifest. The complete baseline already contains their files. A module ZIP is a reference/handoff pack, not a request to copy identical files and invent a commit. If a real missing/new file is needed, compare it first and copy only the relevant module-files path into its matching repository path. Never wholesale overwrite shared-context files.
3. Make a small genuine change: fix a real issue, improve validation/tests, implement an agreed requirement or document an actual module finding. Inspect the diff. Select only those changed files in IntelliJ Commit. Use a truthful message describing the actual change. Do not make empty, backdated or other-author commits to create an artificial history.
4. Run relevant tests/builds. Before a cross-portal merge run all four frontend builds, mvn clean verify and Customer contract tests. Report exactly which checks were run; no real Aiven/cloud writes/tests without owner permission.
5. Fetch again. With YOUR feature branch checked out, merge origin/develop into it. Resolve each conflict in IntelliJ's three-way merge editor by preserving both modules' valid changes. Ask the shared-file coordinator when uncertain; do not blindly select Accept Yours/Theirs. Rebuild/test after resolution. Avoid force-pushing a shared branch.
6. Push your genuine feature commits. Create a GitHub Pull Request with BASE develop and COMPARE your feature branch. Describe the problem, change, tests and touched shared files. Request review from the module owner/coordinator. [Create a PR](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request).
7. Review/merge feature PRs one at a time into develop. After all agreed work is tested, the coordinator opens develop → main PR for a release. Do not routinely push feature work directly to main. Branch protection/review requirements can be enabled by the owner if supported by the repository settings/plan.

No guide can guarantee zero merge conflicts. Small changes, current branches and coordinated shared-file edits reduce them. Existing monolithic React App files make coordination especially important; do not split/redesign them just to manufacture module ownership.

## F. Secret safety before every commit

Root .gitignore excludes secrets, dependencies, IDE settings and generated outputs. Commit .gitignore itself. Check git status / staged diff before committing. If an actual secret was already committed, merely ignoring it does not remove its history: stop publishing, rotate the credential through its owner and arrange a reviewed cleanup. Never put real Aiven/Cloudinary/SMTP secrets into example files, screenshots or PR descriptions. [GitHub ignoring files](https://docs.github.com/en/get-started/git-basics/ignoring-files).
