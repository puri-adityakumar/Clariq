"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { useAuth } from "../../appwrite/AuthProvider";
import { useToast } from "../../lib/useToast";
import { getResearchJobsByStatus } from "../../lib/appwrite/research";
import type { ResearchJob } from "../../lib/appwrite/research";

interface VoiceSalesModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: VoiceSessionData) => Promise<void> | void;
}

export interface VoiceSessionData {
  sessionName: string;
  researchJobId: string;
  researchTarget: string;
}

type FormState = {
  sessionName: string;
  selectedJobId: string;
};

const initialState: FormState = {
  sessionName: "",
  selectedJobId: "",
};

export const VoiceSalesModal: React.FC<VoiceSalesModalProps> = ({ 
  open, 
  onClose, 
  onSubmit 
}) => {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completedJobs, setCompletedJobs] = useState<ResearchJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  
  const { user } = useAuth();
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
      }, 200);
    }
  }, [open]);

  // Load completed research jobs when modal opens
  useEffect(() => {
    if (open && user) {
      setLoadingJobs(true);
      getResearchJobsByStatus(user.$id, 'completed')
        .then(jobs => {
          setCompletedJobs(jobs);
        })
        .catch(err => {
          console.error('Error loading research jobs:', err);
          toast.error('Failed to load research jobs');
        })
        .finally(() => {
          setLoadingJobs(false);
        });
    }
  }, [open, user, toast]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!form.sessionName.trim()) e.sessionName = "Session name is required";
    if (!form.selectedJobId) e.selectedJobId = "Please select a research job";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const selectedJob = completedJobs.find(job => job.$id === form.selectedJobId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (!user) {
      toast.error("Please sign in to start voice sessions");
      return;
    }

    if (!selectedJob) {
      toast.error("Selected research job not found");
      return;
    }
    
    setSubmitting(true);
    
    const payload: VoiceSessionData = {
      sessionName: form.sessionName.trim(),
      researchJobId: form.selectedJobId,
      researchTarget: selectedJob.target,
    };
    
    try {
      await onSubmit?.(payload);
      toast.success("Voice agent created! Check the dashboard for your agent link.");
      onClose();
    } catch (err) {
      console.error("Error creating voice session:", err);
      toast.error("Failed to create voice session. Please try again.");
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
              <h2 className="font-heading text-xl font-semibold tracking-tight text-white">
                Create Voice Sales Agent
              </h2>
              <p className="mt-1 text-xs text-white/60">
                Create an AI voice agent based on your completed research. The agent will be deployed on our backend and you&apos;ll receive a link to talk with it.
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/50 transition hover:text-white" 
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Name */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/90">
                Session Name<span className="text-red-400">*</span>
                <input
                  type="text"
                  placeholder="e.g., Demo call with Acme Corp"
                  value={form.sessionName}
                  onChange={e => setField("sessionName", e.target.value)}
                  className={cn(
                    "mt-1 w-full rounded-md border border-white/10 bg-neutral-800/60 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30",
                    errors.sessionName && "border-red-500/50 focus:ring-red-400/50"
                  )}
                />
              </label>
              {errors.sessionName && (
                <p className="text-xs text-red-400">{errors.sessionName}</p>
              )}
            </div>

            {/* Research Job Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/90">
                Select Research Job<span className="text-red-400">*</span>
              </label>
              
              {loadingJobs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-white/60">Loading research jobs...</div>
                </div>
              ) : completedJobs.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-neutral-800/30 p-4 text-center">
                  <div className="text-white/60 mb-2">No completed research found</div>
                  <p className="text-xs text-white/40">
                    You need to complete at least one research job before starting a voice session.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {completedJobs.map(job => (
                    <ResearchJobCard
                      key={job.$id}
                      job={job}
                      selected={form.selectedJobId === job.$id}
                      onClick={() => setField("selectedJobId", job.$id)}
                    />
                  ))}
                  {errors.selectedJobId && (
                    <p className="text-xs text-red-400">{errors.selectedJobId}</p>
                  )}
                </div>
              )}
            </div>

            {/* Preview */}
            {selectedJob && (
              <div className="rounded-lg border border-white/10 bg-neutral-800/30 p-4">
                <h3 className="text-sm font-semibold text-white/90 mb-2">Session Preview</h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-white/60">Target: </span>
                    <span className="text-white">{selectedJob.target}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Agents used: </span>
                    <span className="text-white">
                      {selectedJob.enabled_agents.map(agent => 
                        agent.replace(/_/g, ' ')
                      ).join(', ')}
                    </span>
                  </div>
                  {selectedJob.person_name && (
                    <div>
                      <span className="text-white/60">Person: </span>
                      <span className="text-white">{selectedJob.person_name}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-white/60">Sources: </span>
                    <span className="text-white">{selectedJob.total_sources || 0}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-[11px] text-white/40">
                The backend will deploy an AI agent and provide you with a link to start the conversation.
              </p>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onClose} 
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting || completedJobs.length === 0} 
                  className="min-w-32"
                >
                  {submitting ? "Creating..." : "Create Voice Agent"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface ResearchJobCardProps {
  job: ResearchJob;
  selected: boolean;
  onClick: () => void;
}

const ResearchJobCard: React.FC<ResearchJobCardProps> = ({ job, selected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border p-3 transition-all",
        selected 
          ? "border-white bg-white text-black" 
          : "border-white/15 bg-neutral-800/60 text-white hover:border-white/30 hover:bg-neutral-800/80"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-medium text-sm truncate",
            selected ? "text-black" : "text-white"
          )}>
            {job.target}
          </div>
          {job.person_name && (
            <div className={cn(
              "text-xs truncate mt-0.5",
              selected ? "text-black/70" : "text-white/60"
            )}>
              Person: {job.person_name}
            </div>
          )}
          <div className={cn(
            "text-xs mt-1",
            selected ? "text-black/60" : "text-white/50"
          )}>
            {new Date(job.created_at).toLocaleDateString()} • {job.total_sources || 0} sources
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {job.enabled_agents.slice(0, 2).map(agent => (
              <span 
                key={agent}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-medium",
                  selected 
                    ? "bg-black/10 text-black/70" 
                    : "bg-white/10 text-white/60"
                )}
              >
                {agent.replace(/_/g, ' ')}
              </span>
            ))}
            {job.enabled_agents.length > 2 && (
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-medium",
                selected 
                  ? "bg-black/10 text-black/70" 
                  : "bg-white/10 text-white/60"
              )}>
                +{job.enabled_agents.length - 2}
              </span>
            )}
          </div>
          <span className={cn(
            "flex h-4 w-4 items-center justify-center rounded-sm border text-[10px] font-bold",
            selected 
              ? "border-black bg-black text-white" 
              : "border-white/40 text-transparent"
          )}>
            ✓
          </span>
        </div>
      </div>
    </button>
  );
};

export default VoiceSalesModal;