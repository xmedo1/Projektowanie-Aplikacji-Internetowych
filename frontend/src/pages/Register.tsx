import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../services/api';
import { isAxiosError } from 'axios';

const registerSchema = z.object({
  email: z.email({ error: 'Niepoprawny format e-maila' }),

  password: z
    .string({ error: 'Hasło jest wymagane' })
    .min(8, { error: 'Hasło musi mieć minimum 8 znaków' }),

  firstName: z
    .string({ error: 'Imię jest wymagane' })
    .min(2, { error: 'Imię musi mieć minimum 2 znaki' }),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      const response = await api.post('/auth/register', data);

      console.log('Zarejestrowano pomyślnie:', response.data); // testy
      alert('Konto stworzone pomyślnie! Teraz możesz się zalogować.');

      navigate('/login');
    } catch (error) {
      if (isAxiosError(error)) {
        alert(error.response?.data?.message || 'Błąd rejestracji.');
      } else {
        alert('Wystąpił nieznany błąd.');
      }
    }
  };

  return (
    <AuthLayout title="Rejestracja">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Imię"
          type="text"
          error={errors.firstName?.message}
          {...register('firstName')}
        />

        <Input
          label="Adres e-mail"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Hasło"
          type="password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit">Stwórz konto</Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Masz już konto?{' '}
        <Link to="/login" className="text-accent hover:underline">
          Zaloguj się
        </Link>
      </p>
    </AuthLayout>
  );
}
