# Shortly — URL Shortener

A full-stack URL shortener with click analytics, custom aliases, and Redis caching — built with Spring Boot, React, and PostgreSQL.

**Live Demo:** https://frontend-seven-rosy-23.vercel.app

> Note: Backend is on Render's free tier and may take ~50 seconds to wake up after inactivity.

---

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://frontend-seven-rosy-23.vercel.app |
| Backend | Render | https://url-shortener-qiwf.onrender.com |
| Database | Neon (PostgreSQL) | Managed database |
| Cache | Upstash Redis | Managed cache |

---

## Demo

[![Shortly Demo](assets/screenshots/01-home.png)](assets/demo.mp4)

> Click the image above or view [`assets/demo.mp4`](assets/demo.mp4) for a full walkthrough.

---

## Screenshots

### Home — Shorten a URL
![Home Page](assets/screenshots/01-home.png)

### Result with QR Code
![Result with QR Code](assets/screenshots/03-home-result.png)

### Analytics Dashboard
![Dashboard](assets/screenshots/04-dashboard.png)

### Link Not Found
![Link Not Found](assets/screenshots/05-link-not-found.png)

---

## Features

- Shorten any URL to a clean short link
- **Custom aliases** — pick your own short code (e.g. `shortly/my-link`)
- One-click copy to clipboard with toast notification
- QR code generated for every link
- Set custom expiry (7 / 30 / 90 days or never)
- Real-time click tracking per link
- **Analytics dashboard** — bar chart (clicks per URL) + line chart (clicks over last 7 days)
- Redis caching for sub-10ms redirects
- Search and filter links on the dashboard

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Chart.js, Axios |
| Backend | Java 21, Spring Boot 3.5 |
| Database | PostgreSQL |
| Cache | Redis |
| Build Tool | Maven |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## Architecture

```
User → React (port 3000)
           ↓
    Spring Boot API (port 8080)
           ↓
    Check Redis cache first
    If not cached → PostgreSQL
           ↓
    Return redirect + increment click count
    Record ClickEvent with timestamp
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shorten` | Create a short URL (supports custom alias + expiry) |
| GET | `/api/r/{shortCode}` | Redirect to original URL |
| GET | `/api/urls` | Get all URLs with analytics |
| DELETE | `/api/urls/{id}` | Delete a URL mapping |
| GET | `/api/analytics` | Clicks grouped by day (last 7 days) |

## How to Run Locally

### Prerequisites
- Java 21
- Node.js 20+
- PostgreSQL (create a database named `urlshortener`)
- Redis

### Backend
```bash
cd backend
# Set env vars or edit application.properties with your credentials
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
cp .env.example .env        # set REACT_APP_API_URL=http://localhost:8080/api
npm install
npm start
```

Open `http://localhost:3000` in your browser.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_USERNAME` | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | `postgres` | PostgreSQL password |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `APP_BASE_URL` | `http://localhost:8080` | Backend base URL (used in generated short links) |
| `REACT_APP_API_URL` | `http://localhost:8080/api` | Frontend API base URL |

## What I Learned
- Building REST APIs with Spring Boot and Spring Data JPA
- Redis caching strategy (cache-aside) to reduce database load
- React state management with hooks and component composition
- Full-stack integration: React frontend ↔ Spring Boot backend
- Analytics data modeling with time-series click tracking
