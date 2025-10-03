"use client";

import { useState } from 'react';
import { useAuth } from '../../appwrite/AuthProvider';
import { account } from '../../appwrite/config';
import { Pencil } from 'lucide-react';
import { Button } from '../../components/ui/button';
import Badge from '../../components/ui/badge';

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
          {/* <Badge variant={user?.emailVerification ? 'success' : 'warning'} size="sm">
            {user?.emailVerification ? 'Email Verified' : 'Email Pending'}
          </Badge> */}
        </div>
        <p className="text-muted max-w-2xl">
          Your personalized intelligence workspace. Build research flows, track jobs and manage agent outputs here.
        </p>
      </div>

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

      <div className="grid gap-8 md:grid-cols-2">
        <div className="card">
          <h2 className="heading-5 mb-3">Workspace Overview</h2>
          <p className="text-muted text-sm leading-relaxed">
            Add research jobs, track processing status and explore generated intelligence outputs. This area will evolve
            into your primary operations console.
          </p>
        </div>
        <div className="card">
          <h2 className="heading-5 mb-3">Next Steps</h2>
          <ul className="text-sm space-y-2 text-white/80">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/40" />
              Create a research job module
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/40" />
              Implement async processing + status polling
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/40" />
              Design agent output summaries
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
