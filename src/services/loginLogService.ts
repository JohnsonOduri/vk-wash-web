import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface LoginLog {
  id?: string;
  email?: string;
  userId?: string;
  deviceInfo?: string;
  loggedAt?: Date;
}

export const recordLogin = async (payload: {
  email?: string | null;
  userId?: string | null;
  deviceInfo?: string;
}) => {
  await addDoc(collection(db, "loginLogs"), {
    email: payload.email || null,
    userId: payload.userId || null,
    deviceInfo: payload.deviceInfo || null,
    loggedAt: serverTimestamp(),
  });
};

export const getLoginLogsLastDays = async (days: number): Promise<LoginLog[]> => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const q = query(
    collection(db, "loginLogs"),
    where("loggedAt", ">=", since),
    orderBy("loggedAt", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      email: data.email || undefined,
      userId: data.userId || undefined,
      deviceInfo: data.deviceInfo || undefined,
      loggedAt: data.loggedAt?.toDate ? data.loggedAt.toDate() : undefined,
    } as LoginLog;
  });
};
