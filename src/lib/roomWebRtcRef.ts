import type { WebRtcPeerManager } from "../services/webrtcPeerManager";

let activePeerManager: WebRtcPeerManager | null = null;

export function setActivePeerManager(manager: WebRtcPeerManager | null): void {
	activePeerManager = manager;
}

export function getActivePeerManager(): WebRtcPeerManager | null {
	return activePeerManager;
}
