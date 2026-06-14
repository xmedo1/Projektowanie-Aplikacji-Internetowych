import { Link } from 'react-router-dom';
import type { Movie } from '../types/index.ts';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl bg-card p-5 shadow-xl transition-transform hover:-translate-y-2">
      <div>
        <img
          src={`/posters/${movie.id}.jpg`}
          alt={`Plakat filmu ${movie.title}`}
          className="mb-5 aspect-[2/3] w-full rounded-lg object-cover shadow-lg"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/posters/no_poster.png';
          }}
        />
        <h2 className="mb-2 text-xl font-bold text-fg-default">{movie.title}</h2>
        <p className="text-sm text-fg-muted">Czas trwania: {movie.durationMinutes} min</p>
      </div>
      <Link
        to={`/movie/${movie.id}`}
        className="mt-6 block w-full rounded-lg bg-accent px-4 py-3 text-center font-bold text-fg-on-accent transition hover:bg-accent-hover"
      >
        Zobacz seanse
      </Link>
    </div>
  );
}
