# 📚 ECOMMERCE PROJECT README

## Table of Contents

- [Overview](#overview)
- [Vision](#vision)
- [Mission](#mission)
- [Actors of the System](#actors-of-the-system)
- [Functional Requirements](#functional-requirements)
- [Non-Functional Requirements](#non-functional-requirements)
- [ERD](#erd)
- [Flow Charts](#flow-charts)
- [Sequence Diagram](#sequence-diagram)
- [Assumptions](#assumptions)
- [API Contract](#api-contract)
- [Tech Stack](#tech-stack)
- [Setup & Installation Guide](#setup--installation-guide)
- [Testing Suite](#testing-suite)

---

## 🗂️ Overview


Foodlify is an e-commerce platform dedicated to revolutionizing the dining and food delivery experience. It connects customers with various restaurants, allowing them to browse menus, manage shopping carts, and place orders intuitively. The system supports robust user management with distinct roles, extensive restaurant menu configurations, real-time order tracking, and secure multi-option payment integrations to ensure a smooth end-to-end transaction.

---

## 🧭 Vision


To become the leading and most trusted food-commodity e-commerce ecosystem, providing a seamless bridge between culinary businesses and customers through innovative technology. We aim to make quality food globally accessible while empowering restaurants to scale their reach digitally.

---

## 🎯 Mission


To deliver a reliable, intuitive, and scalable food delivery platform that simplifies the ordering process for customers. We strive to provide restaurants with robust tools to manage their menus, track orders, and process payments securely and efficiently.

---

## 👥 Actors of the System
> *Written by: Radwa*

<!-- List and describe all actors (users, systems, roles) that interact with the system. -->

---

## 📦 Functional Requirements
> *Written by: Radwa*

<!-- List all functional requirements. What must the system do? -->

---

## ⚙️ Non-Functional Requirements
> *Written by: Radwa*

<!-- List all non-functional requirements: performance, scalability, security, availability, etc. -->

---

## 📊 ERD
> *Written by: Zahraa*

<!-- Include the Entity Relationship Diagram (ERD) here. You can embed an image or link to it. -->

---

## 🔄 Flow Charts

<!-- Include flow charts that illustrate the main processes and workflows of the system. -->

---

## 🧩 Sequence Diagram

<!-- Include sequence diagrams that show how components interact over time for key use cases. -->

---

## 🧾 Assumptions

<!-- List any assumptions made during design or development of the system. -->

---

## 📡 API Contract

<!-- Document the API endpoints, request/response formats, authentication, and error codes. -->

---

## 🛠️ Tech Stack

- **Runtime & Environment:** Node.js
- **Backend Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **API Documentation:** Swagger / OpenAPI
- **Containerization:** Docker
- **Version Control:** Git & GitHub

---

## 🚀 Setup & Installation Guide

Follow these steps to set up the backend environment locally:

### Prerequisites
- Node.js (v25.9.0) - *We provide an `.nvmrc` file for easy switching via `nvm use`*
- Docker & Docker Compose
- Git

### Installation Steps (Local Environment)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Foodlify/Group-1-Team-1.git
   cd Group-1-Team-1
   ```

2. **Select the correct Node version:**
   ```bash
   nvm use
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Environment Setup:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   *Make sure your `.env` contains the correct `DATABASE_URL` (e.g., `postgresql://user:password@localhost:5432/foodlify?schema=public`).*

5. **Start the Database (Docker):**
   ```bash
   docker-compose up -d db
   ```

6. **Database Migration:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

### API Documentation
Once the server is running, explore the Swagger documentation at:
`http://localhost:3000/api-docs`

---

## 🧪 Testing Suite

<!-- Describe the testing strategy, tools used, and how to run the tests. -->

---