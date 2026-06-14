export interface PasswordRule {
	id: string;
	label: string;
	met: boolean;
}

export function getPasswordRules(password: string): PasswordRule[] {
	return [
		{ id: "length", label: "Mínimo 8 caracteres", met: password.length >= 8 },
		{ id: "upper", label: "Al menos una mayúscula", met: /[A-Z]/.test(password) },
		{ id: "lower", label: "Al menos una minúscula", met: /[a-z]/.test(password) },
		{ id: "special", label: "Al menos un carácter especial", met: /[^a-zA-Z0-9]/.test(password) },
	];
}

export function allPasswordRulesMet(password: string): boolean {
	return getPasswordRules(password).every((r) => r.met);
}
