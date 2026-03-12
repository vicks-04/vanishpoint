import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Shield, Users, Lock, Menu, X, LogOut, User, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/private", label: "Private", icon: Shield },
  { path: "/team", label: "Team", icon: Users },
  { path: "/vault", label: "Vault", icon: Lock },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const { user, signOut } = useAuth();

  const isInSession = location.pathname.startsWith("/room/");

  const requestNavigation = (path: string) => {
    if (path === location.pathname) {
      setMobileOpen(false);
      return;
    }

    if (isInSession && !path.startsWith("/room/")) {
      setPendingPath(path);
      setConfirmLeaveOpen(true);
      setMobileOpen(false);
      return;
    }

    navigate(path);
    setMobileOpen(false);
  };

  const confirmLeaveAndNavigate = () => {
    if (!pendingPath) return;
    navigate(pendingPath);
    setConfirmLeaveOpen(false);
    setPendingPath(null);
  };

  const cancelLeave = () => {
    setConfirmLeaveOpen(false);
    setPendingPath(null);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[70] border-b border-border/70 bg-background/65 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button type="button" onClick={() => requestNavigation("/")} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="text-lg font-semibold text-foreground tracking-tight">
                Vanish<span className="text-primary">Point</span>
              </span>
            </button>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => requestNavigation(item.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}

              <div className="ml-2 pl-2 border-l border-border flex items-center gap-2">
                {user ? (
                  <>
                    <div className="text-right leading-tight max-w-[160px]">
                      <p className="text-[11px] text-foreground/85 truncate">{user.full_name || "Signed in"}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => requestNavigation("/auth")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <User className="w-4 h-4 mr-1" /> Sign In
                  </Button>
                )}
              </div>
            </div>

            <button
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background/90"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => requestNavigation(item.path)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}

                <div className="pt-2 border-t border-border">
                  {user ? (
                    <button
                      onClick={() => {
                        signOut();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary w-full"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => requestNavigation("/auth")}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary w-full"
                    >
                      <User className="w-4 h-4" /> Sign In
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {confirmLeaveOpen && (
          <motion.div
            className="fixed inset-0 z-[90] bg-background/75 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              className="w-full max-w-md glass-panel-strong border border-primary/25 rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold mb-2">Leave current session?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                You are in an active private session. Leaving now will disconnect you from this room.
              </p>
              <div className="flex items-center justify-end gap-3">
                <Button variant="glass" onClick={cancelLeave}>Cancel</Button>
                <Button variant="destructive" onClick={confirmLeaveAndNavigate}>Leave</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
