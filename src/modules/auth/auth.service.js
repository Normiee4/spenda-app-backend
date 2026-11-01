// Auth is verified by Supabase and the `requireAuth` middleware. The service
// only exposes the already-verified claims; it has no database dependency.
export function getMe({ auth }) {
  return {
    id: auth.sub,
    email: auth.email,
    role: auth.role ?? 'authenticated',
  };
}
