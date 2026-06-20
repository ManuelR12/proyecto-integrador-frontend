/**
 * Runs synchronously inside a user-gesture handler (click) so Chrome
 * grants media playback / getUserMedia for the rest of the session.
 */
export function unlockMediaPlayback(): void {
	const AudioContextClass =
		window.AudioContext ??
		(window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

	if (AudioContextClass) {
		const ctx = new AudioContextClass();
		void ctx.resume();
	}

	const audio = document.createElement("audio");
	audio.muted = true;
	audio.src =
		"data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
	void audio.play().catch(() => {});
}
