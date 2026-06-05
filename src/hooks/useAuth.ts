import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const isReady = useAuthStore((s) => s.isReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const phone = useAuthStore((s) => s.phone);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const logout = useAuthStore((s) => s.logout);
  const refreshSession = useAuthStore((s) => s.refreshSession);

  return {
    isReady,
    isAuthenticated,
    user,
    phone,
    sendOtp,
    verifyOtp,
    logout,
    refreshSession,
  };
}
