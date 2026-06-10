import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import AuthLayout from '../components/AuthLayout';

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthLayout title="Mock strony głównej">
      <p className="text-center m-6">Kiedyś tu będzie coś więcej</p>

      <Button onClick={handleLogout}>Wyloguj się</Button>
    </AuthLayout>
  );
}
