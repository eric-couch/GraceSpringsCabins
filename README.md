# Cabin Properties Portal

A modern, production-quality React + TypeScript + Vite application for managing cabin rental properties. Features role-based access (Renter, Staff, Admin), maintenance ticketing, community forums, and service notices.

## 🚀 Features

- **Role-Based Access**: Simulated authentication with three user roles (Renter, Staff, Admin)
- **Maintenance Management**: Submit and track maintenance requests with priority levels
- **Community Forums**: Threaded discussions with pinned posts and replies
- **Service Notices**: Display active notices and scheduled outages
- **Knowledge Base**: Staff-accessible troubleshooting guides
- **Admin Tools**: User management and notices/outages administration (read-only MVP)
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS
- **Type Safety**: Strict TypeScript for reliability
- **Client-Side Simulation**: localStorage overlays for write operations (no backend required)

## 🛠️ Tech Stack

- **React 18.3.1** - UI library
- **TypeScript 5.5.4** - Type safety
- **Vite 5.4.5** - Build tool and dev server
- **React Router 6.26.2** - Client-side routing
- **TanStack Query 5.56.2** - Data fetching and caching
- **Tailwind CSS 3.4.11** - Utility-first styling
- **ESLint + Prettier** - Code quality and formatting

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/GraceSpringsCabins.git
cd GraceSpringsCabins

# Install dependencies
npm install
```

## 🏃 Local Development

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

The app will be available at `http://localhost:5173/GraceSpringsCabins/`

## 👤 Role Switching

The application includes a role simulator for testing different user perspectives:

1. Navigate to **Profile** page
2. Use the **Role Simulator** section to select:
   - **Role**: Renter, Staff, or Admin
   - **User**: Choose from predefined users
   - **Property/Cabin**: Select appropriate assignments
3. Click **Apply Changes** to switch roles (page will reload)

### Predefined Users

- **Alice Johnson** (Renter) - C-001
- **Bob Williams** (Renter) - C-002, C-007
- **Carol White** (Staff) - Maintenance staff
- **David Brown** (Staff) - Facilities manager
- **Eve Manager** (Admin) - System administrator

## 📂 Project Structure

```
GraceSpringsCabins/
├── public/
│   ├── data/              # Static JSON data files
│   │   ├── properties.json
│   │   ├── cabins.json
│   │   ├── users.json
│   │   ├── tickets.json
│   │   ├── notices.json
│   │   ├── outages.json
│   │   ├── community.json
│   │   └── kb.json
│   └── 404.html          # SPA routing support
├── src/
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utility libraries
│   │   ├── api.ts        # Data fetching functions
│   │   ├── authSim.ts    # Session management
│   │   ├── localSim.ts   # localStorage overlay system
│   │   └── utils.ts      # Helper functions
│   ├── routes/           # Page components
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main app component with routing
│   └── main.tsx          # Application entry point
├── .github/
│   └── workflows/
│       └── gh-pages.yml  # GitHub Pages deployment
└── package.json
```

## 💾 Data Management

### Read-Only Data (JSON Files)

Static data is served from `/public/data/*.json`:
- Properties, cabins, users
- Initial tickets, notices, outages
- Community threads and replies
- Knowledge base articles

### Simulated Writes (localStorage)

User-generated content is stored in `localStorage` overlays:
- **New/Updated Tickets**: `ticketsOverlay`
- **Community Threads**: `communityOverlay.threadsCreated`
- **Thread Replies**: `communityOverlay.repliesCreated`

The application merges JSON data with localStorage overlays on read, simulating a persistent backend without modifying the original JSON files.

### Clearing Simulated Data

Open browser DevTools → Application/Storage → localStorage → Delete `ticketsOverlay` and `communityOverlay` to reset.

## 🌐 Deployment

### GitHub Pages (Automated)

1. Push to `main` branch
2. GitHub Actions workflow automatically builds and deploys to `gh-pages` branch
3. Site available at: `https://YOUR_USERNAME.github.io/GraceSpringsCabins/`

### Configuration

- Base path configured in `vite.config.ts`: `/GraceSpringsCabins/`
- Router basename set in `main.tsx`: `/GraceSpringsCabins`
- SPA routing handled by `404.html` redirect script

## 📋 Available Routes

### Public
- `/` - Home dashboard

### Renter
- `/maintenance/new` - Submit maintenance request
- `/maintenance/my` - View my tickets
- `/maintenance/:ticketId` - Ticket details
- `/community` - Community forums
- `/community/:threadId` - Thread details
- `/profile` - Profile and role simulator

### Staff
- `/staff/tickets` - Tickets queue (unassigned/assigned)
- `/staff/tickets/:ticketId` - Ticket details (staff view)
- `/staff/kb` - Knowledge base articles

### Admin
- `/admin/notices` - Notices and outages management
- `/admin/users` - User list

## 🎨 Customization

### Tailwind Theme

Edit `tailwind.config.js` to customize the primary color palette:

```js
colors: {
  primary: {
    50: '#eff6ff',
    // ... customize shades
  }
}
```

### Session Defaults

Edit `src/lib/authSim.ts` → `initializeDemoSession()` to change default role/user.

## 🔒 Authentication Notes

This is a **frontend-only demo** with simulated authentication:
- Session stored in `localStorage` (`cabinPortalSession`)
- No password protection or backend validation
- Role checks enforced client-side only
- **Do not use in production without proper backend authentication**

## 📝 Future Enhancements

- Real backend API integration
- Actual user authentication (OAuth, JWT)
- Write operations for Staff/Admin roles
- File attachments for tickets
- Real-time notifications
- Email integrations
- Advanced search and filtering
- Analytics dashboard

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💬 Support

For issues or questions, please open an issue on GitHub.
