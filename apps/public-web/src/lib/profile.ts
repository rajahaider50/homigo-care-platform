import { getIdToken, reload, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { requireFirebase } from "../firebase";

export async function ensureVerifiedPatientProfile(user: User): Promise<string> {
  const { db } = requireFirebase();
  await reload(user);
  await getIdToken(user, true);

  const email = user.email?.trim() ?? "";
  const displayName = user.displayName?.trim() ?? "";
  if (!user.emailVerified || !email || displayName.length < 2 || displayName.length > 80) {
    throw new Error("A verified account with a valid name and email is required.");
  }

  const profileRef = doc(db, "profiles", user.uid);
  const snapshot = await getDoc(profileRef);
  if (snapshot.exists()) {
    const profile = snapshot.data();
    if (profile.uid !== user.uid || profile.email !== email || profile.role !== "patient") {
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return displayName;
}
