import { colorForIndex } from "./participantAvatarColors";

interface ParticipantAvatarProps {
	initials: string;
	index: number;
}

export default function ParticipantAvatar({ initials, index }: ParticipantAvatarProps) {
	return (
		<div
			className={[
				"flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white",
				colorForIndex(index),
			].join(" ")}
		>
			{initials}
		</div>
	);
}
