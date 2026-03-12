import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL, ApiUser, apiRequest } from "@/lib/api";

type AuthView = "login" | "signup" | "forgot";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.5-.2-2.2H12z"
      />
      <path
        fill="#34A853"
        d="M6.4 14.3l-.7.6-2.4 1.9C4.8 20 8.1 22 12 22c2.7 0 5-1 6.7-2.6l-3.1-2.4c-.9.6-2 .9-3.6.9-2.7 0-4.9-1.8-5.7-4.2z"
      />
      <path
        fill="#4A90E2"
        d="M3.3 7.1C2.5 8.6 2 10.3 2 12c0 1.7.4 3.4 1.3 4.9l3.1-2.4c-.2-.7-.4-1.5-.4-2.5 0-.8.1-1.6.4-2.4z"
      />
      <path
        fill="#FBBC05"
        d="M12 6.2c1.9 0 3.5.7 4.5 1.7l2.7-2.7C17.5 3.6 15 2.5 12 2.5 8.1 2.5 4.8 4.7 3.3 7.1l3.1 2.5c.8-2.5 3-4.3 5.6-4.3z"
      />
    </svg>
  );
}

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
<<<<<<< HEAD
  const { user, setSession, setSessionFromToken } = useAuth();
=======
  const { user, setSession } = useAuth();
>>>>>>> origin/main

  const [view, setView] = useState<AuthView>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    navigate("/vault", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleError = params.get("google_error");
<<<<<<< HEAD
    const tokenFromRedirect = params.get("token");
=======
    const codeFromRedirect = params.get("code");
>>>>>>> origin/main

    if (googleError) {
      toast({
        title: "Google sign-in failed",
        description: googleError,
        variant: "destructive",
      });
      navigate("/auth", { replace: true });
      return;
    }

<<<<<<< HEAD
    if (!tokenFromRedirect) return;

    setLoading(true);
    setSessionFromToken(tokenFromRedirect)
=======
    if (!codeFromRedirect) return;

    setLoading(true);
    apiRequest<{ token: string; user: ApiUser }>("/auth/exchange", {
      method: "POST",
      body: JSON.stringify({ code: codeFromRedirect }),
    })
      .then((response) => {
        setSession(response.token, response.user);
      })
>>>>>>> origin/main
      .then(() => {
        toast({ title: "Signed in", description: "Google account linked successfully." });
        navigate("/vault", { replace: true });
      })
      .catch((error: Error) => {
        toast({
          title: "Google sign-in failed",
          description: error.message,
          variant: "destructive",
        });
        navigate("/auth", { replace: true });
      })
      .finally(() => {
        setLoading(false);
      });
<<<<<<< HEAD
  }, [location.search, navigate, setSessionFromToken]);
=======
  }, [location.search, navigate, setSession]);
>>>>>>> origin/main

  const handleGoogleSignIn = () => {
    window.location.assign(`${API_BASE_URL}/auth/google`);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest<{ token: string; user: ApiUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSession(response.token, response.user);
      navigate("/vault", { replace: true });
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Sign up failed",
        description: "Confirm password does not match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest<{ token: string; user: ApiUser }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password, confirmPassword }),
      });
      setSession(response.token, response.user);
      navigate("/vault", { replace: true });
    } catch (error: any) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest<{ message: string; resetLink?: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (response.resetLink) {
        navigator.clipboard.writeText(response.resetLink).catch(() => null);
      }

      toast({
        title: "Reset link generated",
        description: "Check your inbox. A reset link was sent if the account exists.",
      });
    } catch (error: any) {
      toast({ title: "Request failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-7 w-full max-w-md space-y-5 border border-primary/20"
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 glow-primary">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {view === "login" && "Welcome Back"}
            {view === "signup" && "Create Account"}
            {view === "forgot" && "Reset Password"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {view === "login" && "Sign in to continue securely."}
            {view === "signup" && "Create your VanishPoint account."}
            {view === "forgot" && "Enter your email to reset password."}
          </p>
        </div>

        {view !== "forgot" && (
          <>
            <Button
              type="button"
              variant="glass"
              className="w-full h-10"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <GoogleIcon />
              Continue with Google
            </Button>
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/70" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>
          </>
        )}

        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="loginEmail">Email</Label>
              <Input
                id="loginEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loginPassword">Password</Label>
              <Input
                id="loginPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                required
              />
            </div>
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => setView("forgot")} className="text-primary hover:underline">
                Forgot password?
              </button>
              <button type="button" onClick={() => setView("signup")} className="text-primary hover:underline">
                Create account
              </button>
            </div>
          </form>
        )}

        {view === "signup" && (
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="signupName">Full Name</Label>
              <Input
                id="signupName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signupEmail">Email</Label>
              <Input
                id="signupEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signupPassword">Password</Label>
              <Input
                id="signupPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signupConfirmPassword">Confirm Password</Label>
              <Input
                id="signupConfirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat password"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
            <button
              type="button"
              onClick={() => setView("login")}
              className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3 h-3" /> Back to sign in
            </button>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="resetEmail">Email</Label>
              <Input
                id="resetEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Reset Link
                </>
              )}
            </Button>
            <button
              type="button"
              onClick={() => setView("login")}
              className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3 h-3" /> Back to sign in
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
