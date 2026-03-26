# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Shortly** — a full-stack URL shortener with click analytics, Redis caching, and a glassmorphism dark-themed UI.

- **Frontend**: React 19, React Router v7, Axios, Chart.js, qrcode.react
- **Backend**: Java 21, Spring Boot 3.5, Spring Data JPA, Spring Data Redis
- **Database**: MySQL (`urlshortener` database)
- **Cache**: Redis (localhost:6379)

## Development Commands

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run       # Start backend on port 8080
./mvnw clean install         # Build
./mvnw test                  # Run tests
```

Backend requires MySQL and Redis running locally. Default credentials from `application.properties`:
- MySQL: `root` / `root123` at `localhost:3306/urlshortener`
- Redis: `localhost:6379`

Override via env vars: `DB_USERNAME`, `DB_PASSWORD`, `REDIS_HOST`, `REDIS_PORT`.

### Frontend (React)

```bash
cd frontend
npm install
cp .env.example .env         # Set REACT_APP_API_URL=http://localhost:8080/api
npm start                    # Dev server on port 3000
npm run build                # Production build
npm test                     # Run tests
```

## Architecture

### Request Flow

1. Frontend calls `POST /api/shorten` → backend generates 6-char alphanumeric short code → saves to MySQL + caches in Redis with TTL
2. Redirect: `GET /api/r/{shortCode}` → checks Redis first, falls back to MySQL → validates expiry → increments click count → redirects
3. Dashboard: `GET /api/urls` returns all mappings with click counts

### Backend Layers

```
controller/UrlController.java     → REST endpoints
service/UrlService.java           → Business logic (short code generation, Redis cache check/miss, expiry validation)
repository/UrlRepository.java     → Spring Data JPA
model/UrlMapping.java             → Entity: id, originalUrl, shortCode, clickCount, createdAt, expiresAt
config/RedisConfig.java           → RedisTemplate with String serialization
config/CorsConfig.java            → Allows all origins on /api/**
exception/GlobalExceptionHandler  → Maps IllegalArgumentException → 4xx, generic → 500
```

### Frontend Pages

- **Home.jsx** — URL input, expiry selector, result with QR code, copy-to-clipboard, recent links (localStorage)
- **Dashboard.jsx** — Bar chart (Chart.js), stats cards, searchable table with delete
- **App.js** — Routes: `/` (Home), `/dashboard` (Dashboard), `*` (NotFound)

API calls are centralized in `frontend/src/services/api.js`; base URL configured via `frontend/src/services/config.js`.

### Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/shorten` | `{ originalUrl, expiryDays }` → creates short URL |
| GET | `/api/r/{shortCode}` | Redirect (increments click count) |
| GET | `/api/urls` | All URL mappings for dashboard |
| DELETE | `/api/urls/{id}` | Delete a mapping |
