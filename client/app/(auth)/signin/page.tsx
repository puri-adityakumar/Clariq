export default function SignInPage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md space-y-8">
        <h1 className="heading-3 font-heading text-center">Sign In</h1>
        <p className="text-center text-muted font-body text-sm">Authentication wiring (Appwrite) coming soon.</p>
        <form className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs tracking-wide uppercase font-medium text-muted">Email</label>
            <input type="email" required className="w-full px-4 py-2.5 rounded-md bg-white/5 border border-white/15 focus:border-white/40 outline-none transition-colors text-sm" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs tracking-wide uppercase font-medium text-muted">Password</label>
            <input type="password" required className="w-full px-4 py-2.5 rounded-md bg-white/5 border border-white/15 focus:border-white/40 outline-none transition-colors text-sm" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-full">Sign In</button>
        </form>
      </div>
    </main>
  );
}
