# TaskCentral

A modern, full-stack task management demo featuring a .NET Core API backend and a reactive Vue.js 3 frontend. Supports multiple todo lists, priority items, due dates, and a sidebar to provide at-a-glance access.

## Tech Stack

### Backend (`TaskCentralBackEnd`)
- **Framework**: ASP.NET Core Web API
- **Database**: SQLite (via Entity Framework Core)
- **ORM**: Entity Framework Core

### Frontend (`TaskCentralWebApp`)
- **Framework**: Vue.js 3 (Composition API) + Vue Router
- **Styling**: Tailwind CSS v4
- **Testing **: Vitest

## How to Run

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+)

### 1. Start the Backend API
The backend serves the data and runs on `http://localhost:3001`.

```bash
cd TaskCentralBackEnd
dotnet restore
dotnet run --launch-profile http
```

### 2. Start the Frontend App
The frontend is built with Vite and proxies API requests to the backend.

```bash
cd TaskCentralWebApp
npm install
npm run dev
```

Open your browser to the URL shown in the terminal (should be `http://localhost:3000`, unless it was taken already).

### Running Tests
Run the frontend unit tests with Vitest:

```bash
cd TaskCentralWebApp
npm run test
```

### Assumptions


A login system would already exist for me to leverage in a 'real' situation.

### Tradeoffs
The sidebar is hidden on mobile layouts as stacking it vertically became redundant and confusing.

I leveraged font-awesome icons which adds an external dependency, but provides quick, conistent icons for the UI.

The caching system was written in order to avoid constant API calls, and instead only make API calls when necessary, and every 60 seconds. This is a bit silly, as APIs are really good at serving data, but I wanted to try my hand at a caching system for it.

### Future Improvements
HTTPS! This app is not secure currently.

Scalability - adding additional users would require a more complex database structure with user IDs stored per list, and todo item.
