import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Błąd podczas wylogowywania', error);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-input bg-card/90 backdrop-blur-md px-8 py-4 shadow-md">
      <div className="container mx-auto max-w-5xl flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-black text-accent hover:opacity-80 transition-opacity flex items-center gap-2"
        >
          Kino
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <span className="text-sm text-fg-muted hidden sm:block">
                Zalogowano jako:{' '}
                <Link to="/profile" className="font-bold text-accent hover:underline">
                  {user.firstName}
                </Link>
              </span>
              <div className="flex gap-3">
                <div className="w-28">
                  <Button onClick={() => navigate('/profile')}>Profil</Button>
                </div>
                <div className="w-28">
                  <Button onClick={handleLogout}>Wyloguj</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <div className="w-28">
                <Button onClick={() => navigate('/login')}>Zaloguj</Button>
              </div>
              <div className="w-28">
                <Button onClick={() => navigate('/register')}>Załóż konto</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
