import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Focus,
  KeyRound,
  HeartPulse,
  Scale,
  SearchCheck,
  Briefcase,
  Link2,
  Share2,
  CheckCircle2,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const coreCapabilities = [
  {
    icon: ShieldCheck,
    title: "Private by Default",
    description: "Every room is ephemeral and encrypted. No account required.",
  },
  {
    icon: Zap,
    title: "Fast Room Setup",
    description: "Create secure rooms in seconds with instant access links and encrypted invitations.",
  },
  {
    icon: Focus,
    title: "Focused Collaboration",
    description: "Built for sensitive conversations with distraction-free environments.",
  },
  {
    icon: KeyRound,
    title: "Clear Access Control",
    description: "Define who joins your session with secure verification before entering.",
  },
];

const applications = [
  {
    icon: HeartPulse,
    title: "Healthcare",
    description: "Secure doctor-patient consultations.",
  },
  {
    icon: Scale,
    title: "Legal Counsel",
    description: "Confidential legal discussions.",
  },
  {
    icon: SearchCheck,
    title: "Investigative Teams",
    description: "Private collaboration for sensitive investigations.",
  },
  {
    icon: Briefcase,
    title: "Executive Comms",
    description: "Secure communication for leadership meetings.",
  },
];

const flowSteps = [
  {
    step: "Step 1",
    title: "Create Room",
    description: "Generate a secure session link.",
    icon: Link2,
  },
  {
    step: "Step 2",
    title: "Share Access",
    description: "Send the secure link to participants.",
    icon: Share2,
  },
  {
    step: "Step 3",
    title: "Verify Join",
    description: "Participants answer the security question.",
    icon: CheckCircle2,
  },
  {
    step: "Step 4",
    title: "Close Session",
    description: "Session self-destructs after completion.",
    icon: Trash2,
  },
];

const securityLayers = [
  "Ephemeral Sessions",
  "Question Gate Access",
  "No Account Required",
  "Private Room Links",
  "Minimal Metadata",
  "Rapid Session Exit",
];

const sectionHeader = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const cardIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.08, duration: 0.35 },
  }),
};

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={sectionHeader}
      className="text-center mb-8 sm:mb-10"
    >
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm sm:text-base">{subtitle}</p>
    </motion.div>
  );
}

const LandingFeatures = () => {
  return (
    <section className="relative py-20 sm:py-24 px-4">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,hsla(186,65%,45%,0.12),transparent_45%),radial-gradient(circle_at_80%_35%,hsla(186,65%,45%,0.08),transparent_45%)]" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-16 sm:space-y-20">
        <div>
          <SectionTitle
            title="Core Capabilities"
            subtitle="Everything needed for secure and private meetings."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {coreCapabilities.map((item, index) => (
              <motion.article
                key={item.title}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={cardIn}
                className="glass-panel p-5 rounded-2xl border border-primary/20 hover:border-primary/45 hover:shadow-[0_0_22px_rgba(34,211,238,0.18)] transition-all"
              >
                <div className="w-10 h-10 rounded-xl border border-primary/25 bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle title="Versatile Applications" subtitle="Built for critical confidentiality." />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {applications.map((item, index) => (
              <motion.article
                key={item.title}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={cardIn}
                className="glass-panel p-5 rounded-2xl border border-primary/20 hover:border-primary/45 hover:shadow-[0_0_22px_rgba(34,211,238,0.18)] transition-all"
              >
                <div className="w-10 h-10 rounded-xl border border-primary/25 bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle title="Operational Flow" subtitle="Simple process for secure meetings." />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {flowSteps.map((item, index) => (
              <motion.article
                key={item.title}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={cardIn}
                className="glass-panel p-5 rounded-2xl border border-primary/20 relative overflow-hidden"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] font-mono text-primary mb-3">{item.step}</p>
                <div className="w-10 h-10 rounded-xl border border-primary/25 bg-primary/10 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle title="Security Layers" subtitle="Designed with practical safeguards." />
          <div className="flex flex-wrap items-center justify-center gap-3">
            {securityLayers.map((layer, index) => (
              <motion.span
                key={layer}
                custom={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.05, duration: 0.28 }}
                className="px-4 py-2 rounded-full border border-primary/35 bg-primary/10 text-sm font-medium text-foreground"
              >
                {layer}
              </motion.span>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl p-[1px] bg-gradient-to-r from-cyan-400/70 via-primary/50 to-cyan-400/70"
        >
          <div className="glass-panel rounded-3xl px-6 py-10 sm:px-10 sm:py-12 text-center border border-primary/20 hover:shadow-[0_0_26px_rgba(34,211,238,0.22)] transition-all">
            <h3 className="text-2xl sm:text-3xl font-bold mb-5">Need a private room right now?</h3>
            <Button variant="hero" size="xl" asChild>
              <Link to="/private">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingFeatures;