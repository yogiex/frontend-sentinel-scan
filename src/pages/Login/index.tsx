import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/shared/ui/FormField';
import { useAppDispatch } from '@/store';
import { mockLogin } from '@/store/slices/authSlice';

const loginSchema = z.object({
  email: z.string().min(1, 'Enter your email').email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const nextPath = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    setError(null);
    try {
      await dispatch(
        mockLogin({ username: values.email, password: values.password }),
      ).unwrap();
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Sign in failed. Check your email and password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Kiri: pernyataan produk + jejak mesin */}
      <aside className="hidden flex-col justify-between border-r border-[var(--rule)] bg-[var(--surface)] p-10 lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-sm bg-[var(--ink)] text-xs font-semibold text-white">
            S
          </span>
          <span className="text-sm font-semibold text-[var(--ink)]">SentinelScan</span>
        </div>

        <div className="max-w-[46ch]">
          <h1 className="text-3xl font-semibold leading-tight text-[var(--ink)]">
            Every finding keeps its evidence.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--steel)]">
            Scan the perimeter, open each result down to the raw request and response, and hand the
            fix to the team that owns it.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--rule)]">
            {[
              { k: 'Engines', v: 'Nmap · OpenVAS · Nikto' },
              { k: 'Evidence', v: 'HTTP req/res' },
              { k: 'Findings', v: 'CVE + CVSS' },
              { k: 'Audit', v: 'append-only log' },
            ].map((row) => (
              <div key={row.k} className="bg-[var(--paper)] px-3 py-2.5">
                <dt className="text-xs text-[var(--steel)]">{row.k}</dt>
                <dd className="mt-0.5 font-mono text-xs text-[var(--ink)]">{row.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="font-mono text-[11px] text-[var(--steel)]">
          Authorised use only. Activity on this system is logged.
        </p>
      </aside>

      {/* Kanan: form */}
      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[26rem]">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <span className="flex size-7 items-center justify-center rounded-sm bg-[var(--ink)] text-xs font-semibold text-white">
              S
            </span>
            <span className="text-sm font-semibold text-[var(--ink)]">SentinelScan</span>
          </div>

          <h2 className="text-xl font-semibold text-[var(--ink)]">Sign in</h2>
          <p className="mt-1 text-sm text-[var(--steel)]">
            Use your workspace account to reach the scan console.
          </p>

          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            {error && (
              <div
                role="alert"
                className="rounded-md border border-[var(--risk-high)] bg-[#FEE2E2] px-3 py-2 text-sm text-[var(--risk-high)]"
              >
                {error}
              </div>
            )}

            <FormField
              id="email"
              label="Email"
              required
              error={form.formState.errors.email?.message}
            >
              {(a11y) => (
                <Input
                  {...a11y}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  placeholder="you@company.com"
                  {...form.register('email')}
                />
              )}
            </FormField>

            <FormField
              id="password"
              label="Password"
              required
              error={form.formState.errors.password?.message}
            >
              {(a11y) => (
                <div className="relative">
                  <Input
                    {...a11y}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="pr-10"
                    {...form.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-[var(--steel)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              )}
            </FormField>

            <div className="flex items-center justify-between">
              <label htmlFor="remember" className="flex cursor-pointer items-center gap-2 text-sm text-[var(--steel)]">
                <Switch
                  id="remember"
                  checked={form.watch('rememberMe') ?? false}
                  onCheckedChange={(v) => form.setValue('rememberMe', v)}
                />
                Keep me signed in
              </label>
              <Link
                to="/forgot-password"
                className="rounded-sm text-sm text-[var(--signal)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting} className="mt-1 w-full">
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
            <span role="status" aria-live="polite" className="sr-only">
              {submitting ? 'Signing in' : ''}
            </span>
          </form>

          <details className="mt-6 rounded-md border border-[var(--rule)] px-3 py-2 text-sm">
            <summary className="cursor-pointer text-[var(--steel)]">Demo accounts</summary>
            <ul className="mt-2 space-y-1 font-mono text-xs text-[var(--steel)]">
              <li>admin@sentinelscan.com · admin</li>
              <li>user@sentinelscan.com · user123</li>
              <li>viewer@sentinelscan.com · viewer123</li>
            </ul>
          </details>

          <p className="mt-6 flex items-center gap-1.5 text-xs text-[var(--steel)]">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Sessions expire after inactivity. Contact an administrator for access.
          </p>
        </div>
      </main>
    </div>
  );
}
