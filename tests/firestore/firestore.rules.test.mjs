import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, beforeEach, test } from "node:test";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const projectId = "demo-homigo-care-rules";
const rulesPath = new URL("../../firebase/firestore.rules", import.meta.url);
let testEnvironment;

before(async () => {
  const rules = await readFile(rulesPath, "utf8");
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: { rules },
  });
});

after(async () => {
  await testEnvironment?.cleanup();
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    for (const uid of ["patient-a", "patient-b"]) {
      await setDoc(doc(db, "profiles", uid), {
        uid,
        email: `${uid}@example.test`,
        displayName: "Synthetic Test User",
        role: "patient",
        createdAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-01-01T00:00:00Z"),
      });
    }
  });
});

function userDb(uid, { verified = true, admin = false } = {}) {
  const claims = {
    email: `${uid}@example.test`,
    email_verified: verified,
    ...(admin ? { admin: true } : {}),
  };
  return testEnvironment.authenticatedContext(uid, claims).firestore();
}

function profileDraft(uid, overrides = {}) {
  return {
    uid,
    email: `${uid}@example.test`,
    displayName: "New Test Patient",
    role: "patient",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

test("verified patient can create and read only their own minimal profile", async () => {
  const db = userDb("patient-new");
  const reference = doc(db, "profiles", "patient-new");
  await assertSucceeds(setDoc(reference, profileDraft("patient-new")));
  const profile = await assertSucceeds(getDoc(reference));
  assert.equal(profile.data()?.role, "patient");
});

test("unverified users cannot create profiles and another patient cannot read them", async () => {
  const unverifiedDb = userDb("patient-unverified", { verified: false });
  await assertFails(setDoc(
    doc(unverifiedDb, "profiles", "patient-unverified"),
    profileDraft("patient-unverified"),
  ));

  const otherPatientDb = userDb("patient-b");
  await assertFails(getDoc(doc(otherPatientDb, "profiles", "patient-a")));
});

test("unauthenticated users and patients cannot list profile records", async () => {
  const unauthenticatedDb = testEnvironment.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(unauthenticatedDb, "profiles", "patient-a")));
  await assertFails(getDocs(query(collection(unauthenticatedDb, "profiles"), limit(100))));

  const patientDb = userDb("patient-a");
  await assertFails(getDocs(query(collection(patientDb, "profiles"), limit(100))));
});

test("clients cannot self-assign a privileged role or add sensitive/unapproved fields", async () => {
  const db = userDb("patient-new");
  await assertFails(setDoc(
    doc(db, "profiles", "patient-new"),
    profileDraft("patient-new", { role: "admin" }),
  ));
  await assertFails(setDoc(
    doc(db, "profiles", "patient-new"),
    profileDraft("patient-new", { medicalNotes: "synthetic emulator-only value" }),
  ));
});

test("owner may update display name only and may never delete the profile", async () => {
  const db = userDb("patient-a");
  const reference = doc(db, "profiles", "patient-a");
  await assertSucceeds(updateDoc(reference, {
    displayName: "Updated Test Name",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(reference, {
    role: "admin",
    updatedAt: serverTimestamp(),
  }));
  await assertFails(deleteDoc(reference));
});

test("verified Admin claim allows only bounded profile reads and aggregate counts", async () => {
  const db = userDb("admin-test", { admin: true });
  await assertSucceeds(getDoc(doc(db, "profiles", "patient-a")));
  const bounded = query(collection(db, "profiles"), limit(100));
  const page = await assertSucceeds(getDocs(bounded));
  assert.equal(page.size, 2);
  const count = await assertSucceeds(getCountFromServer(bounded));
  assert.equal(count.data().count, 2);

  await assertFails(getDocs(collection(db, "profiles")));
  await assertFails(getDocs(query(collection(db, "profiles"), limit(101))));
});

test("an unverified Admin claim cannot read or list profiles", async () => {
  const db = userDb("admin-unverified", { verified: false, admin: true });
  await assertFails(getDoc(doc(db, "profiles", "patient-a")));
  await assertFails(getDocs(query(collection(db, "profiles"), limit(100))));
});

test("all non-profile collections remain default-deny, including for Admin", async () => {
  const db = userDb("admin-test", { admin: true });
  await assertFails(getDocs(collection(db, "bookings_live")));
  await assertFails(getDoc(doc(db, "chat_threads", "synthetic-thread")));
  for (const collectionName of ["patient_health_records", "health_passports", "payments"]) {
    await assertFails(getDocs(collection(db, collectionName)));
    await assertFails(setDoc(doc(db, collectionName, "synthetic-emulator-only"), { value: true }));
  }
});
