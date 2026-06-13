const AVATAR_COLORS = [
	"bg-blue-600",
	"bg-violet-500",
	"bg-amber-500",
	"bg-emerald-500",
	"bg-rose-500",
	"bg-cyan-600",
] as const;

export function colorForIndex(index: number): string {
	return AVATAR_COLORS[index % AVATAR_COLORS.length];
}
