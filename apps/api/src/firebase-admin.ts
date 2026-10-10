import { cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";

const EXPECTED_PROJECT_ID = "homigo-care-dev-20261010";

export type AdminServices = { auth: ReturnType<typeof getAuth>; db: Firestore };

/** Never initialize with ambient credentials or a project other than the user-selected dev project. */
export function getAdminServices(env: NodeJS.ProcessEnv = process.env): AdminServices | null {
  const raw = env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { project_id?: string; client_email?: string; private_key?: string };
    if (parsed.project_id !== EXPECTED_PROJECT_ID || !parsed.client_email || !parsed.private_key) return null;
    const serviceAccount: ServiceAccount = {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    };
    const app = getApps().find((candidate) => candidate.name === "homigo-care-dev-api")
      ?? initializeApp({ credential: cert(serviceAccount), projectId: EXPECTED_PROJECT_ID }, "homigo-care-dev-api");
    return { auth: getAuth(app), db: getFirestore(app) };
  } catch {
    return null;
  }
}

export { FieldValue, Timestamp };
