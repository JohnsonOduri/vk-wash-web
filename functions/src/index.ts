import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import "./webhook";

if (!admin.apps.length) {
	admin.initializeApp();
}

const db = admin.firestore();
const ADMIN_EMAIL = "vk149763@gmail.com";

const requireAuth = (request: any) => {
	if (!request.auth) {
		throw new HttpsError("unauthenticated", "Authentication required");
	}
};

const requireAdmin = (request: any) => {
	requireAuth(request);
	const email = request.auth?.token?.email || "";
	if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
		throw new HttpsError("permission-denied", "Admin access required");
	}
};

const getRequestIp = (request: any): string | undefined => {
	try {
		const header = request.rawRequest?.headers?.["x-forwarded-for"] as string | undefined;
		if (header) return header.split(",")[0].trim();
		return request.rawRequest?.ip;
	} catch (err) {
		return undefined;
	}
};

const logActivity = async (payload: Record<string, any>) => {
	try {
		await db.collection("activityLogs").add({
			...payload,
			timestamp: admin.firestore.FieldValue.serverTimestamp(),
		});
	} catch (err) {
		console.error("activity log error", err);
	}
};

export const createSession = onCall(async (request) => {
	requireAuth(request);
	const { userAgent, platform, deviceName } = request.data || {};
	const sessionId = db.collection("sessions").doc().id;
	const now = Date.now();
	const expiresAt = admin.firestore.Timestamp.fromDate(new Date(now + 24 * 60 * 60 * 1000));
	const ip = getRequestIp(request);

	const sessionPayload = {
		sessionId,
		userId: request.auth?.uid,
		email: request.auth?.token?.email || null,
		deviceInfo: deviceName || userAgent || "Unknown device",
		browser: userAgent || null,
		os: platform || null,
		ip: ip || null,
		loginAt: admin.firestore.FieldValue.serverTimestamp(),
		lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
		expiresAt,
		revoked: false,
	};

	await db.collection("sessions").doc(sessionId).set(sessionPayload);

	await logActivity({
		actorEmail: request.auth?.token?.email || null,
		action: "session_created",
		targetSessionId: sessionId,
		metadata: {
			deviceInfo: sessionPayload.deviceInfo,
			ip: sessionPayload.ip,
		},
	});

	return {
		sessionId,
		expiresAt: expiresAt.toMillis(),
	};
});

export const updateSessionActivity = onCall(async (request) => {
	requireAuth(request);
	const { sessionId } = request.data || {};
	if (!sessionId) {
		throw new HttpsError("invalid-argument", "sessionId required");
	}

	const docRef = db.collection("sessions").doc(sessionId);
	const snapshot = await docRef.get();
	if (!snapshot.exists) {
		throw new HttpsError("not-found", "session not found");
	}
	const data = snapshot.data() || {};
	if (data.userId !== request.auth?.uid) {
		throw new HttpsError("permission-denied", "session ownership mismatch");
	}

	const expiresAt = data.expiresAt?.toMillis ? data.expiresAt.toMillis() : null;
	if (data.revoked || (expiresAt && expiresAt < Date.now())) {
		return { revoked: !!data.revoked, expired: !!(expiresAt && expiresAt < Date.now()) };
	}

	await docRef.update({ lastActiveAt: admin.firestore.FieldValue.serverTimestamp() });
	return { revoked: false, expired: false };
});

export const closeSession = onCall(async (request) => {
	requireAuth(request);
	const { sessionId } = request.data || {};
	if (!sessionId) {
		throw new HttpsError("invalid-argument", "sessionId required");
	}

	const docRef = db.collection("sessions").doc(sessionId);
	const snapshot = await docRef.get();
	if (!snapshot.exists) return { ok: true };
	const data = snapshot.data() || {};
	if (data.userId !== request.auth?.uid) {
		throw new HttpsError("permission-denied", "session ownership mismatch");
	}

	await docRef.update({
		revoked: true,
		revokedAt: admin.firestore.FieldValue.serverTimestamp(),
	});

	await logActivity({
		actorEmail: request.auth?.token?.email || null,
		action: "session_closed",
		targetSessionId: sessionId,
	});

	return { ok: true };
});

export const listAdminSessions = onCall(async (request) => {
	requireAdmin(request);
	const snapshot = await db
		.collection("sessions")
		.where("email", "==", ADMIN_EMAIL)
		.orderBy("loginAt", "desc")
		.get();

	return snapshot.docs.map((doc) => {
		const data = doc.data();
		return {
			sessionId: data.sessionId || doc.id,
			userId: data.userId,
			email: data.email,
			deviceInfo: data.deviceInfo,
			browser: data.browser,
			os: data.os,
			ip: data.ip,
			loginAt: data.loginAt?.toMillis ? data.loginAt.toMillis() : null,
			lastActiveAt: data.lastActiveAt?.toMillis ? data.lastActiveAt.toMillis() : null,
			expiresAt: data.expiresAt?.toMillis ? data.expiresAt.toMillis() : null,
			revoked: data.revoked || false,
			revokedAt: data.revokedAt?.toMillis ? data.revokedAt.toMillis() : null,
		};
	});
});

export const revokeSession = onCall(async (request) => {
	requireAdmin(request);
	const { sessionId } = request.data || {};
	if (!sessionId) {
		throw new HttpsError("invalid-argument", "sessionId required");
	}

	await db.collection("sessions").doc(sessionId).update({
		revoked: true,
		revokedAt: admin.firestore.FieldValue.serverTimestamp(),
		revokedBy: request.auth?.uid,
	});

	await logActivity({
		actorEmail: request.auth?.token?.email || null,
		action: "session_revoked",
		targetSessionId: sessionId,
	});

	return { ok: true };
});

export const revokeAllAdminSessions = onCall(async (request) => {
	requireAdmin(request);
	const { includeCurrent, currentSessionId } = request.data || {};

	const snapshot = await db
		.collection("sessions")
		.where("email", "==", ADMIN_EMAIL)
		.get();

	const batch = db.batch();
	snapshot.docs.forEach((doc) => {
		if (!includeCurrent && currentSessionId && doc.id === currentSessionId) return;
		batch.update(doc.ref, {
			revoked: true,
			revokedAt: admin.firestore.FieldValue.serverTimestamp(),
			revokedBy: request.auth?.uid,
		});
	});

	await batch.commit();

	if (includeCurrent) {
		await admin.auth().revokeRefreshTokens(request.auth?.uid);
	}

	await logActivity({
		actorEmail: request.auth?.token?.email || null,
		action: includeCurrent ? "sessions_revoked_all" : "sessions_revoked_others",
		metadata: {
			includeCurrent: !!includeCurrent,
		},
	});

	return { ok: true };
});

export const setUserPassword = onCall(async (request) => {
	requireAdmin(request);
	const { email, newPassword } = request.data || {};
	if (!email || typeof email !== "string") {
		throw new HttpsError("invalid-argument", "email required");
	}
	if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
		throw new HttpsError("invalid-argument", "newPassword must be at least 8 characters");
	}

	const userRecord = await admin.auth().getUserByEmail(email);
	await admin.auth().updateUser(userRecord.uid, { password: newPassword });

	await logActivity({
		actorEmail: request.auth?.token?.email || null,
		action: "password_changed_admin",
		metadata: { targetEmail: email },
	});

	return { ok: true };
});
