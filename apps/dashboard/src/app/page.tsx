"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password");
    }
    setLoading(false);
  }

  return (
    <div className="cs-login-bg">
      {/* Scan-line overlay */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,200,212,1) 2px,rgba(0,200,212,1) 3px)",
          backgroundSize: "100% 6px",
        }}
      />

      <div className="absolute top-6 left-6 font-mono text-[10px] tracking-[0.15em] text-[#00c8d4]/40 uppercase select-none">
        Observation Mode 07
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[10px] tracking-[0.15em] text-[#00c8d4]/30 uppercase select-none">
        Encrypted Terminal
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="cs-login-card"
        style={{ position: "relative" }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-1/4 right-1/4 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #00c8d4, transparent)" }}
        />

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "rgba(0,200,212,0.15)", border: "1px solid rgba(0,200,212,0.3)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 17l4-8 4 4 4-6 4 3" stroke="#00c8d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="19" cy="16" r="2" fill="#00c8d4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CrowdSense</h1>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#00c8d4] uppercase mt-1">
            Admin Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold tracking-[0.1em] text-[#5a7a8a] uppercase mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a7a8a] text-sm select-none">@</span>
              <input
                id="cs-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@crowdsense.io"
                className="cs-input pl-8"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold tracking-[0.1em] text-[#5a7a8a] uppercase">
                Password
              </label>
              <button
                type="button"
                className="text-[11px] font-semibold tracking-[0.06em] text-[#00c8d4] uppercase hover:text-[#00e5f0] transition-colors"
              >
                Forgot Access?
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a7a8a]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                id="cs-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="············"
                className="cs-input pl-8"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[12px] text-[#ff4d6d] flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff4d6d">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            id="cs-signin-btn"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-200"
            style={{
              background: loading ? "rgba(0,200,212,0.6)" : "#00c8d4",
              color: "#08111d",
              boxShadow: "0 4px 24px rgba(0,200,212,0.3)",
            }}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-[#08111d]/40 border-t-[#08111d] animate-spin" />
                Authenticating…
              </>
            ) : (
              <>
                Sign in
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-5 flex flex-col items-center gap-3" style={{ borderTop: "1px solid rgba(30,60,80,0.6)" }}>
          <div className="flex items-center gap-2 text-[11px] text-[#5a7a8a]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#00c8d4" strokeWidth="2"/>
            </svg>
            Secured with JWT authentication
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#3a5a6a] tracking-[0.08em] uppercase">
            <span>System V4.2.0</span>
            <span className="w-1 h-1 rounded-full bg-[#3a5a6a]" />
            <span>Region: US-East-1</span>
          </div>
        </div>
      </motion.div>

      {/* Bottom links */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6">
        {["Documentation", "Privacy Protocol", "Support"].map(link => (
          <button key={link} className="text-[10px] font-mono tracking-[0.12em] text-[#3a5a6a] hover:text-[#5a7a8a] uppercase transition-colors">
            {link}
          </button>
        ))}
      </div>
    </div>
  );
}
