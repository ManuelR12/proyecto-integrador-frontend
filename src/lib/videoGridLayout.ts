export type VideoGridLayoutPattern = "1x1" | "1x2" | "2x2" | "2+1" | "auto";

export interface VideoGridLayout {
	pattern: VideoGridLayoutPattern;
	containerClass: string;
	getTileClass: (index: number) => string;
}

const TILE_FILL = "min-h-0 min-w-0 h-full w-full";

/**
 * Computes a viewport-safe CSS Grid layout for 1–4 concurrent video streams.
 * Layouts are height-first so tiles never force scrollbars in the room stage.
 */
export function getVideoGridLayout(tileCount: number): VideoGridLayout {
	if (tileCount <= 0) {
		return {
			pattern: "1x1",
			containerClass: "grid-cols-1 grid-rows-1",
			getTileClass: () => TILE_FILL,
		};
	}

	if (tileCount === 1) {
		return {
			pattern: "1x1",
			containerClass: "grid-cols-1 grid-rows-1",
			getTileClass: () => `${TILE_FILL} aspect-video max-h-full max-w-full mx-auto`,
		};
	}

	if (tileCount === 2) {
		return {
			pattern: "1x2",
			containerClass: "grid-cols-2 grid-rows-1",
			getTileClass: () => TILE_FILL,
		};
	}

	if (tileCount === 3) {
		return {
			pattern: "2+1",
			containerClass: "grid-cols-2 grid-rows-2",
			getTileClass: (index) =>
				index === 2 ? `${TILE_FILL} col-span-2 w-1/2 justify-self-center` : TILE_FILL,
		};
	}

	if (tileCount === 4) {
		return {
			pattern: "2x2",
			containerClass: "grid-cols-2 grid-rows-2",
			getTileClass: () => TILE_FILL,
		};
	}

	if (tileCount <= 6) {
		return {
			pattern: "auto",
			containerClass: "grid-cols-2 auto-rows-fr lg:grid-cols-3",
			getTileClass: () => TILE_FILL,
		};
	}

	if (tileCount <= 9) {
		return {
			pattern: "auto",
			containerClass: "grid-cols-2 auto-rows-fr md:grid-cols-3",
			getTileClass: () => TILE_FILL,
		};
	}

	return {
		pattern: "auto",
		containerClass: "grid-cols-2 auto-rows-fr md:grid-cols-3 lg:grid-cols-4",
		getTileClass: () => TILE_FILL,
	};
}

export function getVideoGridAriaLabel(tileCount: number, pattern: VideoGridLayoutPattern): string {
	return `Cuadrícula de video: ${tileCount} participante${tileCount === 1 ? "" : "s"}, disposición ${pattern}`;
}
