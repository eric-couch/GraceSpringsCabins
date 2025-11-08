import { getSession, hasAnyRole } from '../lib/authSim';
import OutagesWidget from '../components/Dashboard/OutagesWidget';
import NoticesWidget from '../components/Dashboard/NoticesWidget';
import MyTicketsWidget from '../components/Dashboard/MyTicketsWidget';

export default function Home() {
  const session = getSession();
  const isRenter = hasAnyRole(['Renter']);

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-forest-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Welcome to Grace Springs Cabins
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Your portal for maintenance, community, and property management.
          </p>
          <p className="text-gray-600">
            Visit your <strong>Profile</strong> page to simulate different roles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 bg-gradient-to-r from-forest-500 to-emerald-500 text-white rounded-xl p-6 shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-forest-100">
          Welcome back, {session.role}! 🌲
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NoticesWidget />
        <OutagesWidget />
        {isRenter && <MyTicketsWidget />}
      </div>
    </div>
  );
}
