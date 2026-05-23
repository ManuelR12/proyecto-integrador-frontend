import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link
            to="/"
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            &larr; Volver
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-white">
            Inicia sesión
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Accede a tus salas y reuniones.
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/50 px-6 py-8 text-center">
          <p className="text-sm text-slate-500">Formulario en construcción</p>
          <p className="mt-1 font-mono text-xs text-slate-600">/login</p>
        </div>

        <Link
          to="/dashboard"
          className="mt-4 flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
          Continuar al panel
        </Link>

        <p className="mt-6 text-center text-xs text-slate-600">
          ¿No tienes cuenta?{' '}
          <Link
            to="/registro"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
