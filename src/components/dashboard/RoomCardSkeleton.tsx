interface RoomCardSkeletonProps {
	count?: number;
}

export function RoomCardSkeleton({ count = 4 }: RoomCardSkeletonProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
			{Array.from({ length: count }, (_, index) => (
				<div
					key={index}
					className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
				>
					<div className="flex items-start justify-between gap-3">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-xl bg-slate-200" />
							<div className="space-y-2">
								<div className="h-4 w-40 rounded bg-slate-200" />
								<div className="h-3 w-28 rounded bg-slate-100" />
							</div>
						</div>
						<div className="h-5 w-16 rounded-full bg-slate-100" />
					</div>
					<div className="mt-5 flex items-center gap-2">
						<div className="flex -space-x-2">
							{[0, 1, 2].map((avatarIndex) => (
								<div
									key={avatarIndex}
									className="h-7 w-7 rounded-full border-2 border-white bg-slate-200"
								/>
							))}
						</div>
						<div className="h-3 w-24 rounded bg-slate-100" />
					</div>
					<div className="mt-5 flex gap-3">
						<div className="h-9 flex-1 rounded-lg bg-slate-200" />
						<div className="h-9 w-28 rounded-lg bg-slate-100" />
					</div>
				</div>
			))}
		</div>
	);
}
