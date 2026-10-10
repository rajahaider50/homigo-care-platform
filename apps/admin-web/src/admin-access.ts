export function hasVerifiedAdminClaim(emailVerified: boolean, claim: unknown): boolean {
  return emailVerified && claim === true;
}
