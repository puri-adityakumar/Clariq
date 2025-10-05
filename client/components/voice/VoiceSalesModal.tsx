"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useAuth } from "../../appwrite/AuthProvider";
import { useToast } from "../../lib/useToast";

interface VoiceSalesModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: VoiceSessionData) => Promise<void> | void;
}

export interface VoiceSessionData {
  sessionName: string;
}

export const VoiceSalesModal: React.FC<VoiceSalesModalProps> = ({ 
  open, 
  onClose, 
  onSubmit 
}) => {
  const [sessionName, setSessionName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
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
        setSessionName("");
        setSubmitting(false);
      }, 200);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionName.trim()) {
      toast.error("Please enter a session name");
      return;
    }
    
    if (!user) {
      toast.error("Please sign in to start voice sessions");
      return;
    }
    
    setSubmitting(true);
    
    try {
      await onSubmit?.({ sessionName: sessionName.trim() });
      toast.success("Voice session created!");
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
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
        <div className="rounded-xl border border-white/15 bg-neutral-900/90 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-white">
                Create Voice Session
              </h2>
              <p className="mt-1 text-xs text-white/60">
                Create a new AI voice session. You&apos;ll be able to talk directly with the AI agent.
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
              </label>
              <input
                type="text"
                placeholder="e.g., Sales Demo Call"
                value={sessionName}
                onChange={e => setSessionName(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-neutral-800/60 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-[11px] text-white/40">
                The AI agent will be ready for conversation immediately.
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
                  disabled={submitting || !sessionName.trim()} 
                  className="min-w-32"
                >
                  {submitting ? "Creating..." : "Create Session"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VoiceSalesModal;