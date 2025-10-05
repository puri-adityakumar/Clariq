"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import { useAuth } from "@/appwrite/AuthProvider";
import { usePathname } from "next/navigation";

// Only keep links that currently exist on the landing page. Removed non-functional placeholders.
const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#use-cases", label: "Use Cases" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={false}
        animate={scrolled ? { backdropFilter: "blur(22px) saturate(160%)", backgroundColor: "rgba(15,15,15,0.72)" } : { backdropFilter: "blur(0px)", backgroundColor: "rgba(15,15,15,0.0)" }}
        transition={{ duration: 0.5, ease: [0.65, 0.05, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-50 border-b border-white/10" >
        <div className="mx-auto max-w-7xl px-6 flex h-16 items-center">
          {/* Left: Brand */}
          <div className="flex flex-1">
            <Link href="/" className="font-brand text-[1.55rem] tracking-[0.04em] font-normal relative select-none">
              <span className="relative inline-block">
                clariq
                <span className="absolute -inset-1 rounded-md bg-white/0" />
              </span>
            </Link>
          </div>
          {/* Center: Nav */}
          {!isDashboard && (
            <nav className="hidden md:flex items-center gap-10 text-sm flex-1 justify-center">
              {navLinks.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-muted hover:text-foreground transition-colors font-medium tracking-tight"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          )}
          {/* Right: Auth / CTA */}
            <div className="flex flex-1 justify-end items-center gap-3">
              {!loading && !user && (
                <Button asChild size="sm" className="hidden md:inline-flex">
                  <Link href="/signin">Sign In</Link>
                </Button>
              )}
              {!loading && user && <UserAvatar />}
              {/* Mobile menu button */}
              <button
                onClick={() => setOpen(o => !o)}
                className="md:hidden relative h-9 w-9 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
              >
                <span className="sr-only">Toggle navigation</span>
                <div className="space-y-1.5">
                  <span className={`block h-0.5 w-5 bg-white transition-all ${open ? 'translate-y-2 rotate-45' : ''}`}></span>
                  <span className={`block h-0.5 w-5 bg-white transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`block h-0.5 w-5 bg-white transition-all ${open ? '-translate-y-2 -rotate-45' : ''}`}></span>
                </div>
              </button>
            </div>
        </div>
        <AnimatePresence>
          {open && !isDashboard && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.65, 0.05, 0.36, 1] }}
              className="md:hidden overflow-hidden border-t border-white/10 bg-[rgba(15,15,15,0.9)] backdrop-blur-xl"
            >
              <div className="px-6 py-6 flex flex-col gap-4 text-sm">
                {navLinks.map(l => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-muted hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
                {!loading && !user && (
                  <Button
                    asChild
                    size="lg"
                    className="mt-2"
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/signin">Sign In</Link>
                  </Button>
                )}
                {!loading && user && (
                  <div className="mt-2">
                    <Link href="/dashboard" onClick={()=>setOpen(false)} className="block text-sm px-2 py-2 rounded bg-white/10 text-center">Dashboard</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      {/* Offset spacer so content not hidden behind fixed header */}
      <div aria-hidden className="h-16" />
    </>
  );
}
