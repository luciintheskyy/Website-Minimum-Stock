import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

export async function postActivityLog({ user_id, activity, timestamp = null }) {
  if (!user_id) {
    try {
      const meRes = await axios.get(`${API_BASE_URL}/api/me`);
      user_id = meRes.data?.user?.id || user_id;
      if (user_id) {
        try { localStorage.setItem("current_user_id", String(user_id)); } catch (_) {}
      }
    } catch (e) {
      // ignore; will attempt send without user_id (backend validation will fail)
    }
  }

  const payload = { user_id, activity, timestamp };
  return axios.post(`${API_BASE_URL}/api/activity-logs`, payload);
}

export async function getActivityLogs({ user_id, per_page = 15, page = 1 }) {
  const params = {};
  if (user_id) params.user_id = user_id;
  params.per_page = per_page;
  params.page = page;
  const res = await axios.get(`${API_BASE_URL}/api/activity-logs`, { params });
  return res.data || { data: [], meta: { current_page: page, per_page, total: 0 } };
}