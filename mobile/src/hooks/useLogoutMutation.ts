import { useMutation } from "@tanstack/react-query";

import { useAuthenticationContext } from "@/src/contexts/authenticationContext";
import { signOut } from "@/src/lib/utils/authentication";

// Profile logout goes through `signOut` so teardown stays on the unified
// Session end path (best-effort revoke → endSession with reason 'user').
export const useLogoutMutation = () => {
  const { dispatch } = useAuthenticationContext();

  return useMutation({
    mutationFn: () => signOut(dispatch),
  });
};
