"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/appwrite/AuthProvider';
import { account } from '@/appwrite/config';
import { Pencil, ArrowRight, Search, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, refresh } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await account.updateName(newName.trim());
      await refresh();
      setIsEditingName(false);
      setNewName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = user?.name || 'User';

  return (
    <main className="min-h-[70vh] container max-w-6xl py-20">
      {/* Header */}
      <div className="mb-12 flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="heading-2 font-heading bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent tracking-tight">
            Welcome, {displayName}
          </h1>
          <Button
            onClick={() => setIsEditingName(true)}
            variant="secondary"
            size="sm"
            radius="pill"
            className="h-8 px-3 gap-1"
            title="Edit name"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Button>
        </div>
        <p className="text-muted max-w-2xl">
          Your personalized intelligence workspace. Build research flows, track jobs and manage agent outputs here.
        </p>
      </div>

      {/* Edit name modal */}
      {isEditingName && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md px-6 py-6">
            <h2 className="heading-5 mb-4">Update Name</h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs uppercase tracking-wide text-white/60 font-medium">
                  Display Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={displayName}
                  className="input"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
              <div className="flex gap-3 pt-1">
                <Button onClick={handleUpdateName} disabled={isLoading} className="flex-1">
                  {isLoading ? 'Updating…' : 'Save'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingName(false);
                    setNewName('');
                    setError('');
                  }}
                  disabled={isLoading}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary actions - uniform cards */}
      <div className="mb-12 grid gap-6 md:grid-cols-2">
        {/* Research CTA */}
        <div className="card bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
          <div className="flex h-full min-h-[220px] flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
                <h2 className="heading-5 text-white">AI Market Research</h2>
              </div>
              <p className="text-white/80 text-sm">
                Create comprehensive market research reports using our multi-agent AI system.
                Analyze companies, research people, and gather competitive intelligence.
              </p>
            </div>
            <Link href="/dashboard/research" className="w-full">
              <Button size="lg" className="w-full font-semibold tracking-tight">
                Start Research
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Voice Sales Agent CTA */}
        <div className="card bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30">
          <div className="flex h-full min-h-[220px] flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-green-400" strokeWidth={1.5} />
                <h2 className="heading-5 text-white">Voice Sales Agent</h2>
              </div>
              <p className="text-white/80 text-sm">
                Create AI voice agents that use your research data for sales conversations.
                Get a link to talk with your personalized voice agent.
              </p>
            </div>
            <Link href="/dashboard/voice" className="w-full">
              <Button size="lg" className="w-full font-semibold tracking-tight">
                Create Voice Agent
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-12 pt-8 border-t border-white/10">
        <h3 className="text-sm font-medium text-white/80 mb-4">Quick Links</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/research">
            <Button variant="secondary" size="sm">
              Research Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/voice">
            <Button variant="secondary" size="sm">
              Voice Sales Agent
            </Button>
          </Link>
          <Link href="/dashboard/research" className="opacity-60 pointer-events-none">
            <Button variant="secondary" size="sm" disabled>
              Analytics (Coming Soon)
            </Button>
          </Link>
          <Link href="/dashboard/research" className="opacity-60 pointer-events-none">
            <Button variant="secondary" size="sm" disabled>
              Templates (Coming Soon)
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
