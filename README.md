# Whatsapp_Marketing

Whatsapp_Marketing is a TypeScript Node.js application that automates sending marketing posts and status updates via WhatsApp groups using whatsapp-web.js. It supports scheduling posts, uploading media to Supabase storage, and persisting posts and WhatsApp group metadata in MongoDB.

**Highlights**
- Schedule image posts to groups and broadcast WhatsApp status updates.
- Uploads media to Supabase and stores public URLs in MongoDB.
- Uses `whatsapp-web.js` for WhatsApp integration and `node-cron` for scheduling.

**Tech stack**: Node.js, TypeScript, Express, MongoDB (Mongoose), Supabase, whatsapp-web.js, node-cron

**Quick Links**
- Source: https://github.com/hxscyprodz/Whatsapp_Marketing

**Contents**
- Overview
- Requirements
- Setup
- Environment variables
- Usage
- API
- Architecture & key files
- Contributing
- License

## Overview

This app connects a WhatsApp client (via `whatsapp-web.js`) to your MongoDB database and Supabase storage. It discovers WhatsApp groups, saves group metadata, and periodically runs scheduled tasks:

- Send scheduled posts (images + captions) to a subset of discovered groups.
- Post image status updates when a post is marked as a `story` at the configured time.

Cron scheduling, retry settings, and other runtime options are configurable via environment variables.

## Requirements

- Node.js (recommend v18+)
- npm
- MongoDB instance
- Supabase project with a storage bucket
- WhatsApp account (to scan the client QR code)

## Setup

1. Clone the repository and install dependencies:

	`git clone https://github.com/hxscyprodz/Whatsapp_Marketing.git`
	`cd Whatsapp_Marketing`
	`npm install`

2. Create a `.env` file at the project root with the required environment variables (see next section).

3. Start in development mode (auto-reloads using `nodemon`):

	`npm run dev`

4. On first run the WhatsApp client will emit a QR code in the terminal; scan it with your phone to authenticate the session.

## Environment variables

The app requires the following environment variables (defined in `src/config/env.config.ts`):

- `PORT` — port the server listens on (default: `5000`)
- `APP_ENV` — app environment (default: `development`)
- `MONGODB_URI` — MongoDB connection string
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_KEY` — Supabase service/public key
- `SUPABASE_BUCKET` — Supabase storage bucket name used for uploads
- `OWNER_ID` — (app-specific) owner identifier used internally
- `RETRY_LIMIT` — retry attempts for transient operations (default: `5`)
- `RETRY_INTERVAL` — milliseconds between retries (default: `2000`)
- `CRON_SCHEDULE_INTERVAL` — cron expression for scheduled job runner (default: `0,05 * * * *`)

Example `.env` snippet:

```
PORT=5000
APP_ENV=development
MONGODB_URI=mongodb://localhost:27017/whatsapp_marketing
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
SUPABASE_BUCKET=your-bucket-name
OWNER_ID=your_owner_id
RETRY_LIMIT=5
RETRY_INTERVAL=2000
CRON_SCHEDULE_INTERVAL=0,05 * * * *
```

## Usage

- Start server (dev): `npm run dev`
- Build: `npm run build`
- Start built app: `npm start`

Health check endpoint: `GET /health`

API endpoints (posts):

- `GET /api/v1/posts` — list posts
- `POST /api/v1/posts` — create a post (multipart form; field name `image` for image file and `caption`, `postTime` in body)
- `GET /api/v1/posts/:id` — fetch single post
- `PATCH /api/v1/posts/:id` — update a post (stub)
- `DELETE /api/v1/posts/:id` — delete a post (deletes Supabase image if present)

See route definitions: [src/routes/posts.routes.ts](src/routes/posts.routes.ts)

## Data models

- `Post` (`src/models/post.model.ts`) — fields: `caption`, `imageUrl`, `scheduledTime`, `postType` (enum), `posted` (boolean)
- `Group` (`src/models/group.model.ts`) — fields: `whatsappGroupId`, `name`

## Architecture & key files

- Entry point: [src/index.ts](src/index.ts) → calls [src/server.ts](src/server.ts)
- Environment & DB config: [src/config/env.config.ts](src/config/env.config.ts), [src/config/db.config.ts](src/config/db.config.ts)
- WhatsApp integration: client defined in [src/libs/whatsaapweb.lib.ts](src/libs/whatsaapweb.lib.ts) and wired in [src/services/whatsapp.ts](src/services/whatsapp.ts)
- Scheduling: [src/services/cron.ts](src/services/cron.ts) calls scheduled tasks in [src/services/whatsapp/schedulePost.ts](src/services/whatsapp/schedulePost.ts)
- Media uploads: [src/services/supabase.service.ts](src/services/supabase.service.ts)
- API controllers: [src/controllers/posts.controller.ts](src/controllers/posts.controller.ts)
- Utilities: WhatsApp helpers in [src/utils/whatsapp/index.ts](src/utils/whatsapp/index.ts)

## How scheduling works

- `runCronJobs` in [src/services/cron.ts](src/services/cron.ts) sets up a cron job using `CRON_SCHEDULE_INTERVAL`.
- Each tick calls `scheduledStatusUpdate()` and `schedulePostToGroups()` from [src/services/whatsapp/schedulePost.ts](src/services/whatsapp/schedulePost.ts).
- `schedulePostToGroups()` picks the next unsent post and sends it to a shuffled subset of groups, then marks it as `posted`.

## WhatsApp client notes

- On startup the app initializes the WhatsApp client and prints a QR code to the terminal. Scan it once to pair your account.
- Incoming messages are handled by [src/services/whatsapp/incomingMessagesHandler.ts](src/services/whatsapp/incomingMessagesHandler.ts).

## Development notes

- Linting/tests: none included by default. Keep TypeScript types up-to-date.
- The project uses `nodemon` + `ts-node` for dev hot-reload (`npm run dev`).

## Contributing

Feel free to open issues or pull requests on the repository. For significant changes, open an issue first to discuss the approach.

## License

This project uses the ISC license (see `LICENSE`).

---

If you'd like, I can also add an example `.env.example` file, API request examples (curl / Postman), or expand the Developer section with testing and debugging tips.
