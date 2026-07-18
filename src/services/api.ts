const API_BASE = import.meta.env.DEV ? "http://localhost:8000/api" : "/api";

export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url: string;
  eco_points: number;
}

export interface Achievement {
  badge_name: string;
  description: string;
  earned_at: string;
}

export interface DeviceSubmission {
  id: number;
  device_name: string;
  category: string;
  confidence: number;
  hazard_level: string;
  estimated_life_months: number;
  market_val: number;
  recycling_val: number;
  repair_val: number;
  scrap_val: number;
  pricing?: {
    market_val: number;
    recycling_val: number;
    repair_val: number;
    scrap_val: number;
  };
  ai_explanation: string;
  image_url: string;
  submitted_at: string;
}

export interface Recycler {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  pickup_available: boolean;
  rating: number;
  contact_phone: string;
  working_hours: string;
  accepted_categories: string[];
}

export interface PickupSchedule {
  id: number;
  recycler_name: string;
  recycler_address: string;
  pickup_date: string;
  pickup_time: string;
  address: string;
  contact_phone: string;
  status: string;
  driver_name: string | null;
  driver_phone: string | null;
  created_at: string;
}

export interface DashboardStats {
  metrics: {
    carbon_saved: number;
    trees_equivalent: number;
    water_saved: number;
    plastic_recycled: number;
    metals_recovered: number;
    total_devices_recycled: number;
    total_users: number;
    total_pickups: number;
    active_recyclers: number;
    total_revenue: number;
  };
  device_categories: { name: string; value: number }[];
  historical_analytics: { month: string; pickups: number; carbon: number }[];
  users?: {
    id: number;
    email: string;
    full_name: string;
    password?: string;
    eco_points: number;
    created_at: string | null;
  }[];
  submissions?: {
    id: number;
    user_email: string;
    device_name: string;
    category: string;
    hazard_level: string;
    market_val: number;
    submitted_at: string | null;
  }[];
}

export interface LeaderboardItem {
  full_name: string;
  eco_points: number;
  avatar_url: string;
  is_current?: boolean;
  rank: number;
}

// Token Helpers
export const getAuthToken = () => localStorage.getItem("ecotrack_token");
export const setAuthToken = (token: string) => localStorage.setItem("ecotrack_token", token);
export const removeAuthToken = () => localStorage.removeItem("ecotrack_token");

const getHeaders = (isMultipart = false) => {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

export const api = {
  // Auth
  async register(email: string, password: string, fullName: string): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Registration failed");
    }
    const data = await res.json();
    setAuthToken(data.access_token);
    return data;
  },

  async recoverAccount(email: string, recoveryCode: string, newPassword: string): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/recover`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, recovery_code: recoveryCode, new_password: newPassword }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Recovery failed");
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Login failed");
    }
    const data = await res.json();
    setAuthToken(data.access_token);
    return data;
  },

  async googleLogin(email?: string, fullName?: string, avatarUrl?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, full_name: fullName, avatar_url: avatarUrl }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Google authentication failed");
    }
    const data = await res.json();
    setAuthToken(data.access_token);
    return data;
  },

  async sendOtp(phoneOrEmail: string): Promise<{ success: boolean; message: string; dev_otp?: string }> {
    const res = await fetch(`${API_BASE}/auth/otp/send`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ phone_or_email: phoneOrEmail }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to send OTP");
    }
    return res.json();
  },

  async verifyOtp(phoneOrEmail: string, otpCode: string, fullName?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/otp/verify`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ phone_or_email: phoneOrEmail, otp_code: otpCode, full_name: fullName }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Invalid or expired OTP code");
    }
    const data = await res.json();
    setAuthToken(data.access_token);
    return data;
  },

  async getMe(): Promise<{ user: User; achievements: Achievement[]; stats: { total_recycled: number; pickups_scheduled: number } }> {
    const token = getAuthToken();
    if (!token) throw new Error("No token found");
    const res = await fetch(`${API_BASE}/auth/me?token=${token}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!res.ok) {
      removeAuthToken();
      throw new Error("Session expired");
    }
    return res.json();
  },

  // Devices Identification
  async detectDevice(file: File, customLabel?: string): Promise<DeviceSubmission> {
    const formData = new FormData();
    formData.append("file", file);
    if (customLabel) formData.append("custom_label", customLabel);
    
    const token = getAuthToken();
    if (token) {
      formData.append("authorization", `Bearer ${token}`);
    }

    const res = await fetch(`${API_BASE}/devices/detect`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    if (!res.ok) {
      let errorDetail = "Device detection failed";
      try {
        const errJson = await res.json();
        if (errJson.detail) errorDetail = errJson.detail;
      } catch (e) {}
      throw new Error(errorDetail);
    }
    return res.json();
  },

  async getHistory(): Promise<DeviceSubmission[]> {
    const res = await fetch(`${API_BASE}/devices/history`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to fetch submission history");
    }
    return res.json();
  },

  // Recyclers
  async getRecyclers(): Promise<Recycler[]> {
    const res = await fetch(`${API_BASE}/recyclers`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to fetch recyclers");
    }
    return res.json();
  },

  // Pickups
  async schedulePickup(pickup: {
    recycler_name: string;
    recycler_address: string;
    pickup_date: string;
    pickup_time: string;
    address: string;
    contact_phone: string;
  }): Promise<PickupSchedule> {
    const token = getAuthToken() || "";
    
    // We send as JSON but we have header parsing, wait! In main.py:
    // schedule_pickup expects pickup: PickupCreate, and authorization: Optional[str] = Form(None)
    // Oh, since main.py expects authorization as Form, we should pass it or send standard json if we can.
    // Wait, let's look at backend/main.py:
    // @app.post("/api/pickups")
    // def schedule_pickup(pickup: PickupCreate, authorization: Optional[str] = Form(None), db: Session = Depends(get_db)):
    // Since it mixes JSON model with Form, FastAPI requires a multipart request or URL parameters.
    // Actually, in FastAPI, if we mix body and Form, it expects Form.
    // Let's check how we can write the fetch request:
    // We can pass authorization in the header as standard jwt and it will fallback to get_current_user_from_header which checks headers if no form field is present!
    // Let's verify get_current_user_from_header in main.py:
    // def get_current_user_from_header(authorization: Optional[str] = Form(None), db: Session = Depends(get_db))
    // Yes! It checks authorization. And if not found in Form, does it check headers?
    // Wait! Let's check main.py line 125:
    // "try: token = authorization.split(" ")[1] if " " in authorization else authorization..."
    // Wait, it only checks the parameter `authorization`. If it's not passed, it defaults to the demo user.
    // That means we should pass `authorization` in headers, and wait! If it's a JSON body, how does FastAPI receive `authorization: Optional[str] = Form(None)`?
    // In FastAPI, if you declare Form parameters, the whole endpoint expects `application/x-www-form-urlencoded` or `multipart/form-data` instead of JSON.
    // Let's see: if we send it as a FormData, it works. Or we can just modify the backend to accept authorization from the standard HTTP header!
    // Yes! Let's check if the backend can get it from the header.
    // The standard way in FastAPI to get headers is: `Header(None)` or `Depends(get_current_user)` which reads the `Authorization` header.
    // Let's look at `get_current_user_from_header` in `main.py`.
    // It takes `authorization: Optional[str] = Form(None)`.
    // Wait, if it takes `authorization` as Form, we can modify the backend to read from the header instead! That is much more standard and clean.
    // Let's inspect how to read headers in FastAPI:
    // We can use: `from fastapi import Header`
    // and then `def get_current_user_from_header(authorization: Optional[str] = Header(None), db: Session = Depends(get_db))`
    // That is incredibly clean and standard!
    // Let's modify `backend/main.py` to change `Form(None)` to `Header(None)` (or let it check both) so it supports standard headers!
    // Let's do that in a bit, or let's write our API client to support FormData, or just change the backend! Changing the backend to use `Header` is much better.
    // Let's see if we should write a quick update to main.py. Yes! Let's update `backend/main.py` using `replace_file_content` to make auth work via standard HTTP Authorization Headers.
    return fetch(`${API_BASE}/pickups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(pickup),
    }).then(res => {
      if (!res.ok) throw new Error("Failed to schedule pickup");
      return res.json();
    });
  },

  async getPickups(): Promise<PickupSchedule[]> {
    const token = getAuthToken() || "";
    const headers: HeadersInit = {
      "Authorization": token ? `Bearer ${token}` : "",
    };
    const res = await fetch(`${API_BASE}/pickups`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      throw new Error("Failed to fetch pickups");
    }
    return res.json();
  },

  async updatePickupStatus(pickupId: number, status: string): Promise<PickupSchedule> {
    const token = getAuthToken() || "";
    const res = await fetch(`${API_BASE}/pickups/${pickupId}/update-status?status=${status}`, {
      method: "POST",
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
      },
    });
    if (!res.ok) {
      throw new Error("Failed to update pickup status");
    }
    return res.json();
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to fetch dashboard stats");
    }
    return res.json();
  },

  // Chatbot
  async sendMessage(message: string): Promise<string> {
    const res = await fetch(`${API_BASE}/chatbot/chat`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      throw new Error("Chat failed");
    }
    const data = await res.json();
    return data.reply;
  },

  // Rewards Leaderboard
  async getLeaderboard(): Promise<{ leaderboard: LeaderboardItem[]; user_rank: number; user_points: number }> {
    const token = getAuthToken() || "";
    const headers: HeadersInit = {
      "Authorization": token ? `Bearer ${token}` : "",
    };
    const res = await fetch(`${API_BASE}/rewards/leaderboard`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      throw new Error("Failed to fetch leaderboard");
    }
    return res.json();
  }
};
