import { WEBRTC_ICE_SERVERS } from "../lib/webrtcConfig";
import { useRoomStore } from "../stores/useRoomStore";
import type { SocketParticipant } from "../types/room";

export interface WebRtcSignalingAdapter {
	sendOffer: (targetUid: string, sdp: RTCSessionDescriptionInit) => void;
	sendAnswer: (targetUid: string, sdp: RTCSessionDescriptionInit) => void;
	sendIceCandidate: (targetUid: string, candidate: RTCIceCandidateInit) => void;
}

interface WebRtcPeerManagerOptions {
	currentUserId: string;
	signaling: WebRtcSignalingAdapter;
}

/**
 * Manages one RTCPeerConnection per remote participant in a mesh topology.
 * Newcomers initiate offers to existing peers; existing peers only answer.
 */
export class WebRtcPeerManager {
	private readonly currentUserId: string;
	private readonly signaling: WebRtcSignalingAdapter;
	private readonly peers = new Map<string, RTCPeerConnection>();
	private readonly pendingIceCandidates = new Map<string, RTCIceCandidateInit[]>();
	private localStream: MediaStream | null = null;
	private destroyed = false;

	constructor(options: WebRtcPeerManagerOptions) {
		this.currentUserId = options.currentUserId;
		this.signaling = options.signaling;
	}

	setLocalStream(stream: MediaStream | null): void {
		this.localStream = stream;
		if (!stream) return;

		for (const peer of this.peers.values()) {
			this.syncLocalTracks(peer, stream);
		}
	}

	/** Called after room_joined: newcomer offers to every peer already in the room. */
	connectToExistingParticipants(participants: SocketParticipant[]): void {
		for (const participant of participants) {
			if (participant.uid === this.currentUserId) continue;
			this.createPeerConnection(participant.uid, { initiator: true });
		}
	}

	async handleIncomingOffer(fromUid: string, sdp: RTCSessionDescriptionInit): Promise<void> {
		if (this.destroyed || fromUid === this.currentUserId) return;

		let peer = this.peers.get(fromUid);
		if (!peer) {
			peer = this.createPeerConnection(fromUid, { initiator: false });
		}

		try {
			await peer.setRemoteDescription(sdp);
			await this.flushPendingIceCandidates(fromUid, peer);
			const answer = await peer.createAnswer();
			await peer.setLocalDescription(answer);
			this.signaling.sendAnswer(fromUid, answer);
		} catch (error) {
			console.error("[WebRTC] failed to handle offer from", fromUid, error);
			this.removePeer(fromUid);
		}
	}

	async handleIncomingAnswer(fromUid: string, sdp: RTCSessionDescriptionInit): Promise<void> {
		const peer = this.peers.get(fromUid);
		if (!peer || this.destroyed) return;

		try {
			await peer.setRemoteDescription(sdp);
			await this.flushPendingIceCandidates(fromUid, peer);
		} catch (error) {
			console.error("[WebRTC] failed to handle answer from", fromUid, error);
			this.removePeer(fromUid);
		}
	}

	async handleIncomingIceCandidate(fromUid: string, candidate: RTCIceCandidateInit): Promise<void> {
		if (this.destroyed || fromUid === this.currentUserId) return;

		const peer = this.peers.get(fromUid);
		if (!peer || !peer.remoteDescription) {
			const queue = this.pendingIceCandidates.get(fromUid) ?? [];
			queue.push(candidate);
			this.pendingIceCandidates.set(fromUid, queue);
			return;
		}

		try {
			await peer.addIceCandidate(candidate);
		} catch (error) {
			console.error("[WebRTC] failed to add ICE candidate from", fromUid, error);
		}
	}

	removePeer(remoteUid: string): void {
		const peer = this.peers.get(remoteUid);
		if (!peer) return;

		peer.close();
		this.peers.delete(remoteUid);
		this.pendingIceCandidates.delete(remoteUid);
		useRoomStore.getState().removeRemoteStream(remoteUid);
	}

	destroy(): void {
		this.destroyed = true;
		for (const remoteUid of this.peers.keys()) {
			this.removePeer(remoteUid);
		}
		this.pendingIceCandidates.clear();
		this.localStream = null;
	}

	private createPeerConnection(
		remoteUid: string,
		options: { initiator: boolean },
	): RTCPeerConnection {
		const existing = this.peers.get(remoteUid);
		if (existing) return existing;

		const peer = new RTCPeerConnection(WEBRTC_ICE_SERVERS);

		if (this.localStream) {
			this.syncLocalTracks(peer, this.localStream);
		}

		peer.ontrack = (event) => {
			const stream = event.streams[0] ?? new MediaStream([event.track]);
			useRoomStore.getState().registerRemoteStream(remoteUid, stream);
		};

		peer.onicecandidate = (event) => {
			if (!event.candidate) return;
			this.signaling.sendIceCandidate(remoteUid, event.candidate.toJSON());
		};

		peer.onconnectionstatechange = () => {
			if (peer.connectionState === "failed" || peer.connectionState === "closed") {
				this.removePeer(remoteUid);
			}
		};

		this.peers.set(remoteUid, peer);

		if (options.initiator) {
			void this.createAndSendOffer(remoteUid, peer);
		}

		return peer;
	}

	private async createAndSendOffer(remoteUid: string, peer: RTCPeerConnection): Promise<void> {
		try {
			const offer = await peer.createOffer();
			await peer.setLocalDescription(offer);
			this.signaling.sendOffer(remoteUid, offer);
		} catch (error) {
			console.error("[WebRTC] failed to create offer for", remoteUid, error);
			this.removePeer(remoteUid);
		}
	}

	private async flushPendingIceCandidates(
		fromUid: string,
		peer: RTCPeerConnection,
	): Promise<void> {
		const queue = this.pendingIceCandidates.get(fromUid);
		if (!queue?.length) return;

		this.pendingIceCandidates.delete(fromUid);
		for (const candidate of queue) {
			try {
				await peer.addIceCandidate(candidate);
			} catch (error) {
				console.error("[WebRTC] failed to flush ICE candidate from", fromUid, error);
			}
		}
	}

	private syncLocalTracks(peer: RTCPeerConnection, stream: MediaStream): void {
		for (const track of stream.getTracks()) {
			const sender = peer.getSenders().find((entry) => entry.track?.kind === track.kind);
			if (sender) {
				void sender.replaceTrack(track);
			} else {
				peer.addTrack(track, stream);
			}
		}
	}
}
