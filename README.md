# Connecting to Your Supabase Database

## Steps to Connect

1. Create a new Supabase project:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Fill in your project details
   - Wait for the database to be provisioned

2. Get your database connection URL:
   - In your Supabase project dashboard, go to Settings > Database
   - Look for "Connection String" and select "URI"
   - Copy the connection string that looks like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
     ```

3. Set up environment variables:
   - In your local development environment, create a `.env` file
   - Add your DATABASE_URL:
     ```
     DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
     ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Run database migrations:
   ```bash
   npm run db:push
   ```

## Troubleshooting

- Make sure your database password is URL-encoded in the connection string
- Ensure your IP address is allowed in Supabase's database settings
- Check that the database user has the necessary permissions

## Available Scripts

- `npm run dev`: Start the development server
- `npm run db:push`: Push schema changes to the database
