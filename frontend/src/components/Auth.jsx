import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Search,
  Trash2,
  Download,
  LogOut,
  Eye,
  Plus,
  X,
} from "lucide-react";

const API_URL = "http://localhost:8000";

const Auth = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [loading, setLoading] = useState(false);

  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchNotes();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (authMode === "login") {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setToken(data.access_token);
          localStorage.setItem("token", data.access_token);
          setEmail("");
          setPassword("");
        } else {
          setError("Invalid credentials");
        }
      } else {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, username }),
        });

        if (res.ok) {
          setError("");
          alert("Registration successful! Please login.");
          setAuthMode("login");
          setUsername("");
        } else {
          const data = await res.json();
          setError(data.detail || "Registration failed");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    setNotes([]);
    setSummary("");
    localStorage.removeItem("token");
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[100vh] bg-gradient-to-br from-[#eff6ff] via-[#eef2ff] to-[#f5f3ff] flex items-center justify-center p-[16px]">
      <div className="bg-[#ffffff] rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.1)] p-[32px] w-full max-w-[448px]">
        <div className="text-center mb-[24px]">
          <div className="inline-block p-[12px] bg-[#e0e7ff] rounded-[9999px] mb-[16px]">
            <FileText size={32} className="text-[#4f46e5]" />
          </div>
          <h1 className="text-[30px] font-[700] text-[#1f2937]">
            Document Summarizer
          </h1>
          <p className="text-[#4b5563] mt-[8px]">
            AI-powered document analysis
          </p>
        </div>

        <div className="flex gap-[8px] mb-[24px]">
          <button
            onClick={() => {
              setAuthMode("login");
              setError("");
            }}
            className={`flex-1 py-[8px] rounded-[8px] font-[500] transition ${
              authMode === "login"
                ? "bg-[#4f46e5] text-[#ffffff] shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
                : "bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setAuthMode("register");
              setError("");
            }}
            className={`flex-1 py-[8px] rounded-[8px] font-[500] transition ${
              authMode === "register"
                ? "bg-[#4f46e5] text-[#ffffff] shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
                : "bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]"
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-[16px] p-[12px] bg-[#fef2f2] border border-[#fecaca] rounded-[8px] text-[#dc2626] text-[14px]">
            {error}
          </div>
        )}

        <div onSubmit={handleAuth}>
          <div className="space-y-[16px]">
            {authMode === "register" && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-[16px] py-[12px] border border-[#d1d5db] rounded-[8px] focus:ring-[2px] focus:ring-[#4f46e5] focus:border-transparent outline-none transition"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-[16px] py-[12px] border border-[#d1d5db] rounded-[8px] focus:ring-[2px] focus:ring-[#4f46e5] focus:border-transparent outline-none transition"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-[16px] py-[12px] border border-[#d1d5db] rounded-[8px] focus:ring-[2px] focus:ring-[#4f46e5] focus:border-transparent outline-none transition"
              required
            />
            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-[#4f46e5] text-[#ffffff] py-[12px] rounded-[8px] font-[500] hover:bg-[#4338ca] transition disabled:opacity-[0.5] disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
            >
              {loading
                ? "Processing..."
                : authMode === "login"
                ? "Login"
                : "Register"}
            </button>
          </div>
        </div>

        <p className="text-center text-[12px] text-[#6b7280] mt-[24px]">
          Secure authentication with JWT tokens
        </p>
      </div>
    </div>
  );
};

export default Auth;
