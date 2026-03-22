# Shortly — URL Shortener

A full-stack URL shortener with click analytics, built with Spring Boot, React, and Redis.

## Live Demo
> Coming soon (deployment in progress)

## Screenshots
> Add screenshots here after testing

## Features
- Shorten any long URL to a clean short link
- One-click copy to clipboard
- Set custom expiry (7 / 30 / 90 days or never)
- Real-time click tracking
- Analytics dashboard with bar chart
- Redis caching for sub-10ms redirects
- REST API backend

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Chart.js, Axios |
| Backend | Java 21, Spring Boot 3.2 |
| Database | MySQL 9.6 |
| Cache | Redis |
| Build Tool | Maven |

## Architecture
```
User → React (port 3000)
           ↓
    Spring Boot API (port 8080)
           ↓
    Check Redis cache first
    If not cached → MySQL
           ↓
    Return redirect + increment click count
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shorten` | Create a short URL |
| GET | `/api/r/{shortCode}` | Redirect to original URL |
| GET | `/api/urls` | Get all URLs with analytics |

## How to Run Locally

### Prerequisites
- Java 21
- Node.js 20+
- MySQL
- Redis

### Backend
```bash
cd backend
# Update src/main/resources/application.properties with your MySQL password
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Open `http://localhost:3000` in your browser.

## What I Learned
- Building REST APIs with Spring Boot and JPA
- Redis caching to reduce database load
- JWT-ready architecture with Spring Security
- React state management with hooks
- Connecting React frontend to Spring Boot backend
- Git workflow and project structure for full-stack apps
