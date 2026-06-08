# CommitQuest

**Turn your Git workflow into an RPG adventure.**

CommitQuest is an open source developer experience project that rewards real coding activity with XP, gold, achievements, streaks, character progression, and social competition. Every push, commit, and milestone can become part of your character's story.

We are building a playful layer on top of GitHub for developers who like terminals, games, open source, and a little bit of chaos.

## What We Are Building

CommitQuest spans a few connected projects:

| Project | What it does |
| --- | --- |
| **CLI** | Installable command line tool for login, stats, dashboard, character management, and local dev workflows. |
| **Web Platform** | Browser dashboard for characters, inventory, friends, leaderboards, downloads, and account management. |
| **Backend API** | Express/Supabase service powering auth, GitHub events, stats, achievements, friends, shop data, and assets. |
| **VS Code Extension** | Editor sidebar experience for showing your avatar, progress, and commit celebrations while you work. |

## Why It Exists

Open source work can be lonely, invisible, and hard to stay motivated around. CommitQuest makes progress visible and fun:

- Earn XP from GitHub activity.
- Build streaks and unlock achievements.
- Customize your developer RPG character.
- Compete with friends on leaderboards.
- Bring your character into your editor and terminal.

The long-term goal is a cross-platform game layer for developers, where contribution history becomes progression.

## Open Source Contributors Wanted

CommitQuest is early and there is plenty to build. If you want to contribute, we would love help with:

- Frontend polish and responsive UI work.
- CLI features and release packaging.
- VS Code extension improvements.
- Backend API endpoints and Supabase schema work.
- Achievement ideas and balancing.
- Character classes, species, items, and game design.
- Docs, onboarding, examples, and issue triage.

Good contributions do not need to be huge. A bug fix, a new achievement idea, a small UI improvement, or better setup docs are all valuable.

## Tech Stack

- **Frontend:** React, TypeScript, Chakra UI
- **Backend:** Node.js, Express, Supabase/Postgres
- **CLI:** Node.js
- **Editor:** VS Code extension APIs
- **Integrations:** GitHub OAuth, GitHub APIs, webhooks

## Getting Started

Install the CLI from the latest release tarball:

```bash
npm install -g https://github.com/CommitQuest/cli/releases/download/v0.1.2/commitquest-0.1.2.tgz
```

Then log in:

```bash
commitquest login
commitquest dashboard
```

You can also explore the web platform and VS Code extension from the project repositories.

## Contribution Philosophy

We care about:

- **Playful developer experience:** useful tools can still feel magical.
- **Small, reviewable changes:** ship improvements one clear step at a time.
- **Beginner-friendly open source:** issues should be approachable and explanations should be kind.
- **Real progress over grind:** CommitQuest should celebrate meaningful work, not encourage spam.
- **Open collaboration:** game ideas, balancing, UX, docs, and code all matter.

## Community

- Join the Discord: https://discord.gg/XuKJJBAuKH
- Explore the GitHub organization: https://github.com/CommitQuest
- Try the CLI release: https://github.com/CommitQuest/cli/releases

## A Few Ideas To Build Next

- More achievements for different development styles.
- Better onboarding for first-time contributors.
- Public character profile pages.
- Friend challenges and guilds.
- More editor integrations.
- Standalone installers so users do not need npm.
- Seasonal events and limited-time loot.

## Join The Quest

If you like developer tools, RPGs, GitHub, terminals, pixel UI, or open source community building, CommitQuest is a great place to jump in.

Pick an issue, suggest an idea, improve the docs, or just say hello in Discord.

May your diffs be clean and your merges conflict-free.
