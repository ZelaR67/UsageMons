# Better Stats Smogon

This project displays Smogon usage stats with a better UI. It uses a React frontend and a Supabase backend.

## Setup

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:**
    Create a `.env` file in the root directory with the following variables:
    ```
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    ```
    *Note: `SUPABASE_SERVICE_ROLE_KEY` is only needed for the data upload script.*

## Database Setup (Supabase)

1.  Create a new project in Supabase.
2.  Go to the SQL Editor in the Supabase dashboard.
3.  Copy the contents of `supabase_schema.sql` and run it to create the necessary tables and policies.

## Data Upload

To upload the stats data from the local JSON files to Supabase:

1.  **Set up Python environment:**
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    pip install -r requirements.txt
    ```
2.  **Run the upload script:**
    ```bash
    python scripts/upload_to_supabase.py
    ```

## Development

To start the development server:

```bash
npm run dev
```

## Deployment

The project is set up to deploy to GitHub Pages using GitHub Actions. Pushing to the `main` branch will trigger a deployment.
