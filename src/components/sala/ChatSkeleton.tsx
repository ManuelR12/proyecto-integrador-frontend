const ChatSkeleton = () => (
	<div aria-busy="true" aria-live="polite" className="space-y-4">
		{["left", "right", "left", "right", "left"].map((align, index) => (
			<div
				key={`${align}-${index}`}
				className={align === "right" ? "flex justify-end" : "flex items-start gap-2"}
			>
				{align === "left" && <div className="h-7 w-7 animate-pulse rounded-full bg-slate-200" />}
				<div
					className={[
						"animate-pulse rounded-2xl bg-slate-200",
						align === "right" ? "h-10 w-40" : "h-14 w-52",
					].join(" ")}
				/>
			</div>
		))}
	</div>
);

export default ChatSkeleton;
