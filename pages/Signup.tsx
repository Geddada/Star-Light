
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle2, Star, LogIn, Home, Gem, Sparkles, X, Fingerprint, Scan, Delete } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, login } = useAuth();
  
  const [isLoginView, setIsLoginView] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // Biometric / Passcode State
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'scanning' | 'passcode' | 'success'>('scanning');
  const [passcodeInput, setPasscodeInput] = useState('');
  const timeoutRef = useRef<number | null>(null);

  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    agreeTerms: false
  });
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  // Handle Passcode Logic
  useEffect(() => {
    if (biometricStatus === 'passcode' && passcodeInput.length === 6) {
        if (passcodeInput === '123456') {
            setBiometricStatus('success');
            timeoutRef.current = window.setTimeout(() => {
                completeBiometricLogin();
            }, 1000);
        } else {
            // Shake effect or error could go here
            setPasscodeInput('');
            alert("Incorrect passcode. (Demo Hint: 123456)");
        }
    }
  }, [passcodeInput, biometricStatus]);

  const completeBiometricLogin = () => {
      login({
        name: "Alex Bio",
        email: "alex.bio@starlight.app",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AlexBio",
        isPremium: true
      });
      setShowBiometricModal(false);
  };

  const handleBiometricLogin = () => {
    setShowBiometricModal(true);
    setBiometricStatus('scanning');
    setPasscodeInput('');
    
    // Simulate biometric scan delay
    timeoutRef.current = window.setTimeout(() => {
        // Only transition to success if user hasn't switched to passcode manually
        setBiometricStatus((prev) => {
            if (prev === 'scanning') {
                timeoutRef.current = window.setTimeout(() => {
                    completeBiometricLogin();
                }, 1000);
                return 'success';
            }
            return prev;
        });
    }, 2500);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.agreeTerms) {
      alert("You must agree to the Terms & Conditions to create an account.");
      return;
    }
    setLoadingProvider('email');
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newUser = {
      name: signupForm.fullName,
      email: signupForm.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${signupForm.fullName.replace(/\s/g, '')}`
    };
    login(newUser);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProvider('email');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = {
      name: loginForm.email.split('@')[0],
      email: loginForm.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginForm.email}`
    };
    login(mockUser);
  };

  const handleGoogleAuth = async (redirectPath: string = '/') => {
    setLoadingProvider('google');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const googleUser = {
      name: "Maria Garcia",
      email: "maria.garcia@gmail.com",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=MariaGarcia`,
      isPremium: false,
    };
    
    login(googleUser, false);
    navigate(redirectPath);
  };

  const handleGuestLogin = (userNumber = 1) => {
    setLoadingProvider(`guest${userNumber}`);
    setTimeout(() => {
      login({
        name: userNumber === 1 ? "Guest User" : `Guest User ${userNumber}`,
        avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=GuestUser${userNumber}`,
        email: userNumber === 1 ? "guest@starlight.app" : `guest${userNumber}@starlight.app`,
        isPremium: false,
      });
    }, 500);
  };
  
  const handlePremiumLogin = () => {
    setLoadingProvider('premium');
    setTimeout(() => {
      login({
        name: "Premium User",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=PremiumStarlight`,
        email: "premium@starlight.app",
        isPremium: true,
      });
    }, 500);
  };

  const handleDigitPress = (digit: number) => {
      if (passcodeInput.length < 6) {
          setPasscodeInput(prev => prev + digit);
      }
  };

  const handleBackspace = () => {
      setPasscodeInput(prev => prev.slice(0, -1));
  };
  
  const desktopSignupView = (
    <>
      <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Create an account</h2>
      <p className="text-[var(--text-secondary)] mb-6">Enter your details to get started.</p>
      
      <button
        type="button"
        onClick={() => handleGoogleAuth()}
        disabled={loadingProvider !== null}
        className="w-full py-3 bg-[var(--background-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl hover:bg-[var(--background-tertiary)] transition-all font-semibold flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
      >
        {loadingProvider === 'google' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        {loadingProvider === 'google' ? 'Connecting...' : 'Continue with Google'}
      </button>

      <button
        type="button"
        onClick={handlePremiumLogin}
        disabled={loadingProvider !== null}
        className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black border border-amber-600 rounded-xl hover:brightness-105 transition-all font-semibold flex items-center justify-center gap-3 mt-4 disabled:opacity-70 disabled:cursor-wait"
      >
        {loadingProvider === 'premium' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gem className="w-5 h-5" />}
        {loadingProvider === 'premium' ? 'Logging in...' : 'Continue as Premium User (Demo)'}
      </button>

      <button
        type="button"
        onClick={() => handleGuestLogin(1)}
        disabled={loadingProvider !== null}
        className="w-full py-3 bg-[var(--background-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl hover:bg-[var(--background-tertiary)] transition-all font-semibold flex items-center justify-center gap-3 mt-4 disabled:opacity-70 disabled:cursor-wait"
      >
        {loadingProvider === 'guest1' ? <Loader2 className="w-5 h-5 animate-spin" /> : <User className="w-5 h-5" />}
        {loadingProvider === 'guest1' ? 'Logging in...' : 'Continue as Guest'}
      </button>

      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-[var(--border-primary)]"></div>
        <span className="text-xs text-[var(--text-secondary)] font-bold uppercase">Or sign up with email</span>
        <div className="h-px flex-1 bg-[var(--border-primary)]"></div>
      </div>
      
      <form onSubmit={handleSignupSubmit} className="space-y-5">
        <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <input type="text" required placeholder="Jane Doe" value={signupForm.fullName} onChange={e => setSignupForm({...signupForm, fullName: e.target.value})} className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"/>
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <input type="email" required placeholder="jane@example.com" value={signupForm.email} onChange={e => setSignupForm({...signupForm, email: e.target.value})} className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"/>
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <input type="password" required placeholder="••••••••" value={signupForm.password} onChange={e => setSignupForm({...signupForm, password: e.target.value})} className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"/>
            </div>
        </div>
        <div className="flex items-start gap-3 pt-2">
            <div className="flex items-center h-5">
              <input id="terms" type="checkbox" required checked={signupForm.agreeTerms} onChange={e => setSignupForm({...signupForm, agreeTerms: e.target.checked})} className="w-4 h-4 text-[hsl(var(--accent-color))] bg-[var(--background-primary)] border-[var(--border-primary)] rounded focus:ring-[hsl(var(--accent-color))]"/>
            </div>
            <label htmlFor="terms" className="text-sm text-[var(--text-secondary)]"> I agree to the <button type="button" onClick={() => navigate('/terms')} className="text-[hsl(var(--accent-color))] hover:underline font-medium">Terms & Conditions</button> and <button type="button" onClick={() => navigate('/privacy')} className="text-[hsl(var(--accent-color))] hover:underline font-medium">Privacy Policy</button>.</label>
        </div>
        <button type="submit" disabled={loadingProvider !== null} className="w-full py-3.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-xl hover:brightness-90 transition-all shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-wait">
          {loadingProvider === 'email' ? (<>Creating Account <Loader2 className="w-5 h-5 animate-spin" /></>) : (<>Create Account <ArrowRight className="w-5 h-5" /></>)}
        </button>
      </form>
      <div className="mt-8 text-center border-t border-[var(--border-primary)] pt-6">
          <p className="text-[var(--text-secondary)]"> Already have an account? <button onClick={() => setIsLoginView(true)} className="text-[hsl(var(--accent-color))] font-bold hover:underline">Log In</button></p>
      </div>
    </>
  );

  const desktopLoginView = (
    <>
      <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Welcome Back!</h2>
      <p className="text-[var(--text-secondary)] mb-6">Log in to your account to continue.</p>
      
      <button
        type="button"
        onClick={() => handleGoogleAuth()}
        disabled={loadingProvider !== null}
        className="w-full py-3 bg-[var(--background-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl hover:bg-[var(--background-tertiary)] transition-all font-semibold flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
      >
        {loadingProvider === 'google' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        {loadingProvider === 'google' ? 'Connecting...' : 'Continue with Google'}
      </button>

      <button
        type="button"
        onClick={handlePremiumLogin}
        disabled={loadingProvider !== null}
        className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black border border-amber-600 rounded-xl hover:brightness-105 transition-all font-semibold flex items-center justify-center gap-3 mt-4 disabled:opacity-70 disabled:cursor-wait"
      >
        {loadingProvider === 'premium' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gem className="w-5 h-5" />}
        {loadingProvider === 'premium' ? 'Logging in...' : 'Continue as Premium User (Demo)'}
      </button>

      <button
        type="button"
        onClick={() => handleGuestLogin(1)}
        disabled={loadingProvider !== null}
        className="w-full py-3 bg-[var(--background-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl hover:bg-[var(--background-tertiary)] transition-all font-semibold flex items-center justify-center gap-3 mt-4 disabled:opacity-70 disabled:cursor-wait"
      >
        {loadingProvider === 'guest1' ? <Loader2 className="w-5 h-5 animate-spin" /> : <User className="w-5 h-5" />}
        {loadingProvider === 'guest1' ? 'Logging in...' : 'Continue as Guest'}
      </button>

      <button
        type="button"
        onClick={handleBiometricLogin}
        disabled={loadingProvider !== null}
        className="w-full py-3 bg-[var(--background-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl hover:bg-[var(--background-tertiary)] transition-all font-semibold flex items-center justify-center gap-3 mt-4 disabled:opacity-70 disabled:cursor-wait"
      >
        <Fingerprint className="w-5 h-5 text-[hsl(var(--accent-color))]" />
        <span>Sign in with Passkey</span>
      </button>

      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-[var(--border-primary)]"></div>
        <span className="text-xs text-[var(--text-secondary)] font-bold uppercase">Or log in with email</span>
        <div className="h-px flex-1 bg-[var(--border-primary)]"></div>
      </div>
      
      <form onSubmit={handleLoginSubmit} className="space-y-5">
        <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <input type="email" required placeholder="jane@example.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"/>
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <input type="password" required placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"/>
            </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <label htmlFor="rememberMe" className="flex items-center gap-2 cursor-pointer">
            <input id="rememberMe" type="checkbox" checked={loginForm.rememberMe} onChange={e => setLoginForm({...loginForm, rememberMe: e.target.checked})} className="w-4 h-4 text-[hsl(var(--accent-color))] bg-[var(--background-primary)] border-[var(--border-primary)] rounded focus:ring-[hsl(var(--accent-color))]"/>
            <span className="text-sm text-[var(--text-secondary)]">Remember me</span>
          </label>
          <button type="button" className="text-sm text-[hsl(var(--accent-color))] hover:underline font-medium">Forgot password?</button>
        </div>

        <button type="submit" disabled={loadingProvider !== null} className="w-full py-3.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-xl hover:brightness-90 transition-all shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-wait">
          {loadingProvider === 'email' ? (<>Logging In <Loader2 className="w-5 h-5 animate-spin" /></>) : (<>Log In <LogIn className="w-5 h-5" /></>)}
        </button>
      </form>
      <div className="mt-8 text-center border-t border-[var(--border-primary)] pt-6">
          <p className="text-[var(--text-secondary)]"> Don't have an account? <button onClick={() => setIsLoginView(false)} className="text-[hsl(var(--accent-color))] font-bold hover:underline">Sign Up</button></p>
      </div>
    </>
  );

  return (
    <div className="w-full min-h-full flex items-center justify-center p-6 bg-[var(--background-primary)] overflow-y-auto relative">
      
      {/* Biometric Modal Overlay */}
      {showBiometricModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[var(--background-secondary)] w-full max-w-sm rounded-3xl p-8 border border-[var(--border-primary)] shadow-2xl relative overflow-hidden flex flex-col items-center">
                <button onClick={() => { setShowBiometricModal(false); if (timeoutRef.current) clearTimeout(timeoutRef.current); }} className="absolute top-4 right-4 p-2 hover:bg-[var(--background-tertiary)] rounded-full transition-colors"><X className="w-5 h-5"/></button>
                
                {biometricStatus === 'scanning' && (
                    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 w-full">
                        <div className="w-24 h-24 rounded-full bg-[hsl(var(--accent-color))]/10 flex items-center justify-center mb-6 relative">
                            <Fingerprint className="w-12 h-12 text-[hsl(var(--accent-color))] animate-pulse" />
                            <div className="absolute inset-0 rounded-full border-4 border-[hsl(var(--accent-color))] border-t-transparent animate-spin"></div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Verify it's you</h3>
                        <p className="text-[var(--text-secondary)] mb-8 text-sm">Touch the fingerprint sensor or look at the camera.</p>
                        <button 
                            onClick={() => { setBiometricStatus('passcode'); if (timeoutRef.current) clearTimeout(timeoutRef.current); }} 
                            className="text-[hsl(var(--accent-color))] font-semibold hover:underline bg-[var(--background-tertiary)] px-4 py-2 rounded-lg text-sm w-full"
                        >
                            Use Device Passcode
                        </button>
                    </div>
                )}

                {biometricStatus === 'passcode' && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right w-full">
                        <div className="w-16 h-16 rounded-full bg-[var(--background-tertiary)] flex items-center justify-center mb-6">
                            <Lock className="w-8 h-8 text-[var(--text-secondary)]" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Enter Passcode</h3>
                        <p className="text-[var(--text-secondary)] mb-6 text-sm">Enter your 6-digit device passcode.</p>
                        
                        <div className="flex gap-3 mb-8 justify-center">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className={`w-3 h-3 rounded-full transition-all duration-200 ${passcodeInput.length > i ? 'bg-[hsl(var(--accent-color))] scale-110' : 'bg-[var(--border-primary)]'}`}></div>
                            ))}
                        </div>
                        
                        {/* Virtual Numpad */}
                        <div className="grid grid-cols-3 gap-4 w-full max-w-[260px] mx-auto">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <button key={num} type="button" onClick={() => handleDigitPress(num)} className="h-16 w-16 rounded-full bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] border border-[var(--border-primary)] text-xl font-bold transition-all active:scale-95 flex items-center justify-center">
                                    {num}
                                </button>
                            ))}
                            <div className="h-16 w-16 flex items-center justify-center"></div>
                            <button type="button" onClick={() => handleDigitPress(0)} className="h-16 w-16 rounded-full bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] border border-[var(--border-primary)] text-xl font-bold transition-all active:scale-95 flex items-center justify-center">0</button>
                            <button type="button" onClick={handleBackspace} className="h-16 w-16 rounded-full flex items-center justify-center hover:bg-[var(--background-tertiary)] transition-colors active:scale-95 text-[var(--text-secondary)]"><Delete className="w-6 h-6"/></button>
                        </div>
                    </div>
                )}

                {biometricStatus === 'success' && (
                    <div className="flex flex-col items-center text-center animate-in zoom-in w-full py-10">
                        <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-12 h-12 text-green-500 animate-in zoom-in duration-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Verified!</h3>
                        <p className="text-[var(--text-secondary)]">Signing you in...</p>
                    </div>
                )}
            </div>
        </div>
      )}

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-full text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--background-tertiary)] transition-colors"
        aria-label="Back to Home"
      >
        <Home className="w-4 h-4" />
        <span>Back to Home</span>
      </button>
      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-primary)] bg-[var(--background-secondary)] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Left Side - Visual */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[hsl(var(--accent-color))] to-[#020617] p-12 flex-col justify-between relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/starlightbg/800/1000')] bg-cover opacity-10 mix-blend-overlay"></div>
           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-8">
                <Star className="w-8 h-8 text-red-500 fill-red-500" />
                <span className="font-bold text-2xl text-white tracking-tighter">StarLight</span>
             </div>
             <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
               {isLoginView ? 'Welcome back to the future.' : 'Join the future of content creation.'}
             </h2>
             <p className="text-white/80 text-lg">
               {isLoginView ? 'Log in to continue your journey with Gemini AI.' : 'Create, watch, and discover with the power of Gemini AI.'}
             </p>
           </div>
           
           <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3 text-white/90">
                 <CheckCircle2 className="w-5 h-5 text-green-400" />
                 <span>Unlimited AI Video Ideas</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                 <CheckCircle2 className="w-5 h-5 text-green-400" />
                 <span>Advanced Analytics</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                 <CheckCircle2 className="w-5 h-5 text-green-400" />
                 <span>Monetization Tools</span>
              </div>
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
           <div className="max-w-md mx-auto w-full">
             {isLoginView ? desktopLoginView : desktopSignupView}
           </div>
        </div>
      </div>
    </div>
  );
};
