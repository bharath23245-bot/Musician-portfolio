import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Sparkles, UserPlus, LogIn, Check, KeyRound, ShieldAlert, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authLoginSchema, authSignupSchema } from '../schemas/validation';

interface AdminLoginProps {
  onLoginSuccess: (userName: string) => void;
  onBackToPortfolio: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToPortfolio,
}) => {
  const { signIn, signUp, sendResetEmail } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('Bharath Kannan');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [encryptionStatus, setEncryptionStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Strong password rule checks
  const rules = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);
    
    let score = 0;
    if (hasMinLength) score += 1;
    if (hasUppercase) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecialChar) score += 1;

    return {
      hasMinLength,
      hasUppercase,
      hasNumber,
      hasSpecialChar,
      score,
      isStrong: score === 4,
    };
  }, [password]);

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-600', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];

  const getResolvedName = () => {
    if (name.trim()) return name.trim();
    if (email.includes('@')) {
      const prefix = email.split('@')[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return 'Bharath Kannan';
  };

  const handleGenerateStrongPassword = () => {
    const charsUpper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const charsLower = "abcdefghijkmnpqrstuvwxyz";
    const charsNumbers = "23456789";
    const charsSpecial = "@#$%&*!";
    
    let generated = "";
    generated += charsUpper.charAt(Math.floor(Math.random() * charsUpper.length));
    generated += charsLower.charAt(Math.floor(Math.random() * charsLower.length));
    generated += charsNumbers.charAt(Math.floor(Math.random() * charsNumbers.length));
    generated += charsSpecial.charAt(Math.floor(Math.random() * charsSpecial.length));
    
    const all = charsUpper + charsLower + charsNumbers + charsSpecial;
    for (let i = 0; i < 8; i++) {
      generated += all.charAt(Math.floor(Math.random() * all.length));
    }
    
    setPassword(generated);
    if (authMode === 'signup') {
      setConfirmPassword(generated);
    }
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMode === 'signup') {
      try {
        authSignupSchema.parse({
          name,
          email,
          password,
          confirmPassword,
        });
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'errors' in err) {
          const firstErr = (err as { errors: { message: string }[] }).errors[0];
          setErrorMsg(firstErr.message);
          return;
        }
      }

      setIsLoading(true);
      setEncryptionStatus('Registering admin account in Firebase database...');

      const res = await signUp(email, password, name);
      if (!res.success) {
        setIsLoading(false);
        setEncryptionStatus('');
        setErrorMsg(res.error || 'Failed to register account.');
        return;
      }

      setEncryptionStatus('Admin ID created & authenticated successfully.');
      setTimeout(() => {
        setIsLoading(false);
        setEncryptionStatus('');
        onLoginSuccess(getResolvedName());
      }, 400);
    } else {
      try {
        authLoginSchema.parse({ email, password });
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'errors' in err) {
          const firstErr = (err as { errors: { message: string }[] }).errors[0];
          setErrorMsg(firstErr.message);
          return;
        }
      }

      setIsLoading(true);
      setEncryptionStatus('Validating credentials against Firebase admin table...');

      const res = await signIn(email, password);
      if (!res.success) {
        setIsLoading(false);
        setEncryptionStatus('');
        setErrorMsg(res.error || 'Authentication failed. Please verify your email and password.');
        return;
      }

      setEncryptionStatus('Admin verified. Entering dashboard...');
      setTimeout(() => {
        setIsLoading(false);
        setEncryptionStatus('');
        onLoginSuccess(getResolvedName());
      }, 350);
    }
  };

  const handleQuickLogin = async (customEmail?: string, customPass?: string, customName?: string) => {
    const demoEmail = customEmail || 'bharathkannan563@gmail.com';
    const demoPass = customPass || 'Bharath@2025#Studio';
    const demoName = customName || 'Bharath Kannan';

    setName(demoName);
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    setEncryptionStatus(`Authenticating as ${demoName}...`);

    const signInRes = await signIn(demoEmail, demoPass);
    if (signInRes.success) {
      setIsLoading(false);
      setEncryptionStatus('');
      onLoginSuccess(demoName);
      return;
    }

    // Auto-create admin if not yet present
    const signUpRes = await signUp(demoEmail, demoPass, demoName);
    setIsLoading(false);
    setEncryptionStatus('');
    if (signUpRes.success) {
      onLoginSuccess(demoName);
    } else {
      setErrorMsg(signUpRes.error || 'Unable to authenticate account.');
    }
  };

  const handleQuickDemoLogin = () => {
    handleQuickLogin('bharathkannan563@gmail.com', 'Bharath@2025#Studio', 'Bharath Kannan');
  };

  const handleSendResetEmail = async () => {
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    setForgotError('');
    const res = await sendResetEmail(forgotEmail);
    if (res.success) {
      setForgotSubmitted(true);
    } else {
      setForgotError(res.error || 'Failed to dispatch reset email.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#0e0f12] text-[#e1e3e6] font-sans">
      {/* Left 50%: Visual Stage Backdrop + Brand */}
      <div className="relative w-full md:w-1/2 min-h-[340px] md:min-h-screen bg-[#08090b] flex flex-col justify-end p-8 sm:p-14 lg:p-20 overflow-hidden border-b md:border-b-0 md:border-r border-[#1e2027]">
        {/* Background Visual Montage */}
        <div className="absolute inset-0 z-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full opacity-30 filter grayscale contrast-125">
            <div className="h-full bg-[url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center"></div>
            <div className="hidden md:block h-full bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center"></div>
          </div>
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f12] via-[#0e0f12]/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0e0f12]/40 to-[#0e0f12]"></div>
        </div>

        {/* Back Link */}
        <div className="relative z-10 mb-auto">
          <button
            onClick={onBackToPortfolio}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8e93a3] hover:text-[#c8a251] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Portfolio</span>
          </button>
        </div>

        {/* Brand Display */}
        <div className="relative z-10 space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-white tracking-[0.05em] font-normal uppercase">
            BHARATH KANNAN
          </h1>
          <p className="text-2xl sm:text-3xl font-serif text-[#d2d6e3] font-light">
            Artist Portfolio
          </p>
          <p className="text-2xl sm:text-3xl font-serif text-[#d2d6e3] font-light">
            Management
          </p>
          <div className="w-12 h-0.5 bg-[#424654] mt-3"></div>
        </div>
      </div>

      {/* Right 50%: Login/Signup Form Container */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-[#121316]">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Auth Mode Toggle Tabs */}
          <div className="flex rounded-lg bg-[#181a20] p-1 border border-[#272a33]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${
                authMode === 'signin'
                  ? 'bg-[#c8a251] text-[#0b0c0e] shadow-md'
                  : 'text-[#8e93a3] hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>SIGN IN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg('');
                if (name === 'Bharath Kannan') setName('');
                if (email === 'manager@maestro.io') setEmail('');
                if (password === 'Maestro@2025#Studio') setPassword('');
              }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${
                authMode === 'signup'
                  ? 'bg-[#c8a251] text-[#0b0c0e] shadow-md'
                  : 'text-[#8e93a3] hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>CREATE ACCOUNT</span>
            </button>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-serif text-white font-normal">
              {authMode === 'signin' ? 'Welcome Back' : 'Create Artist Account'}
            </h2>
            <p className="text-sm text-[#878c9c]">
              {authMode === 'signin'
                ? 'Enter your credentials to access the admin dashboard.'
                : 'Set up your name and credentials to manage your live portfolio.'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Name / Full Name Field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-[#8e93a3] uppercase tracking-wider">
                {authMode === 'signup' ? 'FULL NAME / ARTIST NAME *' : 'USER NAME / FULL NAME'}
              </label>
              <div className="relative">
                <input
                  id="admin-login-name"
                  type="text"
                  required={authMode === 'signup'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bharath Kannan"
                  className="w-full bg-[#181a20] border border-[#272a33] focus:border-[#c8a251] rounded-md px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
              {authMode === 'signup' && (
                <p className="text-[10px] text-[#717686]">
                  This name will automatically appear as the featured artist on your Public Portfolio & Admin Dashboard.
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-[#8e93a3] uppercase tracking-wider">
                EMAIL ADDRESS *
              </label>
              <div className="relative">
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@maestro.io"
                  className="w-full bg-[#181a20] border border-[#272a33] focus:border-[#c8a251] rounded-md px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-[#8e93a3] uppercase tracking-wider">
                  PASSWORD *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateStrongPassword}
                  className="text-[11px] text-[#c8a251] hover:text-[#e4be68] flex items-center gap-1 transition-colors"
                  title="Generate a secure strong password"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Generate Strong</span>
                </button>
              </div>

              <div className="relative">
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Create or enter your password"
                  className="w-full bg-[#181a20] border border-[#272a33] focus:border-[#c8a251] rounded-md px-4 py-3 pr-11 text-sm text-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#686d7c] hover:text-white transition-colors"
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Real-time Password Strength Meter */}
              {password.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#808595]">Password Strength:</span>
                    <span className={`font-semibold ${
                      rules.score === 4 ? 'text-emerald-400' :
                      rules.score === 3 ? 'text-blue-400' :
                      rules.score === 2 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {strengthLabels[rules.score]}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#20222a] rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          rules.score >= step
                            ? strengthColors[rules.score]
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Password Requirements Checklist */}
              <div className="p-3 rounded-lg bg-[#16181e] border border-[#232630] space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#a6abbd] uppercase tracking-wider">
                    Strong Password Guidelines
                  </span>
                  <span className="text-[10px] text-[#696e7e]">
                    {rules.score}/4 Criteria Met
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {/* Rule 1: Min 8 chars */}
                  <div className={`flex items-center gap-1.5 transition-colors ${
                    rules.hasMinLength ? 'text-emerald-400 font-medium' : 'text-[#727786]'
                  }`}>
                    {rules.hasMinLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-[#3e4250] flex items-center justify-center flex-shrink-0 text-[9px]">•</div>
                    )}
                    <span>Min. 8 characters</span>
                  </div>

                  {/* Rule 2: Uppercase / Caps */}
                  <div className={`flex items-center gap-1.5 transition-colors ${
                    rules.hasUppercase ? 'text-emerald-400 font-medium' : 'text-[#727786]'
                  }`}>
                    {rules.hasUppercase ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-[#3e4250] flex items-center justify-center flex-shrink-0 text-[9px]">•</div>
                    )}
                    <span>1+ Uppercase (Caps)</span>
                  </div>

                  {/* Rule 3: Number */}
                  <div className={`flex items-center gap-1.5 transition-colors ${
                    rules.hasNumber ? 'text-emerald-400 font-medium' : 'text-[#727786]'
                  }`}>
                    {rules.hasNumber ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-[#3e4250] flex items-center justify-center flex-shrink-0 text-[9px]">•</div>
                    )}
                    <span>1+ Number (0-9)</span>
                  </div>

                  {/* Rule 4: Special character */}
                  <div className={`flex items-center gap-1.5 transition-colors ${
                    rules.hasSpecialChar ? 'text-emerald-400 font-medium' : 'text-[#727786]'
                  }`}>
                    {rules.hasSpecialChar ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-[#3e4250] flex items-center justify-center flex-shrink-0 text-[9px]">•</div>
                    )}
                    <span>1+ Special char (!@#$)</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#101217] border border-[#1e2028] text-[10px] text-[#868b9c]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c8a251] flex-shrink-0" />
                <span>Protected by Google Firebase Authentication & Scrypt encryption</span>
              </div>
            </div>

            {/* Confirm Password (Signup only) */}
            {authMode === 'signup' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-[#8e93a3] uppercase tracking-wider">
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="admin-signup-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full bg-[#181a20] border border-[#272a33] focus:border-[#c8a251] rounded-md px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            {authMode === 'signin' ? (
              <div className="flex items-center justify-between text-xs text-[#878c9c]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#1b1d24] border-[#2e313c] text-[#c8a251] focus:ring-0 focus:ring-offset-0 accent-[#c8a251] cursor-pointer"
                  />
                  <span>Remember session</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[#878c9c]">
                <ShieldCheck className="w-4 h-4 text-[#c8a251]" />
                <span>Instant activation with full administrative privileges</span>
              </div>
            )}

            {/* Encryption & Security Status Display */}
            {encryptionStatus && (
              <div className="flex items-center justify-center gap-2 p-2 rounded bg-[#101914] border border-[#1b3d26] text-xs text-emerald-400 animate-pulse">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{encryptionStatus}</span>
              </div>
            )}

            {/* Gold Submit Button */}
            <button
              id="admin-submit-login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#c8a251] hover:bg-[#d4b059] text-[#0b0c0e] font-bold text-xs uppercase tracking-[0.2em] rounded-sm transition-all shadow-lg active:scale-[0.99] disabled:opacity-75"
            >
              {isLoading
                ? authMode === 'signup'
                  ? 'CREATING FIREBASE ACCOUNT...'
                  : 'AUTHENTICATING SESSION...'
                : authMode === 'signup'
                ? 'CREATE ACCOUNT & SIGN IN'
                : 'LOGIN'}
            </button>
          </form>

          {/* Quick Access Helper Buttons */}
          {authMode === 'signin' && (
            <div className="pt-2 space-y-2">
              <div className="p-3 rounded-lg bg-[#181a21] border border-[#272a35] space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#a5abbd] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#c8a251]" />
                    <span>Instant 1-Click Access</span>
                  </span>
                  <span className="text-[10px] text-[#6e7382]">Pre-configured Admin IDs</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('bharathkannan563@gmail.com', 'Bharath@2025#Studio', 'Bharath Kannan')}
                    className="p-2 rounded bg-[#20222b] hover:bg-[#282b36] border border-[#323644] hover:border-[#c8a251] text-left transition-all group"
                  >
                    <div className="text-xs font-semibold text-white group-hover:text-[#c8a251] flex items-center justify-between">
                      <span>Bharath Kannan</span>
                      <span className="text-[10px] text-[#c8a251]">Login →</span>
                    </div>
                    <div className="text-[10px] text-[#868c9e] truncate">bharathkannan563@gmail.com</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('manager@maestro.io', 'Maestro@2025#Studio', 'Bharath Kannan')}
                    className="p-2 rounded bg-[#20222b] hover:bg-[#282b36] border border-[#323644] hover:border-[#c8a251] text-left transition-all group"
                  >
                    <div className="text-xs font-semibold text-white group-hover:text-[#c8a251] flex items-center justify-between">
                      <span>Studio Manager</span>
                      <span className="text-[10px] text-[#c8a251]">Login →</span>
                    </div>
                    <div className="text-[10px] text-[#868c9e] truncate">manager@maestro.io</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Assistance */}
          <div className="pt-4 border-t border-[#1e2028] text-center text-xs text-[#717686]">
            {authMode === 'signin' ? (
              <span>
                Don’t have an account?{' '}
                <button
                  onClick={() => setAuthMode('signup')}
                  className="text-[#c8a251] hover:underline font-medium ml-1"
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  onClick={() => setAuthMode('signin')}
                  className="text-[#c8a251] hover:underline font-medium ml-1"
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#16171c] border border-[#272933] rounded-xl p-6 text-white space-y-4 shadow-2xl">
            <h3 className="text-xl font-serif">Reset Management Credentials</h3>
            {forgotSubmitted ? (
              <div className="space-y-4 text-center py-4">
                <p className="text-sm text-[#a3a7b6]">
                  A password reset link has been dispatched to <strong className="text-white">{forgotEmail}</strong> via Firebase Auth.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSubmitted(false);
                  }}
                  className="px-5 py-2 bg-[#c8a251] text-[#0b0c0e] font-semibold text-xs rounded"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#8e93a3]">
                  Enter your registered artist management email address to receive password reset instructions.
                </p>
                {forgotError && (
                  <div className="p-2.5 rounded bg-red-950/40 border border-red-800 text-xs text-red-300">
                    {forgotError}
                  </div>
                )}
                <input
                  type="email"
                  placeholder="manager@maestro.io"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-[#1b1d24] border border-[#2c2f3a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c8a251]"
                />
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs text-[#8e93a3] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendResetEmail}
                    className="px-5 py-2 bg-[#c8a251] text-[#0b0c0e] font-semibold text-xs rounded"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
