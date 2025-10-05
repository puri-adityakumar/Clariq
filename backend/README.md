# CLARIQ Backend

Backend services for CLARIQ - AI-Powered Sales Intelligence platform.

## Local Installation

### Prerequisites

- Python 3.10+
- pip
- Git

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/puri-adityakumar/clariq.git
   cd clariq/backend
   ```

2. **Set up a virtual environment**

   ```bash
   python -m venv .venv
   # On Windows
   .\.venv\Scripts\activate
   # On macOS/Linux
   source .venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**

   Copy the example environment file and update it with your credentials:

   ```bash
   copy .env.example .env
   ```

   Edit the `.env` file with your Appwrite credentials and API keys.

5. **Run the development server**

   ```bash
   uvicorn src.main:app --reload
   ```

   The API should now be running at http://localhost:8000

## API Documentation

Once running, you can access the API documentation at:

- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

## Project Structure

```
backend/
├── .env.example        # Environment variables template
├── pyproject.toml      # Project configuration
├── requirements.txt    # Project dependencies
├── src/                # Application source code
│   ├── main.py         # FastAPI application entry point
│   ├── api/            # API endpoints
│   ├── core/           # Core functionality
│   ├── services/       # Service integrations
│   ├── utils/          # Utility functions
│   └── workers/        # Background workers
└── README.md           # This file
```
