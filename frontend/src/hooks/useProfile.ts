import { useMutation } from "@tanstack/react-query";
import { updateProfile, type UpdateProfileInput } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (user) => setUser(user),
  });
}
