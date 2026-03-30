# Hema Care Companion

This project consists of a full-stack application with a React/Vite frontend and a FastAPI (Python) backend.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js & npm](https://nodejs.org/)
- [Python 3.8+](https://www.python.org/downloads/)
- Git

## Project Structure

The project is divided into two main parts:
- **Frontend**: The root directory contains the Vite/React application.
- **Backend**: The `backend/` directory contains the FastAPI application.

## Setup Instructions

### 1. Clone the repository

```sh
git clone <YOUR_GIT_URL>
cd hema-care-companion
```

### 2. Backend Setup (FastAPI)

Open a terminal and navigate to the backend directory:

```sh
cd backend
```

Create and activate a virtual environment (optional but highly recommended):

```sh
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install the required backend dependencies:

```sh
pip install -r requirements.txt
```

**Environment Variables:**
Create a `.env` file inside the `backend/` directory. You can use `.env.example` as a reference.

Run the FastAPI development server:

```sh
python -m uvicorn app.main:app --reload
```
The backend will usually be accessible at `http://localhost:8000`.

### 3. Frontend Setup (React/Vite)

Open a separate terminal window and ensure you are in the root directory (`hema-care-companion`).

Install the required frontend dependencies:

```sh
npm install
```

**Environment Variables:**
Create a `.env` file in the root directory and configure any necessary environment variables.

Run the frontend development server:

```sh
npm run dev
```
The frontend will typically run at `http://localhost:5173` or `http://localhost:8080` (check terminal output for the exact URL).

## Technologies Used

- **Frontend**: Vite, React, TypeScript, Tailwind CSS, shadcn-ui
- **Backend**: Python, FastAPI, Uvicorn, Supabase
