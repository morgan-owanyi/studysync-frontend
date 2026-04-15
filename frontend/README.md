# StudySync — Frontend

React.js frontend for the StudySync Student Study Group Finder.

## Tech Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** Custom CSS with CSS Variables

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run development server
```bash
npm run dev
```

The app runs on **http://localhost:5173**

> The Vite dev server proxies all `/api` requests to `http://localhost:5000`, so make sure the backend is running.

### 3. Build for production
```bash
npm run build
```

## Project Structure
```
src/
├── components/
│   ├── Layout.jsx          # Sidebar + topbar shell
│   ├── Modal.jsx           # Reusable modal
│   ├── GroupCard.jsx       # Group card component
│   └── CreateGroupModal.jsx
├── context/
│   ├── AuthContext.jsx     # Global auth state + JWT
│   └── ToastContext.jsx    # Global toast notifications
├── pages/
│   ├── AuthPage.jsx        # Login / Register
│   ├── Dashboard.jsx
│   ├── BrowseGroups.jsx
│   ├── MyGroups.jsx
│   ├── Sessions.jsx
│   ├── GroupDetail.jsx     # Tabs: about, members, sessions, posts
│   ├── Profile.jsx
│   └── AdminPanel.jsx
├── styles/
│   └── global.css
├── utils/
│   └── api.js              # Axios instance with JWT interceptor
├── App.jsx                 # Router + route guards
└── main.jsx
```

## Features
- JWT authentication with protected routes
- Browse and search study groups
- Create, join, and leave groups
- Schedule and view study sessions
- Group posts / communication board
- Admin dashboard with platform statistics
- Fully responsive (desktop + mobile)
