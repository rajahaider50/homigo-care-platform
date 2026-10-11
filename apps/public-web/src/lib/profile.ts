import { getIdTokenResult, reload, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { requireFirebase } from "../firebase";

export async function ensureVerifiedPatientProfile(user: User): Promise<string> {
  const { db } = requireFirebase();
  await reload(user);
  const token = await getIdTokenResult(user, true);

  const email = user.email?.trim() ?? "";
  const displayName = user.displayName?.trim() ?? "";
  const phoneNumber = token.claims.whatsapp_number;
  if (!user.emailVerified || token.claims.whatsapp_verified !== true || typeof phoneNumber !== "string" || !/^\+923\d{9}$/.test(phoneNumber) || !email || displayName.length < 2 || displayName.length > 80) {
    throw new Error("Verify your email and WhatsApp number before opening a patient profile.");
  }

  const profileRef = doc(db, "profiles", user.uid);
  const snapshot = await getDoc(profileRef);
  if (snapshot.exists()) {
    const profile = snapshot.data();
    if (profile.uid !== user.uid || profile.email !== email || profile.role !== "patient" || profile.phoneNumber !== phoneNumber) {
      throw new Error("This account profile is not available to this user.");
    }
    return typeof profile.displayName === "string" && profile.displayName.trim()
      ? profile.displayName
      : displayName;
  }

  await setDoc(profileRef, {
    uid: user.uid,
    email,
    displayName,
    role: "patient",
    phoneNumber,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return displayName;
}
