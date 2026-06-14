import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Błąd podczas wylogowywania', error);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-input bg-card/90 px-8 py-4 shadow-md backdrop-blur-md">
      <div className="container mx-auto flex max-w-6xl items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-black text-accent transition-opacity hover:opacity-80"
        >
          Kino
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <span className="hidden text-sm text-fg-muted sm:block">
                Zalogowano jako:{' '}
                <Link to="/profile" className="font-bold text-accent hover:underline">
                  {user.firstName}
                </Link>
              </span>
              <div className="flex gap-3">
                {user.role === 'ADMIN' && (
                  <div className="hidden w-36 sm:block">
                    <Button onClick={() => navigate('/admin')}>Panel Admina</Button>
                  </div>
                )}

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

          <button
            onClick={toggleTheme}
            className="text-fg-muted transition-transform hover:scale-110 hover:text-accent focus:outline-none cursor-pointer"
            title={theme === 'light' ? 'Przełącz na ciemny' : 'Przełącz na jasny'}
          >
            {theme === 'light' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
