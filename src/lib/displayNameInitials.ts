/** Builds up to two initials from a display name for avatar fallbacks. */
export function displayNameInitials(displayName: string): string {
	return displayName
		.split(/[\s_.-]+/)
		.map((part) => part[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();
}
