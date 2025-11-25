import { useCallback } from "react";
import { postActivityLog } from "../api/activityLogs";

// Hook sederhana untuk mencatat aktivitas user
// Mengambil `user_id` dari localStorage (diset saat login / fetch /api/me)
export function useActivityLogger() {
  const logActivity = useCallback(async (activity, timestamp = new Date().toISOString(), userIdOverride) => {
    try {
      const userId = userIdOverride ?? parseInt(localStorage.getItem("user_id"), 10);
      if (!userId) return null;
      return await postActivityLog({ user_id: userId, activity, timestamp });
    } catch (e) {
      console.error("Gagal mencatat Activity Log", e);
      return null;
    }
  }, []);

  return { logActivity };
}