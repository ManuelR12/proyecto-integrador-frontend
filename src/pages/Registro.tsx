import { Link } from 'react-router-dom'
import { auth as copy } from '../copy/es'
import AvatarPicker from '../components/ui/AvatarPicker'
import FormField from '../components/ui/FormField'
import SubmitButton from '../components/ui/SubmitButton'
import { useRegisterForm } from '../hooks/useRegisterForm'

const Registro = () => {
  const { fields, fieldErrors, serverError, loading, setField, setAvatarError, handleSubmit } =
    useRegisterForm()

  const isLoading = loading

  return (
    <div className="min-h-screen w-full bg-[#f6f7f8] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          to="/"
          className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          {copy.back}
        </Link>

        {/* Header */}
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">{copy.register.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isLoading ? copy.register.subtitleLoading : copy.register.subtitle}
        </p>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Formulario de registro"
          className="mt-8 rounded-2xl border border-slate-200 bg-white px-8 py-8 shadow-sm"
        >
          <fieldset disabled={isLoading} className="flex flex-col gap-5 border-0 p-0 m-0">
            {/* Row: nombres + apellidos */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="nombres"
                label={copy.register.nombresLabel}
                type="text"
                autoComplete="given-name"
                placeholder={copy.register.nombresPlaceholder}
                value={fields.nombres}
                error={fieldErrors.nombres}
                onChange={(e) => setField('nombres', e.target.value)}
              />
              <FormField
                id="apellidos"
                label={copy.register.apellidosLabel}
                type="text"
                autoComplete="family-name"
                placeholder={copy.register.apellidosPlaceholder}
                value={fields.apellidos}
                error={fieldErrors.apellidos}
                onChange={(e) => setField('apellidos', e.target.value)}
              />
            </div>

            {/* Username */}
            <FormField
              id="username"
              label={copy.register.usernameLabel}
              type="text"
              autoComplete="username"
              placeholder={copy.register.usernamePlaceholder}
              value={fields.username}
              error={fieldErrors.username}
              helper={!fieldErrors.username ? copy.register.usernameHelper : undefined}
              onChange={(e) => setField('username', e.target.value)}
            />

            {/* Avatar */}
            <AvatarPicker
              preview={fields.avatarDataUrl}
              error={fieldErrors.avatar}
              disabled={isLoading}
              onChange={(dataUrl, validationError) => {
                setField('avatarDataUrl', dataUrl)
                setAvatarError(validationError)
              }}
            />

            {/* Email */}
            <FormField
              id="email"
              label={copy.register.emailLabel}
              type="email"
              autoComplete="email"
              placeholder={copy.register.emailPlaceholder}
              value={fields.email}
              error={fieldErrors.email}
              onChange={(e) => setField('email', e.target.value)}
            />

            {/* Password */}
            <FormField
              id="password"
              label={copy.register.passwordLabel}
              type="password"
              autoComplete="new-password"
              placeholder={copy.register.passwordPlaceholder}
              value={fields.password}
              error={fieldErrors.password}
              helper={!fieldErrors.password ? copy.register.passwordHelper : undefined}
              onChange={(e) => setField('password', e.target.value)}
            />
          </fieldset>

          {/* Server / global error */}
          {serverError && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <SubmitButton
            loading={isLoading}
            loadingLabel={copy.register.submitLoading}
            className="mt-6"
          >
            {copy.register.submit}
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          {copy.register.footerPrompt}{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500 transition-colors">
            {copy.register.footerLink}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Registro
