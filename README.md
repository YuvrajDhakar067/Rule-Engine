# Rule Engine Application

This is a Rule Engine application that allows users to create, combine, and evaluate rules against data attributes. The application consists of a frontend built with React and a backend built with Node.js, Express, and MongoDB.

## Features

- Create a single rule and evaluate it against data attributes.
- Combine multiple rules and evaluate them against data attributes.
- Save rules and combined rules as Abstract Syntax Trees (AST) in MongoDB.
- Display the result of rule evaluation.

## Prerequisites

- Node.js and npm installed
- MongoDB installed and running (or use MongoDB Atlas)
- Basic knowledge of JavaScript, React, and Node.js

## Getting Started

### Backend Setup

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-username/rule-engine-app.git
   cd rule-engine-app
2. **Install dependencies

   ```sh
   cd backend
   npm install
3. **Create a .env file
     ```sh
     MONGO_URI=mongodb://localhost:27017/ruleengine
Replace mongodb://localhost:27017/ruleengine with your MongoDB URI if you're using MongoDB Atlas or a different setup.

4. **Start the backend server
   ```sh
     npm start





