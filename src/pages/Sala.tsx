import { Link, useParams } from 'react-router-dom'

const Sala = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen w-full bg-[#0d0d12] flex flex-col text-slate-100">

      <header className="border-b border-slate-800 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-medium text-white">Sala</span>
          <code className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400 font-mono">{id}</code>
        </div>
        <Link to="/dashboard" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
          &larr; Dashboard
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-2xl">

          <div className="aspect-video w-full rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-slate-500">Feed de video / contenido de la sala</p>
              <p className="mt-1 font-mono text-xs text-slate-700">/sala/{id}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <button className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
              Microfono
            </button>
            <button className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
              Camara
            </button>
            <Link
              to="/dashboard"
              className="rounded-lg bg-red-700 px-5 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
            >
              Salir
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-slate-700">Vista en construcción</p>
        </div>
      </main>
    </div>
  )
}

export default Sala
