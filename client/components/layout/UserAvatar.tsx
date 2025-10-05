"use client";
import React from "react";
import { useAuth } from "@/appwrite/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from 'react';

export default function UserAvatar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!panelRef.current || !btnRef.current) return;
      if (!panelRef.current.contains(e.target as Node) && !btnRef.current.contains(e.target as Node)) {
        close();
      }
    }
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open, close]);

  if (!user) return null;
  const letter = (user.email || '?').charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(o=>!o)}
        onKeyDown={(e)=>{ if(e.key==='ArrowDown'){ setOpen(true); panelRef.current?.querySelector<HTMLElement>('a,button')?.focus(); } }}
        className="h-9 w-9 rounded-full flex items-center justify-center font-brand text-base backdrop-blur-md bg-white/10 border border-white/20 shadow-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User menu"
      >
        {letter}
      </button>
      {open && (
        <div
          ref={panelRef}
          role="menu"
          className="origin-top-right animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 absolute right-0 mt-2 w-52 rounded-xl border border-white/12 bg-[rgba(22,22,22,0.72)] backdrop-blur-2xl shadow-lg p-2 ring-1 ring-white/10 focus:outline-none"
        >
          <div className="px-2 py-1.5 text-[11px] uppercase tracking-wide text-muted/80">Signed in</div>
          <p className="text-xs px-3 py-1 mb-1 rounded font-medium bg-white/5 border border-white/10 truncate" title={user.email}>{user.email}</p>
          <div className="h-px my-2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <Link href="/dashboard" role="menuitem" onClick={close} className="block text-sm px-3 py-1.5 rounded-md hover:bg-white/10 focus:bg-white/10 focus:outline-none">Dashboard</Link>
          <button role="menuitem" onClick={async ()=>{ await logout(); close(); router.push('/'); }} className="w-full text-left text-sm px-3 py-1.5 rounded-md hover:bg-red-500/15 hover:text-red-300 focus:outline-none focus:bg-red-500/15 mt-1">Sign out</button>
        </div>
      )}
    </div>
  );
}
