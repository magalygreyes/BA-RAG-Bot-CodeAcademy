# BA Agent — a RAG-powered Business Analyst 🧭

A retrieval-augmented chatbot that guides a user through a real **Senior BA project lifecycle** — from discovery and scoping all the way to handoff — and produces professional BA documentation grounded in methodology.

Built as a capstone for the **Codecademy Agentic AI Applications Bootcamp**.
`#CodecademyAgenticAIBootcamp`

---

## What it does

The agent is organised as a guided **task tracker** that walks a project through six phases:

1. **Discover & Listen** — uncover the real business problem, not just the feature request
2. **Scope & boundaries** — what's in, what's out
3. **Plan the documentation** — recommends the right documents for the project
4. **Shape the user stories** — INVEST stories with Given/When/Then acceptance criteria
5. **Prioritise** — MoSCoW, checked for feasibility and value
6. **Transition & support** — a clean handoff to dev and QA

Plus two dedicated tools:

- **Documents** — generate a BRD, FRD, gap analysis, risk register, RACI, business case, and more
- **Stories → CSV** — turn a feature into user-story cards and export an Azure DevOps / ServiceNow–ready CSV

Every answer shows the **sources it retrieved**, so the retrieval is visible, not hidden.

---

## How the RAG works

1. **Knowledge base** — a senior-BA project lifecycle plus BABOK v3, SAFe 6.0 and deliverable definitions, written as small, source-tagged chunks (all original content).
2. **Retrieval** — each question is scored against every chunk; only the most relevant few are pulled in as context.
3. **Grounded generation** — the model answers using the retrieved chunks as its primary source.
4. **Transparent sourcing** — each reply lists exactly which chunks it used.

The retrieval here is lightweight lexical (TF-IDF) scoring — dependency-free and fully in the browser. The natural upgrade path is semantic retrieval with embeddings and a vector store.

---

## Architecture

```
Browser (index.html)
   │  POST /api/chat  { system, messages }
   ▼
Netlify Function (netlify/functions/chat.js)   ← API key lives here, in Netlify secrets
   │  calls the Anthropic API
   ▼
Claude → grounded answer → back to the browser
```

The API key is **never** in the front-end code or the repo. It is stored only as a Netlify environment variable and used server-side by the function.

---

## Tech stack

- Front end: vanilla HTML / CSS / JavaScript (no build step)
- Retrieval: in-browser TF-IDF over a curated knowledge base
- Model: Anthropic Claude, via a Netlify serverless function
- Hosting: Netlify

---

## Deploy

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project** → pick the repo.
   - Build command: *(none)*  ·  Publish directory: `.`
3. In **Site configuration → Environment variables**, add `ANTHROPIC_API_KEY` (mark as **sensitive**).
4. Deploy. The bot calls `/api/chat`, which Netlify routes to the function.

> Set a monthly spend limit on your Anthropic account — a public demo endpoint should never be uncapped.

---

## Project structure

```
index.html                  the full app (UI + retrieval + chat)
netlify/functions/chat.js   secure proxy to the Anthropic API
netlify.toml                routing + security headers
.gitignore
README.md
```
