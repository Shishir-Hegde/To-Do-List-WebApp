# To-Do List WebApp

A simple and intuitive web application for managing tasks, built with HTML, CSS, JavaScript, and Node.js. This app allows users to add, delete, and track their daily tasks.

## Features

- **Add Tasks:** Quickly add new tasks to your to-do list.
- **Delete Tasks:** Remove tasks that are no longer needed.
- **Task Completion:** Mark tasks as completed to keep track of progress.
- **Persistent Storage:** Your tasks are saved in a MongoDB database, so they remain available even after closing the browser.
- **User Authentication:** Secure sign-up and login functionality using Passport.js and bcrypt for password hashing.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- 
- **Database:** PostgreSQL
- **Authentication:** Passport.js, bcrypt

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- Node.js (version 12 or higher)
- - PostgreSQL (locally installed or a managed PostgreSQL service)
- Git

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Shishir-Hegde/To-Do-List-WebApp.git
   cd To-Do-List-WebApp

2. **Install the required dependencies:**
   ```bash
   npm install

3. **Set up environment variables**
   ```bash
   PORT=3000
   MONGO_URI=your_mongo_database_uri
   SESSION_SECRET=your_session_secret\

4. **Run the application**
   ```bash
   npm start
   
The app should now be running on http://localhost:3000.




