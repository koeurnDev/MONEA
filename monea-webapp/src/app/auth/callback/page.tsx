"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { moneaClient } from "@/lib/api-client";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        
        if (!code) {
          setError("No authorization code received");
          setStatus("error");
          setTimeout(() => navigate("/sign-in"), 2000);
          return;
        }

        console.log("[Auth Callback] Exchanging code for session...");

        // Exchange the temporary code for a session
        const response = await moneaClient.post("/api/auth/session", { code });

        console.log("[Auth Callback] Response:", response);

        if (response && !response.error) {
          console.log("[Auth Callback] Session created successfully");
          setStatus("success");
          
          // Small delay to ensure cookies are set
          setTimeout(() => {
            navigate("/dashboard");
          }, 500);
        } else {
          console.error("[Auth Callback] Session exchange failed:", response);
          setError(response?.error || "Failed to create session");
          setStatus("error");
          setTimeout(() => navigate("/sign-in"), 2000);
        }
      } catch (err: any) {
        console.error("[Auth Callback] Error:", err);
        setError(err.message || "Authentication failed");
        setStatus("error");
        setTimeout(() => navigate("/sign-in"), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-lg text-muted-foreground">Completing sign in...</p>
            <p className="text-sm text-muted-foreground">កំពុងបញ្ចប់ការចូល...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg text-green-600">Success! Redirecting...</p>
            <p className="text-sm text-muted-foreground">ជោគជ័យ! កំពុងបញ្ជូនទៅ dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg text-red-600">Authentication Failed</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">Redirecting to sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}
