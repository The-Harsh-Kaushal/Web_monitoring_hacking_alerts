# Web Monitoring Hacking Alerts

Backend gateway service for authentication, rate limiting, traffic monitoring, and security analytics.

This project sits in front of application routes and uses Redis for fast stateful operations and MongoDB for persisted traffic summaries.

## Why This Project Exists

Most backend demos stop at login and CRUD. This project is built around a more operational backend problem:

- issue and rotate JWT-based sessions
- track request traffic in real time
- rate limit risky surfaces
- detect and log blocked traffic
- expose admin metrics for observability
- roll daily traffic summaries into MongoDB

It is not an npm package. It is a service meant to be run as an application.

## Stack

- Node.js
- Express
- Redis
- MongoDB with Mongoose
- JWT
- Lua scripts for atomic Redis operations

## Core Capabilities

### Authentication and Session Handling

- login and signup flow
- access token plus refresh token model
- refresh token rotation
- logout for a single session or all sessions
- refresh tokens stored in Redis as hashes, not raw values

### Security Controls

- auth route rate limiting
- protected route rate limiting
- blocked request logging
- temporary IP bans

### Monitoring

- endpoint traffic counting
- latency and error tracking
- EWMA-style live traffic signal in Redis
- unique IP estimation using HyperLogLog
- daily traffic aggregation persisted to MongoDB

### Admin Metrics

- aggregated traffic reports for a date range
- blocked request inspection
- live SSE feed for EWMA and unique IP counts

## High-Level Architecture

1. Requests enter the Express gateway.
2. Gateway middleware checks ban state, tracks latency/errors, and records traffic.
3. Auth and session flows use Redis-backed Lua scripts for atomic token operations.
4. Admin routes read live metrics from Redis.
5. A worker rolls prior-day Redis traffic data into MongoDB for historical reporting.

## Project Structure

```text
Web_monitoring_hacking_alerts/
├── index.js
├── package.json
├── config/
│   ├── config.js
│   └── routes.js
├── Routes/
│   ├── authentication.js
│   ├── session.js
│   └── admin.js
├── Middlewares/
│   ├── authentication/
│   ├── admin/
│   ├── Monitoring and Security/
│   └── Rate Limiting/
├── Redis/
│   ├── RedisClient.js
│   └── lua/
├── Modals/
│   ├── User.js
│   └── Traffic.js
└── worker/
    └── traffic_update.js
```

## Environment Variables

Create a `.env` file in the project root with:

```env
PORT=5000
MONGO_DB_URI=mongodb://localhost:27017/gateway
REDIS_URI=redis://localhost:6379

ACCESS_TOKEN_SECRET=replace_me
REFRESH_TOKEN_SECRET=replace_me

AT_TTL=1200
RT_TTL=604800

NODE_ENV=development
```

Notes:

- `AT_TTL` and `RT_TTL` are in seconds.
- secure refresh-token cookies are enabled automatically when `NODE_ENV=production`.

## Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Start Redis and MongoDB

Make sure both services are reachable using the URIs in your `.env`.

### 3. Start the server

```bash
npm start
```

The app starts the HTTP server and also starts the daily traffic migration worker.

## Main Routes

### Authentication

- `POST /api/auth/login`
- `POST /api/auth/signin`

### Session

- `GET /api/session/refresh`
- `POST /api/session/logout`
- `GET /api/session/hello`

### Admin

- `GET /api/metrics/traffic?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/metrics/report`
- `GET /api/metrics/blocked`
- `GET /api/metrics/EWMAIP`

Admin routes require a valid access token and an admin user.

## Data Flow

### Redis

Redis is used for:

- refresh token storage and rotation
- rate limiting buckets
- ban state
- blocked request logs
- latency and error counters
- endpoint traffic counters
- live EWMA and unique IP metrics

### MongoDB

MongoDB stores:

- users
- persisted daily traffic summaries

## What Makes This Project Interesting

- it goes beyond basic auth and CRUD
- it uses Lua scripts to keep sensitive Redis operations atomic
- it mixes real-time metrics with persisted reporting
- it treats backend observability and security as first-class concerns

## Current Gaps

The project is functional, but still has room for polish:

- test coverage is still missing
- naming consistency can be improved
- deployment docs can be expanded
- Mongo indexes should be managed explicitly in production

## Resume-Friendly Summary

Built a Node.js gateway service with Redis- and MongoDB-backed authentication, session rotation, rate limiting, traffic monitoring, blocked-request logging, and admin analytics using Lua scripts for atomic Redis operations.

## License

ISC
