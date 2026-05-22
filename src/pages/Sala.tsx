import { useParams } from 'react-router-dom'

const Sala = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-xl bg-white p-10 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Sala</h1>
        <p className="mt-2 text-sm text-gray-500">
          Vista en construcción — /sala/<span className="font-mono text-indigo-600">{id}</span>
        </p>
      </div>
    </div>
  )
}

export default Sala
