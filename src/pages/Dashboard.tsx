import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] flex flex-col">

      <header className="border-b border-slate-800 px-8 py-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-white tracking-tight">Proyecto Integrador</span>
        <Link to="/login" className="text-xs text-slate-500 hover:text-white transition-colors">Cerrar sesión</Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-semibold text-white">Panel principal</h1>
          <p className="mt-1 text-sm text-slate-500">Tus salas activas y accesos rápidos aparecerán aquí.</p>

          <div className="mt-8 rounded-lg border border-dashed border-slate-700 bg-slate-900/50 px-6 py-10 text-center">
            <p className="text-sm text-slate-500">Vista en construcción</p>
            <p className="mt-1 font-mono text-xs text-slate-600">/dashboard</p>
          </div>

          <Link
            to="/sala/demo-123"
            className="mt-4 flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            Entrar a sala de prueba
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
