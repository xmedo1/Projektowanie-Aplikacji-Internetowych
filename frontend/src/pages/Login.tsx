import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../services/api';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const loginSchema = z.object({
  email: z.email({ error: 'Niepoprawny format e-maila' }),

  password: z.string({ error: 'Hasło jest wymagane' }).min(1, { error: 'Hasło jest wymagane' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const { refreshUser } = useAuth();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await api.post('/auth/login', data);
      await refreshUser();
      showNotification('Zalogowano pomyślnieW');
      navigate('/');
    } catch (error) {
      if (isAxiosError(error)) {
        showNotification(error.response?.data?.error || 'Błąd logowania.', 'error');
      } else {
        showNotification('Wystąpił nieznany błąd.', 'error');
      }
    }
  };

  return (
    <AuthLayout title="Zaloguj się">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="E-mail"
          type="email"
          placeholder="jankowalski@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Hasło"
          type="password"
          placeholder="password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit">Zaloguj się</Button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        Nie masz jeszcze konta?{' '}
        <Link to="/register" className="text-accent hover:underline">
          Zarejestruj się
        </Link>
      </p>
    </AuthLayout>
  );
}
