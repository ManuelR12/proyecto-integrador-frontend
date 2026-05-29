import { Link } from "react-router-dom";
import { auth as copy } from "../copy/es";
import AuthShell from "../components/layout/AuthShell";

const Login = () => {
	return (
		<AuthShell>
			<div className="w-full max-w-sm">
				<h1 className="text-2xl font-semibold text-slate-900">{copy.login.title}</h1>
				<p className="mt-1 text-sm text-slate-500">{copy.login.subtitle}</p>

				<div className="mt-6 rounded-2xl border border-slate-200 bg-white px-8 py-8 shadow-sm">
					<div className="rounded-lg border border-dashed border-slate-200 px-6 py-10 text-center">
						<p className="text-sm text-slate-400">Formulario en construcción</p>
						<p className="mt-1 font-mono text-xs text-slate-300">/login</p>
					</div>

					<Link
						to="/dashboard"
						className="mt-6 flex items-center justify-center rounded-lg bg-[#165dfb] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
					>
						Continuar al panel
					</Link>
				</div>

				<p className="mt-5 text-center text-xs text-slate-500">
					{copy.login.footerPrompt}{" "}
					<Link to="/registro" className="text-blue-600 transition-colors hover:text-blue-500">
						{copy.login.footerLink}
					</Link>
				</p>
			</div>
		</AuthShell>
	);
};

export default Login;
