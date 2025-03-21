# Parr-4-The-Course  

A personal cookbook web application built with React, Vite, Supabase, and hosted on Vercel.  

## Tech Stack  

- **Frontend**: React with TypeScript  
- **Build Tool**: Vite  
- **Styling**: Tailwind CSS  
- **Database**: Supabase  
- **Hosting**: Vercel  

## HOW TO SET UP AND EDIT CODE

1. **Install Node.js**  
   - [Download Node.js](https://nodejs.org/en)  
   - Verify node in terminal: `node -v`  
   - Verify npm in terminal: `npm -v`  
   - Verify npx in terminal: `npx --version`  
   - If npx hitches, run `npx clear-npx-cache`  

<br>

2. **Install VS Code**  
   - [Download Visual Studio Code](https://code.visualstudio.com/download)  

<br>

3. **Github Desktop**  
   - [Download Github Desktop](https://desktop.github.com/download/)  
   - Clone the repo `parr-4-the-course` and save it to your machine  
   - Pull the latest edition of `main`  
   - Open the file directory in VS Code  

<br>

4. **Vercel Config**  
   - Navigate to Vercel and link your Github account: [Vercel](https://vercel.com/)  
   - Join my project workspace via invite  
   - In terminal, run `npm install -g vercel`  

<br>

5. **Previewing the site**  
   *There are a few ways you can do this:*  
   - Run `npm start` in terminal (this will host the website locally from your machine using Node)  
   - Run `vercel dev` in terminal (This will use the Vercel CLI and prompt you in terminal to use y/n and arrow keys to select your project)  

<br>

6. **Pushing Changes**  
   - Save your code in VS Code  
   - Open Github Desktop to see the changes you made in each file  
   - Add a Comment and Description in the lower left-hand corner to explain what you changed  
   - Click "Commit"  
   - In the top, it should now say "Push Origin" rather than "Pull" or "Fetch". Click "Push Origin"  

---

## Docker Setup

This project uses Docker to provide a consistent development environment and simplify the deployment process. Below you'll find instructions for various Docker-related tasks.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials

### Development Environment

Start the development environment with hot-reloading:

```bash
docker-compose up app-dev
```

This will:
- Start a local Supabase instance
- Start the React application in development mode
- Mount your code as volumes for hot-reloading

Access the application at http://localhost:3000

### Testing

Run tests with:

```bash
docker-compose --profile testing up test
```

For CI/CD testing:

```bash
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

### Production Build

To build and test the production version locally:

```bash
docker-compose --profile production up app-prod
```

This will build an optimized production version and serve it using Nginx.
Access the production build at http://localhost:80

### Production Deployment

For production deployment:

```bash
docker-compose -f docker-compose.yml up -d
```

## Docker Architecture

### Multi-Stage Builds

The project uses a multi-stage Dockerfile to optimize for different environments:

1. **base**: Basic Node.js Alpine image with development dependencies
2. **deps**: Installs all dependencies
3. **development**: Development environment with hot-reloading
4. **builder**: Builds the production assets
5. **production**: Minimal Nginx image with only the built assets

### Environment Management

- `.env`: Local development environment variables
- `.env.test`: Testing environment variables

Environment variables are passed to containers via Docker Compose.

### CI/CD Integration

GitHub Actions workflows are configured for:
- Running tests
- Building production images
- Deployment (configurable based on your hosting provider)

## Development Workflow

1. Make changes to the code
2. Tests are automatically rerun thanks to volume mounts
3. See changes immediately with hot-reloading
4. Commit and push to trigger CI/CD pipeline

## Troubleshooting

### Common Issues

- **Port conflicts**: Change the port mappings in docker-compose.yml if ports 3000 or 8080 are already in use
- **Missing environment variables**: Ensure your .env file is properly configured
- **Permission issues**: Run Docker commands with sudo if needed or add your user to the docker group

### Logs

View logs with:

```bash
docker-compose logs -f app-dev
```

### Cleanup

Remove containers:

```bash
docker-compose down
```

Remove containers and volumes:

```bash
docker-compose down -v
```

## License

[MIT](LICENSE)

## Admin Features

This application includes an admin dashboard with user management, recipe moderation, and email ban functionality.

### Accessing the Admin Dashboard

The admin dashboard is only accessible to users with admin privileges. Admin status is stored in the `is_admin` field of the user's profile.

To access the admin dashboard:
1. Log in with an admin account
2. Navigate to `/admin` in your browser

### Admin Dashboard Features

The admin dashboard includes three main tabs:

#### 1. User Management
- View all registered users
- Delete user accounts (except your own admin account)
- See user creation dates

#### 2. Recipe Management
- View all recipes in the system
- Delete inappropriate or violating content
- Filter recipes by title or username

#### 3. Banned Emails
- Ban email addresses to prevent registration and login
- Add optional reason for the ban
- Remove emails from the banned list
- Search and filter banned emails

### Email Ban System

The banned emails feature allows administrators to:

1. **Prevent Registration**: Banned emails cannot create new accounts
2. **Block Sign-in**: Existing accounts with banned emails cannot sign in
3. **Track Ban Reasons**: Admins can add notes about why an email was banned

### Setting Up Admin Access

To set up admin access in Supabase:

1. Connect to your Supabase database or run the SQL in the Supabase dashboard
2. Execute the SQL commands in `supabase-admin-setup.sql`
3. Set a user as admin with:
   ```sql
   UPDATE profiles SET is_admin = true WHERE id = 'user-uuid-here';
   ```
