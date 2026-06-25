export type VideoGridLayoutPattern = "1x1" | "1x2" | "2x2" | "2x1" | "auto" | "screenShare";

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
			pattern: "2x1",
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

const SIDE_ROW_SPAN: Record<number, string> = {
	1: "row-span-1",
	2: "row-span-2",
	3: "row-span-3",
	4: "row-span-4",
	5: "row-span-5",
	6: "row-span-6",
};

const SIDE_GRID_ROWS: Record<number, string> = {
	1: "grid-rows-1",
	2: "grid-rows-2",
	3: "grid-rows-3",
	4: "grid-rows-4",
	5: "grid-rows-5",
	6: "grid-rows-6",
};

/**
 * Asymmetric layout for screen share: featured tile spans ~75% width; others stack in a side column.
 */
export function getScreenShareGridLayout(
	tileCount: number,
	featuredIndex: number,
): VideoGridLayout {
	const sideCount = Math.max(tileCount - 1, 1);
	const rowSpan = SIDE_ROW_SPAN[Math.min(sideCount, 6)] ?? "row-span-6";
	const gridRows = SIDE_GRID_ROWS[Math.min(sideCount, 6)] ?? "grid-rows-6";

	return {
		pattern: "screenShare",
		containerClass: `grid-cols-4 ${gridRows}`,
		getTileClass: (index) =>
			index === featuredIndex
				? `${TILE_FILL} col-span-3 ${rowSpan}`
				: `${TILE_FILL} col-span-1 row-span-1`,
	};
}

export function getVideoGridAriaLabel(tileCount: number, pattern: VideoGridLayoutPattern): string {
	return `Cuadrícula de video: ${tileCount} participante${tileCount === 1 ? "" : "s"}, disposición ${pattern}`;
}
