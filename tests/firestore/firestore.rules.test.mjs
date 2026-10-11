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
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const projectId = "demo-homigo-care-rules";
const rulesPath = new URL("../../firebase/firestore.rules", import.meta.url);
let testEnvironment;
const patientPhone = "+923495031007";
const testAddress = "House 10, Street 2, Lahore";

before(async () => {
  const rules = await readFile(rulesPath, "utf8");
  testEnvironment = await initializeTestEnvironment({ projectId, firestore: { rules } });
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
        phoneNumber: patientPhone,
        createdAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-01-01T00:00:00Z"),
      });
    }
  });
});

function userDb(uid, { verified = true, whatsappVerified = true, admin = false, phone = patientPhone, accountRole = "patient" } = {}) {
  const claims = {
    email: `${uid}@example.test`,
    email_verified: verified,
    whatsapp_verified: whatsappVerified,
    whatsapp_number: phone,
    account_role: accountRole,
    ...(admin ? { admin: true } : {}),
  };
  return testEnvironment.authenticatedContext(uid, claims).firestore();
}

function profileDraft(uid, overrides = {}) {
  return {
    uid,
    email: `${uid}@example.test`,
    displayName: "New Test User",
    role: "patient",
    phoneNumber: patientPhone,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

function professionalDraft(uid, overrides = {}) {
  return {
    uid,
    displayName: "Synthetic Test Professional",
    professionalType: "doctor",
    specialty: "Family medicine",
    qualification: "MBBS",
    experienceYears: 5,
    city: "Lahore",
    availability: "Weekdays, 9am–5pm",
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

async function seedProfessional(uid, status = "approved", professionalType = "doctor") {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "profiles", uid), {
      uid,
      email: `${uid}@example.test`,
      displayName: "Synthetic Test Professional",
      role: "professional",
      phoneNumber: patientPhone,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });
    await setDoc(doc(db, "professional_profiles", uid), {
      uid,
      displayName: "Synthetic Test Professional",
      professionalType,
      specialty: professionalType === "doctor" ? "Family medicine" : "Home nursing",
      qualification: professionalType === "doctor" ? "MBBS" : "RN",
      experienceYears: 5,
      city: "Lahore",
      availability: "Weekdays, 9am–5pm",
      status,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });
  });
}

async function seedBooking(bookingId, professionalUid = "professional-approved", status = "requested") {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "bookings", bookingId), {
      patientUid: "patient-a",
      professionalUid,
      serviceType: "doctor_visit",
      scheduledAt: Timestamp.fromDate(new Date("2030-01-01T10:00:00Z")),
      address: testAddress,
      status,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });
  });
}

test("WhatsApp-verified user can create and read only their minimal patient profile", async () => {
  const db = userDb("patient-new");
  const reference = doc(db, "profiles", "patient-new");
  await assertSucceeds(setDoc(reference, profileDraft("patient-new")));
  const profile = await assertSucceeds(getDoc(reference));
  assert.equal(profile.data()?.role, "patient");
  assert.equal(profile.data()?.phoneNumber, patientPhone);
});

test("unverified email, unverified WhatsApp, and mismatched phone claims cannot create profiles", async () => {
  await assertFails(setDoc(doc(userDb("patient-email-unverified", { verified: false }), "profiles", "patient-email-unverified"), profileDraft("patient-email-unverified")));
  await assertFails(setDoc(doc(userDb("patient-wa-unverified", { whatsappVerified: false }), "profiles", "patient-wa-unverified"), profileDraft("patient-wa-unverified")));
  await assertFails(setDoc(doc(userDb("patient-phone-mismatch", { phone: "+923001112233" }), "profiles", "patient-phone-mismatch"), profileDraft("patient-phone-mismatch")));
  await assertFails(setDoc(doc(userDb("patient-invalid-phone", { phone: "+923001112233" }), "profiles", "patient-invalid-phone"), profileDraft("patient-invalid-phone", { phoneNumber: "+923495031007" })));
});

test("unauthenticated users and patients cannot list profile records", async () => {
  const unauthenticatedDb = testEnvironment.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(unauthenticatedDb, "profiles", "patient-a")));
  await assertFails(getDocs(query(collection(unauthenticatedDb, "profiles"), limit(100))));
  await assertFails(getDocs(query(collection(userDb("patient-a"), "profiles"), limit(100))));
});

test("clients cannot self-assign Admin or add sensitive/unapproved profile fields", async () => {
  const db = userDb("patient-new");
  await assertFails(setDoc(doc(db, "profiles", "patient-new"), profileDraft("patient-new", { role: "admin" })));
  await assertFails(setDoc(doc(db, "profiles", "patient-new"), profileDraft("patient-new", { medicalNotes: "synthetic emulator-only value" })));
});

test("profile owner may update display name only and may never delete", async () => {
  const db = userDb("patient-a");
  const reference = doc(db, "profiles", "patient-a");
  await assertSucceeds(updateDoc(reference, { displayName: "Updated Test Name", updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(reference, { role: "admin", updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(reference, { phoneNumber: "+923001112233", updatedAt: serverTimestamp() }));
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

test("unverified Admin claim cannot read or list profiles", async () => {
  const db = userDb("admin-unverified", { verified: false, admin: true });
  await assertFails(getDoc(doc(db, "profiles", "patient-a")));
  await assertFails(getDocs(query(collection(db, "profiles"), limit(100))));
});

test("professional registration creates a pending profile and cannot self-approve", async () => {
  const db = userDb("professional-new", { accountRole: "professional" });
  await assertSucceeds(setDoc(doc(db, "profiles", "professional-new"), profileDraft("professional-new", { role: "professional" })));
  const profile = doc(db, "professional_profiles", "professional-new");
  await assertSucceeds(setDoc(profile, professionalDraft("professional-new")));
  await assertFails(updateDoc(profile, { status: "approved", updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(profile, { licenseNumber: "private-test-value", updatedAt: serverTimestamp() }));
});

test("profile role cannot differ from the server-issued account_role claim", async () => {
  const patient = userDb("role-mismatch-patient", { accountRole: "patient" });
  await assertFails(setDoc(doc(patient, "profiles", "role-mismatch-patient"), profileDraft("role-mismatch-patient", { role: "professional" })));
  const professional = userDb("role-mismatch-professional", { accountRole: "professional" });
  await assertFails(setDoc(doc(professional, "profiles", "role-mismatch-professional"), profileDraft("role-mismatch-professional", { role: "patient" })));
  await assertSucceeds(setDoc(doc(professional, "profiles", "role-mismatch-professional"), profileDraft("role-mismatch-professional", { role: "professional" })));
});

test("patients can discover only approved professionals; Admin can review pending professionals", async () => {
  await seedProfessional("professional-approved", "approved");
  await seedProfessional("professional-pending", "pending");
  const patient = userDb("patient-a");
  const approvedQuery = query(collection(patient, "professional_profiles"), where("status", "==", "approved"), limit(50));
  const results = await assertSucceeds(getDocs(approvedQuery));
  assert.equal(results.size, 1);
  assert.equal(results.docs[0].id, "professional-approved");
  await assertFails(getDocs(query(collection(patient, "professional_profiles"), limit(50))));
  const admin = userDb("admin-test", { admin: true });
  const reviewQueue = await assertSucceeds(getDocs(query(collection(admin, "professional_profiles"), limit(100))));
  assert.equal(reviewQueue.size, 2);
});

test("Admin can approve a professional but cannot rewrite identity or qualification data", async () => {
  await seedProfessional("professional-pending", "pending");
  const admin = userDb("admin-test", { admin: true });
  const profile = doc(admin, "professional_profiles", "professional-pending");
  await assertSucceeds(updateDoc(profile, { status: "approved", updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(profile, { status: "approved", qualification: "Changed", updatedAt: serverTimestamp() }));
});

test("patient can create a booking only for an approved matching professional", async () => {
  await seedProfessional("professional-approved", "approved", "doctor");
  await seedProfessional("professional-pending", "pending", "doctor");
  const db = userDb("patient-a");
  const scheduledAt = Timestamp.fromDate(new Date(Date.now() + 86_400_000));
  const draft = (professionalUid) => ({
    patientUid: "patient-a",
    professionalUid,
    serviceType: "doctor_visit",
    scheduledAt,
    address: testAddress,
    status: "requested",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await assertSucceeds(setDoc(doc(db, "bookings", "booking-approved"), draft("professional-approved")));
  await assertFails(setDoc(doc(db, "bookings", "booking-pending"), draft("professional-pending")));
  await assertFails(setDoc(doc(db, "bookings", "booking-wrong-service"), { ...draft("professional-approved"), serviceType: "nurse_visit" }));
  await assertFails(setDoc(doc(db, "bookings", "booking-sensitive"), { ...draft("professional-approved"), medicalHistory: "private data" }));
});

test("patient, assigned approved professional and bounded Admin read the same booking", async () => {
  await seedProfessional("professional-approved", "approved");
  await seedBooking("booking-shared");
  await assertSucceeds(getDoc(doc(userDb("patient-a"), "bookings", "booking-shared")));
  await assertFails(getDoc(doc(userDb("patient-b"), "bookings", "booking-shared")));
  await assertSucceeds(getDoc(doc(userDb("professional-approved"), "bookings", "booking-shared")));
  await assertSucceeds(getDoc(doc(userDb("admin-test", { admin: true }), "bookings", "booking-shared")));
  await assertFails(getDocs(collection(userDb("admin-test", { admin: true }), "bookings")));
});

test("patient may cancel own request; assigned approved professional may accept then complete", async () => {
  await seedProfessional("professional-approved", "approved");
  await seedBooking("booking-cancel");
  await seedBooking("booking-provider-action");
  const patientBooking = doc(userDb("patient-a"), "bookings", "booking-cancel");
  await assertSucceeds(updateDoc(patientBooking, { status: "cancelled", updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(patientBooking, { status: "completed", updatedAt: serverTimestamp() }));
  const professionalBooking = doc(userDb("professional-approved"), "bookings", "booking-provider-action");
  await assertSucceeds(updateDoc(professionalBooking, { status: "accepted", updatedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(professionalBooking, { status: "completed", updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(professionalBooking, { status: "requested", updatedAt: serverTimestamp() }));
});

test("pending professional cannot read or act on bookings", async () => {
  await seedProfessional("professional-pending", "pending");
  await seedBooking("booking-private", "professional-pending");
  const db = userDb("professional-pending");
  await assertFails(getDoc(doc(db, "bookings", "booking-private")));
  await assertFails(updateDoc(doc(db, "bookings", "booking-private"), { status: "accepted", updatedAt: serverTimestamp() }));
});

test("all unrelated health, payments and server-only collections remain default-deny", async () => {
  const admin = userDb("admin-test", { admin: true });
  for (const collectionName of ["bookings_live", "chat_threads", "patient_health_records", "health_passports", "payments", "system_settings", "otp_attempts", "whatsapp_proofs"]) {
    await assertFails(getDocs(collection(admin, collectionName)));
    await assertFails(setDoc(doc(admin, collectionName, "synthetic-emulator-only"), { value: true }));
  }
});
