/**
 * Returns Tailwind grid column classes for a responsive video layout
 * based on the number of active tiles (local + remote + pending).
 */
export function getVideoGridClass(tileCount: number): string {
	if (tileCount <= 1) return "grid-cols-1";
	if (tileCount === 2) return "grid-cols-1 sm:grid-cols-2";
	if (tileCount === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
	if (tileCount === 4) return "grid-cols-2";
	if (tileCount <= 6) return "grid-cols-2 lg:grid-cols-3";
	if (tileCount <= 9) return "grid-cols-2 md:grid-cols-3";
	return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
}

/**
 * Adjusts tile aspect ratio so the grid fills the stage without overflow.
 */
export function getVideoTileAspectClass(tileCount: number): string {
	if (tileCount <= 1) return "aspect-video max-h-full";
	if (tileCount <= 4) return "aspect-video";
	return "aspect-[4/3]";
}
