import { Link } from "react-router-dom";
import { Shield, Users, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import LandingFeatures from "@/components/LandingFeatures";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const modules = [
  {
    icon: Shield,
    title: "Private Mode",
    description: "Invite-only 1-on-1 secure conversations with no trace left behind.",
    path: "/private",
    features: ["PIN protected", "Self-destruct messages", "No history"],
  },
  {
    icon: Users,
    title: "Team Mode",
    description: "Host-controlled meetings with professional tools and security.",
    path: "/team",
    features: ["Waiting room", "Host controls", "Screen sharing"],
  },
  {
    icon: Lock,
    title: "Secure Vault",
    description: "Encrypted file storage accessible from anywhere.",
    path: "/vault",
    features: ["Client-side encryption", "Expiring links", "Folder structure"],
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={fadeUp} custom={0} className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs font-mono text-primary tracking-wider uppercase">
                <EyeOff className="w-3 h-3" />
                Privacy-First Communication
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              Where conversations
              <br />
              <span className="text-gradient-primary">vanish</span> on command
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Secure video calls, private sessions, and encrypted file storage.
              Built for those who value privacy above all.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/private">
                  Start Private Session
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/team">
                  Host a Meeting
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <LandingFeatures />

      {/* Why VanishPoint */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="glass-panel relative overflow-hidden rounded-2xl border border-primary/25 p-8 sm:p-12 text-center glow-primary"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsla(185,70%,50%,0.14),transparent_60%)]" />

            <div className="relative z-10">
              <p className="text-xs font-mono uppercase tracking-[0.22em] text-primary/90 mb-4">
                Mission
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-5">
                Why <span className="text-gradient-primary">VanishPoint?</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                In today&apos;s digital world, many communication platforms store messages and user data for long periods,
                creating privacy risks. VanishPoint was built as a privacy-first platform where conversations, files, and
                sessions can disappear on command, giving users full control over what is shared, what is stored, and what
                remains private.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Three modules. <span className="text-primary">Zero compromise.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Each module is purpose-built for a specific use case, united by an uncompromising commitment to privacy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  to={mod.path}
                  className="block glass-panel p-8 h-full hover:bg-card/80 transition-all duration-300 group hover:glow-primary"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <mod.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{mod.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    {mod.description}
                  </p>
                  <div className="space-y-2">
                    {mod.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        {f}
                      </div>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">VanishPoint</span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Privacy is not a feature. It's a right.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
