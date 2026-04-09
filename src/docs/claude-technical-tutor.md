---
title: "Claude Technical Tutor — Harry Wellbelove"
description: "A Claude Code plugin that turns Claude into a guided discovery tutor with structured session note-taking."
summary: "Claude Code plugin that turns Claude into a guided discovery tutor. Points learners to vendor docs, guides them through building hands-on, and captures structured session notes — optimised for learning, not answers."
genre: Tool
order: 4
permalink: /claude-technical-tutor/
github_url: https://github.com/wblv-dev/claude-technical-tutor
---

## Overview

*A guided discovery tutor for Claude Code with structured session note-taking.*

Claude Technical Tutor is a Claude Code plugin that changes how Claude interacts with you during technical work. Instead of solving problems for you, it researches vendor documentation, points you to specific sources, and guides you through building hands-on — the way a good mentor would. It captures structured notes as you work, so the things you learn don't evaporate when the session ends.

<div class="callout">
<strong>Why this exists:</strong> Most AI coding tools optimise for speed — they give you the answer and move on. This plugin optimises for learning. It's built for lab work, exam prep, and anyone who wants to actually understand what they're building rather than just shipping it. The approach is guided discovery: you do the reading, the building, and the thinking. Claude guides you to the right sources and critiques your understanding.
</div>

## Design Philosophy

- **Claude never does work for you unless explicitly asked.** The default is guidance, not answers.
- **Vendor docs first.** Claude researches official documentation before each session and points you to specific sections — not blog summaries or pre-digested options.
- **You build, Claude guides.** Point to sources, prompt for your thinking, critique your understanding. No A/B/C option presenting.
- **Explicit opt-in for recording.** No notes are captured unless you start a session. Keeps Q&A clean and builds the habit of intentionally entering work mode.
- **Curation over capture.** Claude filters for signal in real-time. Failures and challenges are weighted highest — they're the most valuable learning material.
- **Works with any markdown note tool.** Obsidian, Logseq, OneNote, or just a folder. Output is plain `.md` files.

## Installation

### As a Plugin

```
claude plugin install claude-technical-tutor@wblv-dev
```

### Manual

Clone the repo and copy into your Claude Code config directories:

```
git clone https://github.com/wblv-dev/claude-technical-tutor.git

cp -r claude-technical-tutor/skills/* ~/.claude/skills/
cp -r claude-technical-tutor/commands/* ~/.claude/commands/
cp -r claude-technical-tutor/rules/* ~/.claude/rules/
```

Then merge the CLAUDE.md contents into your own `~/.claude/CLAUDE.md` and add the hooks from `hooks/hooks.json` to your `~/.claude/settings.json`.

## Configuration

Set your notes directory in `~/.claude/settings.json`:

```json
{
  "env": {
    "TUTOR_NOTES_DIR": "/path/to/your/notes"
  }
}
```

Defaults to `~/tutor-notes/` if not set.

## Teaching Mode

When teaching mode is active (always on by default), Claude:

- **Researches vendor docs first** and has specific references ready before the session
- **Points you to specific sources** — "go read section X of this doc" rather than explaining it directly
- **Prompts for your thinking** — "how do you think this process goes?" then critiques your understanding
- **Guides framework mapping** — asks what controls apply rather than listing them for you
- **Is available during the build** — you talk through it, Claude asks why/who/what and fills gaps
- Identifies the specific assumption that broke when you're wrong
- Flags security issues in anything you build

Disable for a single turn with "just tell me" or "skip the teaching".

## Session Note-Taking

The build-log system captures structured notes using a **Task / Reason / Challenge** rubric:

- **Task** — what did we do?
- **Reason** — why did we do it?
- **Challenge** — what broke, and how did we fix it?

Every entry gets a signal level (`high` / `medium` / `low`) that drives synthesis priority. High-signal challenges — broken assumptions, debugging breakthroughs — surface first.

## Commands

<div class="card mb-md">
<table class="spec-table">
<tr><td>/project-start [topic]</td><td>Start a recording session with an optional topic</td></tr>
<tr><td>/note [hint]</td><td>Manually capture a T/R/C entry for the current moment</td></tr>
<tr><td>/recover</td><td>Retroactively generate notes from the session transcript</td></tr>
<tr><td>/project-end</td><td>Synthesize all entries into a final note and clean up</td></tr>
</table>
</div>

## Workflow

```
/project-start Kubernetes networking lab
  ... work normally, Claude captures notes silently ...
  /note            (manual capture if Claude misses something)
/project-end       (synthesize, confirm filename, done)
```

If you forget `/project-start`:

```
... work normally, no notes captured ...
/recover           (mines session transcript retroactively)
/project-end       (synthesize as normal)
```

## Components

The plugin uses multiple Claude Code extension points working together:

<div class="card mb-md">
<table class="spec-table">
<tr><td>CLAUDE.md</td><td>Guided discovery teaching persona and core principles</td></tr>
<tr><td>Skill</td><td>Build-log capture logic, T/R/C rubric, signal levels, synthesis</td></tr>
<tr><td>Commands</td><td>Session lifecycle: start, note, recover, end</td></tr>
<tr><td>Hook</td><td>Warns on exit if a session wasn't wrapped</td></tr>
<tr><td>Rule</td><td>Format enforcement on note files</td></tr>
</table>
</div>

## What Gets Captured

Claude watches for noteworthy moments and filters out noise:

**Captured:** new concepts, decisions with tradeoffs, debugging breakthroughs, broken assumptions, reusable patterns, gotchas that cost time.

**Filtered:** routine tool calls, typo fixes, dead-ends that taught nothing, things obvious from code or commit history.

## Security

- Notes never contain secrets, API keys, tokens, or credentials
- Claude logs the shape of fixes ("rotated API key, updated env var"), not values
- Security issues in your work are flagged proactively — hardcoded credentials, disabled TLS verification, injection vectors
