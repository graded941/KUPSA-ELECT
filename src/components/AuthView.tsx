import React, { useState, useEffect } from 'react';
import { ViewId } from '../types';
import { useVotingStore } from '../context/VotingStore';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Inbox,
  ExternalLink
} from 'lucide-react';
import { dispatchVoterPassEmail } from '../lib/electionService';

interface AuthViewProps {
  onNavigate: (view: ViewId) => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthView({ onNavigate, defaultMode = 'signup' }: AuthViewProps) {
  const { signUp, login, currentUser, getSimulatedEmail, resendEmail } = useVotingStore();

  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [gmailDeliveryStatus, setGmailDeliveryStatus] = useState<'idle' | 'sending' | 'sent' | 'fallback'>('idle');
  const [gmailMsgId, setGmailMsgId] = useState<string | null>(null);

  // Sign up state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('Year 3');
  const [emailTouched, setEmailTouched] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Inbox confirmation state
  const [showInboxConfirm, setShowInboxConfirm] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Log in state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 60-second cooldown timer for resend email
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // If already logged in, redirect to portal
  useEffect(() => {
    if (currentUser) {
      onNavigate('portal');
    }
  }, [currentUser, onNavigate]);

  // Email validation helper
  const isEmailValidKabarak = (email: string) => {
    return email.trim().toLowerCase().endsWith('@kabarak.ac.ke');
  };

  const emailError =
    emailTouched && signupEmail.trim().length > 0 && !isEmailValidKabarak(signupEmail)
      ? 'Use your Kabarak student email ending in @kabarak.ac.ke'
      : null;

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setSignupError(null);

    if (!isEmailValidKabarak(signupEmail)) {
      setSignupError('Use your Kabarak student email ending in @kabarak.ac.ke');
      return;
    }

    if (!fullName.trim()) {
      setSignupError('Please provide your full legal student name');
      return;
    }

    setIsSubmitting(true);
    const res = await signUp(fullName, signupEmail, yearOfStudy);
    setIsSubmitting(false);

    if (!res.success) {
      setSignupError(res.error || 'Failed to create account');
      return;
    }

    // Successfully created account
    const cleanEmail = signupEmail.trim().toLowerCase();
    setRegisteredEmail(cleanEmail);
    setShowInboxConfirm(true);
    setResendCooldown(60);

    // Autonomous passcard dispatch via SMTP server (verve.n.co.ke@gmail.com)
    if (res.password) {
      const generatedPassword = res.password;
      const studentRegNo = res.user?.regNo || (res as any).regNo || `PHARM/2023/${Math.floor(100 + Math.random() * 900).toString().padStart(4, '0')}`;

      dispatchVoterPassEmail({
        studentName: fullName.trim(),
        regNo: studentRegNo,
        yearOfStudy,
        email: cleanEmail,
        passwordCode: generatedPassword,
        pollingStation: 'School of Pharmacy, Kabarak University',
      })
        .then((result) => {
          if (result.success) {
            setGmailDeliveryStatus('sent');
            setGmailMsgId(result.messageId || result.outboxId || 'sent');
          } else {
            setGmailDeliveryStatus('fallback');
          }
        })
        .catch(() => {
          setGmailDeliveryStatus('fallback');
        });
    } else {
      setGmailDeliveryStatus('fallback');
    }
  };

  // Handle Log In
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim()) {
      setLoginError('Please enter your Kabarak email address');
      return;
    }

    if (!loginPassword.trim()) {
      setLoginError('Please enter your account password');
      return;
    }

    setIsSubmitting(true);
    const res = await login(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (!res.success) {
      setLoginError(res.error || 'Invalid credentials');
      return;
    }

    // Success -> onNavigate to portal
    onNavigate('portal');
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setGmailDeliveryStatus('sending');
    setResendCooldown(60);

    const res = await resendEmail(registeredEmail);
    if (res.success) {
      setGmailDeliveryStatus('sent');
      setGmailMsgId('resent');
    } else {
      setGmailDeliveryStatus('fallback');
      if (res.error) {
        setSignupError(res.error);
      }
    }
  };

  const simulatedEmail = getSimulatedEmail(registeredEmail);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border-2 border-border bg-card shadow-card grid lg:grid-cols-12 min-h-[640px]">
        {/* Left Side: Branded Panel (Cream/Orange with dot grid) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#f8f5ee] via-[#faede0] to-[#f4dcc6] text-ink p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border relative overflow-hidden">
          {/* Subtle Dot Grid pattern */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(oklch(0.18 0.01 60 / 0.4) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <img
                src="/kupsa-logo.png"
                alt="KUPSA"
                className="h-12 w-12 rounded-full object-contain bg-white/60 p-1 shadow-xs border border-ink/10"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                  KUPSA Elections 2026
                </span>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Voting Portal
                </h2>
              </div>
            </div>

            <div className="pt-4">
              <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-foreground">
                Secure student democracy,{' '}
                <em className="text-primary italic font-normal">one secret vote.</em>
              </h1>
              <p className="mt-4 text-sm text-foreground/75 leading-relaxed">
                Log in with your certified Kabarak University student credentials to access the 2026 General Elections ballot.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-6 border-t border-ink/10 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-foreground/80 font-medium">
              <GraduationCap className="h-4 w-4 text-primary shrink-0" />
              <span>Restricted exclusively to Kabarak B.Pharm cohorts</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-card">
          {showInboxConfirm ? (
            /* Check Your Inbox Screen */
            <div className="max-w-md mx-auto w-full space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink text-sun border border-white/10 shadow-xs">
                  <Mail className="h-7 w-7" />
                </div>
                <div>
                  <span className="eyebrow text-primary">Registration Confirmed</span>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                    Check your student inbox
                  </h2>
                </div>
              </div>

              {/* Delivery Status Plaque */}
              {gmailDeliveryStatus === 'sent' ? (
                <div className="rounded-2xl border-2 border-emerald-600/30 bg-emerald-500/10 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Official Passcard Dispatched</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-500/20 px-2 py-0.5 rounded">
                      DELIVERED
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                    Your single-token voter password, PDF passcard, and polling calendar reminder have been sent to{' '}
                    <strong className="font-mono underline">{registeredEmail}</strong>.
                  </p>
                  {gmailMsgId && (
                    <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-emerald-700/80 border-t border-emerald-500/20">
                      <span>Dispatch Reference:</span>
                      <span className="font-bold truncate max-w-[200px]">{gmailMsgId}</span>
                    </div>
                  )}
                </div>
              ) : gmailDeliveryStatus === 'sending' ? (
                <div className="rounded-2xl border border-primary/40 bg-primary/10 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                    <span>Dispatching credentials to your inbox...</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Connecting to institutional mail server (<span className="font-mono">verve.n.co.ke@gmail.com</span>) to transmit your sealed voter passcard.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-secondary/60 p-4 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Sealed Password Delivery</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Under constitutional Article 39 rules, voter credentials are exclusively transmitted to your registered student address (<span className="font-mono font-medium text-foreground">{registeredEmail}</span>).
                  </p>
                </div>
              )}

              {/* 3-Step Verification Checklist */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3.5 shadow-xs">
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Next Steps to Access Your Ballot
                </h4>
                <ol className="space-y-3 text-xs">
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-sun text-[10px] font-mono font-bold">1</span>
                    <span className="text-foreground/90 leading-tight">
                      Open your <strong className="font-mono text-foreground">@kabarak.ac.ke</strong> university webmail or Gmail app.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-sun text-[10px] font-mono font-bold">2</span>
                    <span className="text-foreground/90 leading-tight">
                      Locate the email from <strong className="text-foreground">KUPSA Electoral Commission</strong> (subject: <em>Official KUPSA Voter Passcard</em>).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-sun text-[10px] font-mono font-bold">3</span>
                    <span className="text-foreground/90 leading-tight">
                      Copy the unique access password from the email and proceed to login below.
                    </span>
                  </li>
                </ol>
              </div>

              {/* Primary Actions */}
              <div className="space-y-3 pt-1">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-ink py-3 px-4 text-xs font-semibold text-ink-foreground shadow-xs hover:bg-primary transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open Kabarak Webmail / Gmail Inbox</span>
                </a>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                      resendCooldown > 0
                        ? 'text-muted-foreground cursor-not-allowed'
                        : 'text-primary hover:underline cursor-pointer'
                    }`}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                    <span>
                      {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend Passcard Email'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail(registeredEmail);
                      setLoginPassword('');
                      setShowInboxConfirm(false);
                      setMode('login');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>Proceed to Log In</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Security Policy Reminder */}
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                Didn't receive an email? Check your <strong>Spam / Junk</strong> folder. Passwords are never revealed on-screen to protect vote integrity.
              </p>
            </div>
          ) : (
            /* Main Form with Log In / Sign Up Toggle */
            <div className="max-w-md mx-auto w-full space-y-6">
              {/* Tab Selector */}
              <div className="flex rounded-xl bg-secondary/80 p-1 border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLoginError(null);
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-card text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setSignupError(null);
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-card text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {mode === 'signup' ? (
                /* Sign Up Form */
                <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-foreground">
                      Create student voter account
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Requires an authentic Kabarak Pharmacy student email address.
                    </p>
                  </div>

                  {signupError && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Cynthia Moraa"
                        className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Kabarak Email */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Kabarak Student Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onBlur={() => setEmailTouched(true)}
                        onChange={(e) => {
                          setSignupEmail(e.target.value);
                          if (signupError) setSignupError(null);
                        }}
                        placeholder="e.g. cmoraa23@kabarak.ac.ke"
                        className={`w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all ${
                          emailError
                            ? 'border-destructive bg-destructive/5 focus:border-destructive'
                            : 'border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }`}
                      />
                    </div>
                    {emailError && (
                      <p role="alert" aria-live="polite" className="mt-1 text-xs font-medium text-destructive">
                        {emailError}
                      </p>
                    )}
                  </div>

                  {/* Year of Study */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Year of Study
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <select
                        value={yearOfStudy}
                        onChange={(e) => setYearOfStudy(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      >
                        <option value="Year 1">Year 1 (Freshman)</option>
                        <option value="Year 2">Year 2 (Sophomore)</option>
                        <option value="Year 3">Year 3 (Junior)</option>
                        <option value="Year 4">Year 4 (Senior)</option>
                        <option value="Year 5">Year 5 (Clinical Intern)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-semibold text-ink-foreground shadow-pop hover:bg-primary transition-all cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Verifying with Registrar...' : 'Create account'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-[11px] text-muted-foreground text-center pt-2">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-semibold text-primary underline"
                    >
                      Log in here
                    </button>
                  </p>
                </form>
              ) : (
                /* Log In Form */
                <form onSubmit={handleLogin} className="space-y-4" noValidate>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-foreground">
                      Student Voter Log In
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Enter your credentials to access the 2026 general election ballot.
                    </p>
                  </div>

                  {loginError && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Kabarak Student Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          if (loginError) setLoginError(null);
                        }}
                        placeholder="e.g. john.doe@kabarak.ac.ke"
                        className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Password with Show/Hide toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-foreground">
                        Account Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signup');
                        }}
                        className="text-[11px] text-primary hover:underline"
                      >
                        Need password? Sign up
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          if (loginError) setLoginError(null);
                        }}
                        placeholder="Enter password"
                        className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-2.5 p-1 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Passwords are sent to your Kabarak email. Check spam if you don't see it.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-semibold text-ink-foreground shadow-pop hover:bg-primary transition-all cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : 'Log in to ballot'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {/* Demo Account Helper */}
                  <div className="pt-3 border-t border-border">
                    <p className="text-[11px] font-mono text-muted-foreground mb-2 text-center">
                      Accredited Demonstration Accounts:
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail('john.doe@kabarak.ac.ke');
                          setLoginPassword('KUP-2026');
                          setLoginError(null);
                        }}
                        className="text-left text-xs p-2 rounded-lg bg-secondary/60 hover:bg-accent/40 border border-border flex items-center justify-between"
                      >
                        <span className="font-mono text-foreground font-medium">john.doe@kabarak.ac.ke</span>
                        <span className="text-[10px] font-mono text-primary font-semibold bg-card px-1.5 py-0.5 rounded">Eligible (Not Voted)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail('sarah.cherono@kabarak.ac.ke');
                          setLoginPassword('KUP-2026');
                          setLoginError(null);
                        }}
                        className="text-left text-xs p-2 rounded-lg bg-secondary/60 hover:bg-accent/40 border border-border flex items-center justify-between"
                      >
                        <span className="font-mono text-foreground font-medium">sarah.cherono@kabarak.ac.ke</span>
                        <span className="text-[10px] font-mono text-muted-foreground bg-card px-1.5 py-0.5 rounded">Already Voted State</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
