import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthProvider';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Reservation from './pages/Reservation';
import MovieDetails from './pages/MovieDetails';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeProvider';
import { NotificationProvider } from './context/NotificationProvider';
import AdminDashboard from './pages/AdminDashboard';
import AdminMovies from './pages/AdminMovies';
import AdminScreenings from './pages/AdminScreenings';
import AdminUsers from './pages/AdminUsers';
import AdminReservations from './pages/AdminReservations';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route
                  path="/reservation/:id"
                  element={
                    <ProtectedRoute>
                      <Reservation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/movies"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminMovies />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/screenings"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminScreenings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reservations"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminReservations />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
