import { Link, useLocation } from 'react-router-dom';
import { getSession } from '../lib/authSim';

export default function NavBar() {
  const location = useLocation();
  const session = getSession();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive(path)
        ? 'bg-forest-100 text-forest-900'
        : 'text-gray-700 hover:bg-forest-50'
    }`;

  return (
    <nav className="bg-white shadow-md border-b border-forest-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-forest-600 to-emerald-600 bg-clip-text text-transparent">
                🏡 Grace Springs
              </span>
            </Link>

            {session && (
              <div className="hidden md:flex space-x-1">
                <Link to="/" className={linkClass('/')}>
                  Home
                </Link>

                {session.role === 'Renter' && (
                  <>
                    <Link
                      to="/maintenance/my"
                      className={linkClass('/maintenance/my')}
                    >
                      My Tickets
                    </Link>
                    <Link
                      to="/maintenance/new"
                      className={linkClass('/maintenance/new')}
                    >
                      New Request
                    </Link>
                  </>
                )}

                {(session.role === 'Renter' || session.role === 'Admin') && (
                  <Link to="/community" className={linkClass('/community')}>
                    Community
                  </Link>
                )}

                {session.role === 'Staff' && (
                  <>
                    <Link to="/staff/tickets" className={linkClass('/staff/tickets')}>
                      Tickets
                    </Link>
                    <Link to="/staff/kb" className={linkClass('/staff/kb')}>
                      Knowledge Base
                    </Link>
                  </>
                )}

                {session.role === 'Admin' && (
                  <>
                    <Link to="/admin/notices" className={linkClass('/admin/notices')}>
                      Notices & Outages
                    </Link>
                    <Link to="/admin/users" className={linkClass('/admin/users')}>
                      Users
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {session && (
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-sm text-gray-600">
                {session.role} • Cabin {session.cabinId?.replace('C-', '') || 'N/A'}
              </span>
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
