import { getPasswordRules } from "../../lib/passwordRules";

const CheckIcon = () => (
	<svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
		<path
			fillRule="evenodd"
			d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
			clipRule="evenodd"
		/>
	</svg>
);

const DotIcon = () => (
	<svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
		<circle cx="10" cy="10" r="3" />
	</svg>
);

interface PasswordStrengthChecklistProps {
	password: string;
}

const PasswordStrengthChecklist = ({ password }: PasswordStrengthChecklistProps) => {
	if (!password) return null;

	const rules = getPasswordRules(password);

	return (
		<ul className="mt-2 flex flex-col gap-1.5" aria-label="Requisitos de contraseña">
			{rules.map((rule) => (
				<li
					key={rule.id}
					className={`flex items-center gap-2 text-xs transition-colors duration-150 ${
						rule.met ? "text-green-600" : "text-slate-400"
					}`}
				>
					{rule.met ? <CheckIcon /> : <DotIcon />}
					<span>{rule.label}</span>
				</li>
			))}
		</ul>
	);
};

export default PasswordStrengthChecklist;
