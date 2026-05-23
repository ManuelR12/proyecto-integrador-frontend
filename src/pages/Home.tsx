import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Proyecto Integrador
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Plataforma de videollamadas. Conectéctate con tu equipo desde
            cualquier lugar.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/login"
            className="flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            Inicia sesión
          </Link>
          <Link
            to="/registro"
            className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
