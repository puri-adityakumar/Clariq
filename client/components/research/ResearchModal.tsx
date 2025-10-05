"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/appwrite/AuthProvider";
import { createResearchJob } from "@/lib/appwrite/research";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/useToast";

interface ResearchModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: SubmitPayload) => Promise<void> | void;
}

export interface SubmitPayload {
  target: string;
  enabledAgents: string[];
  personName?: string;
  personLinkedin?: string;
  additionalContext?: string;
  template?: string;
}

const BASE_AGENTS = {
  company_discovery: { label: "Company Discovery", required: true },
  person_research: { label: "Person Research", required: false },
  market_analysis: { label: "Market Analysis", required: false },
  competitor_research: { label: "Competitor Research", required: false }
};

type FormState = {
  target: string;
  personEnabled: boolean;
  marketEnabled: boolean;
  competitorEnabled: boolean;
  personName: string;
  personLinkedin: string;
  additionalContext: string;
  template?: string;
};

const initialState: FormState = {
  target: "",
  personEnabled: false,
  marketEnabled: false,
  competitorEnabled: false,
  personName: "",
  personLinkedin: "",
  additionalContext: "",
  template: undefined
};

export const ResearchModal: React.FC<ResearchModalProps> = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Close on escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setForm(initialState);
        setErrors({});
        setSubmitting(false);
      }, 200); // allow exit animation
    }
  }, [open]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const templates = useMemo(() => ([
    { key: "full", label: "Full Company Analysis", apply: () => ({ marketEnabled: true, competitorEnabled: true, personEnabled: false, template: "full" }) },
    { key: "pre_meeting", label: "Pre-Meeting Brief", apply: () => ({ personEnabled: true, marketEnabled: true, competitorEnabled: false, template: "pre_meeting" }) },
    { key: "quick", label: "Quick Overview", apply: () => ({ personEnabled: false, marketEnabled: false, competitorEnabled: false, template: "quick" }) }
  ]), []);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!form.target.trim()) e.target = "Target is required";
    if (form.personEnabled && !form.personName.trim()) e.personName = "Person name required";
    // Basic linkedin url heuristic
    if (form.personEnabled && form.personLinkedin && !/linkedin\.com\/in\//i.test(form.personLinkedin)) {
      e.personLinkedin = "Expecting a LinkedIn profile URL";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const handleTemplate = (tplKey: string) => {
    const tpl = templates.find(t => t.key === tplKey);
    if (!tpl) return;
    const applied = tpl.apply();
    setForm(f => ({ ...f, ...applied }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Check if user is authenticated
    if (!user) {
      toast.error("Please sign in to start research");
      return;
    }
    
    setSubmitting(true);
    const enabledAgents = ["company_discovery"];
    if (form.personEnabled) enabledAgents.push("person_research");
    if (form.marketEnabled) enabledAgents.push("market_analysis");
    if (form.competitorEnabled) enabledAgents.push("competitor_research");
    
    const payload: SubmitPayload = {
      target: form.target.trim(),
      enabledAgents,
      personName: form.personEnabled ? form.personName.trim() : undefined,
      personLinkedin: form.personEnabled ? form.personLinkedin.trim() || undefined : undefined,
      additionalContext: form.additionalContext.trim() || undefined,
      template: form.template
    };
    
    try {
      // Step 1: Create research job in Appwrite
      const job = await createResearchJob({
        userId: user.$id,
        target: payload.target,
        enabledAgents: payload.enabledAgents,
        personName: payload.personName,
        personLinkedin: payload.personLinkedin,
        additionalContext: payload.additionalContext,
      });

      // Step 2: Trigger backend to execute the research
      try {
        const { apiClient } = await import("@/lib/api");
        await apiClient.executeResearchJob(job.$id);
        console.log(`Research job ${job.$id} triggered successfully`);
      } catch (backendErr) {
        console.error("Backend trigger failed:", backendErr);
        // Job still created, but backend didn't start - user can retry later
        toast.warning("Research job created but execution failed to start. Please retry from dashboard.");
      }

      // Call the old onSubmit prop if provided (for backwards compatibility)
      await onSubmit?.(payload);
      
      // Success notification
      toast.success("Research initiated! Check back in 10-15 minutes.");
      
      // Navigate to research dashboard
      router.push("/dashboard/research");
      onClose();
    } catch (err) {
      console.error("Error creating research job:", err);
      toast.error("Failed to create research job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="rounded-xl border border-white/15 bg-neutral-900/90 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-white">Start Market Research</h2>
              <p className="mt-1 text-xs text-white/60">Research will take 10-15 minutes. You can close this modal after submitting.</p>
            </div>
            <button onClick={onClose} className="text-white/50 transition hover:text-white" aria-label="Close modal">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/90">
                Research Target<span className="text-red-400">*</span>
                <input
                  type="text"
                  placeholder="Company name or URL"
                  value={form.target}
                  onChange={e => setField("target", e.target.value)}
                  className={cn("mt-1 w-full rounded-md border border-white/10 bg-neutral-800/60 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30", errors.target && "border-red-500/50 focus:ring-red-400/50")}
                />
              </label>
              {errors.target && <p className="text-xs text-red-400">{errors.target}</p>}
            </div>

            {/* Agents */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white/80">Agents</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <AgentCheckbox
                  label={BASE_AGENTS.company_discovery.label}
                  description="Core company profile and baseline data"
                  checked
                  disabled
                  required
                />
                <AgentCheckbox
                  label={BASE_AGENTS.person_research.label}
                  description="Research key person background & talking points"
                  checked={form.personEnabled}
                  onChange={v => setField("personEnabled", v)}
                />
                <AgentCheckbox
                  label={BASE_AGENTS.market_analysis.label}
                  description="Industry size, growth, trends"
                  checked={form.marketEnabled}
                  onChange={v => setField("marketEnabled", v)}
                />
                <AgentCheckbox
                  label={BASE_AGENTS.competitor_research.label}
                  description="Competitive landscape & positioning"
                  checked={form.competitorEnabled}
                  onChange={v => setField("competitorEnabled", v)}
                />
              </div>

              {form.personEnabled && (
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-white/70">Person Name<span className="text-red-400">*</span>
                      <input
                        type="text"
                        value={form.personName}
                        onChange={e => setField("personName", e.target.value)}
                        placeholder="Full name"
                        className={cn("mt-1 w-full rounded-md border border-white/10 bg-neutral-800/60 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30", errors.personName && "border-red-500/50 focus:ring-red-400/50")}
                      />
                    </label>
                    {errors.personName && <p className="mt-1 text-xs text-red-400">{errors.personName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/70">LinkedIn URL (optional)
                      <input
                        type="text"
                        value={form.personLinkedin}
                        onChange={e => setField("personLinkedin", e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className={cn("mt-1 w-full rounded-md border border-white/10 bg-neutral-800/60 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30", errors.personLinkedin && "border-red-500/50 focus:ring-red-400/50")}
                      />
                    </label>
                    {errors.personLinkedin && <p className="mt-1 text-xs text-red-400">{errors.personLinkedin}</p>}
                    <p className="mt-1 text-[10px] text-white/40">Recommended for better accuracy</p>
                  </div>
                </div>
              )}
            </div>

            {/* Templates */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white/80">Templates</h3>
              <div className="flex flex-wrap gap-2">
                {templates.map(t => {
                  const active = form.template === t.key;
                  return (
                    <button
                      type="button"
                      key={t.key}
                      onClick={() => { handleTemplate(t.key); setField("template", t.key); }}
                      className={cn("rounded-full border px-3 py-1 text-xs font-medium transition", active ? "border-white bg-white text-black" : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10")}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80">Additional Context
                <textarea
                  rows={4}
                  placeholder="Anything specific you want the agents to focus on..."
                  value={form.additionalContext}
                  onChange={e => setField("additionalContext", e.target.value)}
                  className="mt-1 w-full resize-y rounded-md border border-white/10 bg-neutral-800/60 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-[11px] text-white/40">Submitting will create a research job. You can monitor its status in the dashboard.</p>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="min-w-28">{submitting ? "Submitting..." : "Start Research"}</Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface AgentCheckboxProps {
  label: string;
  description?: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  required?: boolean;
}

const AgentCheckbox: React.FC<AgentCheckboxProps> = ({ label, description, checked, onChange, disabled, required }) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange?.(!checked)}
      className={cn(
        "group relative flex w-full items-start gap-3 rounded-lg border p-3 text-left transition",
        disabled ? "cursor-not-allowed border-white/10 bg-white/5" : checked ? "border-white bg-white text-black" : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10",
      )}
      aria-pressed={checked}
      aria-disabled={disabled}
    >
      <span
        className={cn(
          "mt-0.5 flex h-4 w-4 items-center justify-center rounded-sm border text-[10px] font-bold transition",
          disabled ? "border-white/30 text-white/30" : checked ? "border-black bg-black/90 text-white" : "border-white/40 text-transparent group-hover:text-white/40"
        )}
      >
        ✓
      </span>
      <span className="flex-1">
        <span className={cn("block text-xs font-medium tracking-tight", checked ? "text-black" : "text-white/90")}>{label}{required && <span className="ml-0.5 text-red-400">*</span>}</span>
        {description && <span className={cn("mt-0.5 block text-[10px] leading-snug", checked ? "text-black/70" : "text-white/50")}>{description}</span>}
      </span>
    </button>
  );
};

export default ResearchModal;
