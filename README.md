# Selfreview demo

A tiny link-shortener API, used to show [Selfreview](https://github.com/hackertron/selfreview) reviewing pull requests in public.

Open a pull request here and the Selfreview bot reviews it. PRs from people outside the org aren't reviewed automatically; a maintainer comments `/selfreview` to start one.

## The app

| Method | Path | Auth | What it does |
|---|---|---|---|
| `POST` | `/links` | `x-api-key` | Create a short link: `{ "url": "https://…" }` → `{ "slug": "a1B2c3" }` |
| `GET` | `/:slug` | — | Redirect to the original URL |
| `GET` | `/links/:slug/stats` | `x-api-key` | How many times the link was opened |

```bash
bun install
API_KEY=dev-key bun run src/index.ts
bun test
```

The reviewer's settings for this repo are in [`.selfreview.yml`](.selfreview.yml).
