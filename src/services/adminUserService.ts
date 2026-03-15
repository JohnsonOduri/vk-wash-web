import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export const setUserPassword = async (payload: { email: string; newPassword: string }) => {
  const callable = httpsCallable(functions, "setUserPassword");
  await callable(payload);
};
