import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../services/api';

const loginSchema = z.object({
  email: z.email({ error: 'Niepoprawny format e-maila' }),

  password: z.string({ error: 'Hasło jest wymagane' }).min(1, { error: 'Hasło jest wymagane' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await api.post('/auth/login', data);
      const { token } = response.data;

      localStorage.setItem('token', token); // todo

      navigate('/'); // todo
    } catch (error: any) {
      alert(error.response?.data?.message || 'Błąd logowania.');
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

      <p className="mt-6 text-center text-sm text-gray-400">
        Nie masz jeszcze konta?{' '}
        <Link to="/register" className="text-green-400 hover:underline">
          Zarejestruj się
        </Link>
      </p>
    </AuthLayout>
  );
}
