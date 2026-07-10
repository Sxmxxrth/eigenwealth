<div align="center">
  <br />
  <h1>🚀 EigenWealth</h1>
  <p>
    <strong>AI-Powered Quant Research for Indian Markets</strong>
  </p>
  <br />
  <p>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" /></a>
    <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python&logoColor=white" alt="Python" /></a>
    <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-Backend-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" /></a>
    <a href="https://sqlite.org/"><img src="https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" /></a>
  </p>
</div>

<hr />

## 📖 Overview

EigenWealth uses machine learning models and large language models (LLMs) to intelligently score every Nifty 500 stock. It explains market signals with deep clarity and proactively alerts users *before* the market moves. 

This repository hosts the foundational infrastructure, including a robust waitlist system built in Node.js/Express, a responsive static front-end, and the skeleton for our upcoming high-performance ML microservices architecture.

---

## 🏗 Architecture

The system is designed with a microservices approach to ensure scalability for intensive quant research computations:

1. **Waitlist & API Gateway (Node.js/Express)**
   - Manages user onboarding and waitlist queuing.
   - Built with secure headers (Helmet), Rate Limiting, and CORS enabled.
   - Interacts with a lightning-fast SQLite database using `better-sqlite3` and Write-Ahead Logging (WAL).
2. **Quantitative Engine (Python / Upcoming)**
   - Handles data ingestion, preprocessing, and model inference (XGBoost/Scikit-learn).
   - Designed to run behind a FastAPI gateway.
3. **Frontend (Vanilla HTML/CSS/JS)**
   - A highly optimized, static, aesthetically pleasing dark-mode UI.
   - Deployed as static assets served directly through the Express backend.

---

## 🚀 Getting Started

### Prerequisites

- **Docker** & **Docker Compose**
- **Node.js 20.x** (If running natively)
- **Python 3.10+** (For future ML components)

### 🐳 Running with Docker (Recommended)

The easiest way to run the application is via Docker.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/eigenwealth.git
   cd eigenwealth
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   *(Update `.env` with your specific configurations if needed).*

3. **Start the containers:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Web UI: [http://localhost:3000](http://localhost:3000)
   - Admin Endpoint: [http://localhost:3000/api/admin/waitlist](http://localhost:3000/api/admin/waitlist) (Requires Basic Auth)

### 💻 Running Natively

If you prefer to run the Node server without Docker:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 📂 Repository Structure

```text
eigenwealth/
├── public/                 # Static frontend assets (HTML, CSS, JS)
├── db.js                   # SQLite database configuration & queries
├── server.js               # Express application entry point
├── Dockerfile              # Container configuration for the Node backend
├── docker-compose.yml      # Multi-container orchestration
├── requirements.txt        # Python dependencies for ML microservices
└── package.json            # Node.js dependencies and scripts
```

---

## 🔒 Security

- Basic Authentication is applied to administrative endpoints.
- XSS and clickjacking protection via `helmet`.
- Strict IP-based rate limiting on all API routes to prevent abuse.

---

<div align="center">
  <sub>Built with ❤️ by the EigenWealth Team</sub>
</div>
