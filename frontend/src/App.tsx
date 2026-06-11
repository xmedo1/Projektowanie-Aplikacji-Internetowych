import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthProvider';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Reservation from './pages/Reservation';
import MovieDetails from './pages/MovieDetails';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
