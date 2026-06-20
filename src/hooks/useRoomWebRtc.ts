import { useEffect } from "react";
import { getActiveRoomSocket } from "../lib/roomSessionSocketRef";
import { setActivePeerManager } from "../lib/roomWebRtcRef";
import { WebRtcPeerManager } from "../services/webrtcPeerManager";
import { useRoomStore } from "../stores/useRoomStore";

/**
 * Boots WebRTC peer connections once local media is available and tears them
 * down on leave. Signaling is routed through the active room socket.
 */
export function useRoomWebRtc(roomId: string | undefined, enabled: boolean) {
	const localStream = useRoomStore((state) => state.localStream);
	const currentUserId = useRoomStore((state) => state.currentUserId);

	useEffect(() => {
		if (!enabled || !roomId || !localStream) return;

		const socket = getActiveRoomSocket();
		if (!socket) return;

		const manager = new WebRtcPeerManager({
			currentUserId,
			signaling: {
				sendOffer: (targetUid, sdp) => socket.sendWebRtcOffer(targetUid, sdp),
				sendAnswer: (targetUid, sdp) => socket.sendWebRtcAnswer(targetUid, sdp),
				sendIceCandidate: (targetUid, candidate) =>
					socket.sendWebRtcIceCandidate(targetUid, candidate),
			},
		});

		manager.setLocalStream(localStream);
		setActivePeerManager(manager);

		const { participants } = useRoomStore.getState();
		manager.connectToExistingParticipants(participants);

		return () => {
			setActivePeerManager(null);
			manager.destroy();
		};
	}, [enabled, roomId, localStream, currentUserId]);
}
