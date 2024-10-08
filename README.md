Product Price Fetcher
Overview
Product Price Fetcher is a web application that allows users to manage product pricing profiles. It provides functionality to search for products, adjust their prices, and save pricing profiles. The application consists of a React frontend and a Node.js backend with Express and SQLite.
Features

Search for products by category, segment, brand, or SKU
Add products to a pricing profile
Adjust prices using fixed or percentage-based modifications
Save and load pricing profiles
View a summary of selected products with original and adjusted prices

Tech Stack

Frontend: React
Backend: Node.js with Express
Database: SQLite
API Documentation: Swagger

Setup
Prerequisites

Node.js and npm installed on your machine
Git for version control

Installation

Clone the repository:
Copygit clone https://github.com/your-username/product-price-fetcher.git
cd product-price-fetcher

Install backend dependencies:
Copycd backend
npm install

Install frontend dependencies:
Copycd ../frontend
npm install


Running the Application

Start the backend server:5000
Copy cd backend
npm run dev
The server will run on http://localhost:5000
In a new terminal, start the frontend development server:3000
Copy cd frontend
npm start
The React app will run on http://localhost:3000
Open your browser and navigate to http://localhost:3000 to use the application

API Documentation
The backend API is documented using Swagger. To view the API documentation:

Start the backend server
Navigate to http://localhost:5000/api-docs in your browser

Usage

Select a profile
Search for products using the search bar or filters
Add products to your selection
Adjust prices using the price adjustment tools
Save your profile 

Contributing:
Contributions are welcome! Please feel free to submit a Pull Request.
License
This project is licensed under the MIT License.
