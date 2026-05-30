import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { common, product } from '../copy/es'

const Dashboard = () => {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  return (
    <div id='dashboard' className='flex min-h-screen w-full flex-col bg-[#f6f7f8]'>
      <header className='border-b border-slate-200 bg-white px-8 py-4 flex items-center justify-between'>
        <span className='text-sm font-bold text-blue-600'>{product.name}</span>
        <button
          id='btn-sign-out'
          type='button'
          onClick={handleSignOut}
          className='text-xs text-slate-500 transition hover:text-red-600'
        >
          {common.cerrarSesion}
        </button>
      </header>

      <main className='flex flex-1 flex-col items-center justify-center px-6'>
        <div className='w-full max-w-lg'>
          <h1 className='text-2xl font-semibold text-slate-900'>Panel principal</h1>
          <p className='mt-1 text-sm text-slate-500'>
            Tus salas activas y accesos rápidos aparecerán aquí.
          </p>

          <div className='mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center'>
            <p className='text-sm text-slate-500'>Vista en construcción</p>
            <p className='mt-1 font-mono text-xs text-slate-400'>/dashboard</p>
          </div>

          <Link
            to='/sala/demo-123'
            className='mt-4 flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500'
          >
            Entrar a sala de prueba
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
