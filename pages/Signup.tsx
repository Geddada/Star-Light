
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle2, LogIn, Home, Gem, Fingerprint, Delete, ShieldCheck, Shield, Phone, ChevronDown, X, Send, RefreshCw, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { COUNTRY_CODES } from '../constants';
import { createPortal } from 'react-dom';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, login } = useAuth();
  
  const [isLoginView, setIsLoginView] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // Secret Admin Access Check
  const isLeadAdminRoute = location.pathname === '/lead-admin';
  const showLeadAccess = new URLSearchParams(location.search).get('access') === 'lead_admin' || isLeadAdminRoute;
  const [isLoadingLead, setIsLoadingLead] = useState(false);

  // Biometric / Passcode State
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'scanning' | 'passcode' | 'success'>('scanning');
  const [passcodeInput, setPasscodeInput] = useState('');
  const timeoutRef = useRef<number | null>(null);

  // Security CAPTCHA State
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0 });
  const [captchaInput, setCaptchaInput] = useState('');
  const [website, setWebsite] = useState('');

  // Mobile Login State
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [mobileError, setMobileError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

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

  // Initialize CAPTCHA
  useEffect(() => {
    regenerateCaptcha();
  }, []);

  // Timer for OTP Resend
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
        interval = setInterval(() => {
            setResendTimer((prev) => prev - 1);
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const regenerateCaptcha = () => {
    setCaptcha({ 
        num1: Math.floor(Math.random() * 10), 
        num2: Math.floor(Math.random() * 10) 
    });
    setCaptchaInput('');
  };

  // Handle Passcode Logic
  useEffect(() => {
    if (biometricStatus === 'passcode' && passcodeInput.length === 6) {
        if (passcodeInput === '123456') {
            setBiometricStatus('success');
            timeoutRef.current = window.setTimeout(() => {
                completeBiometricLogin();
            }, 1000);
        } else {
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
    
    timeoutRef.current = window.setTimeout(() => {
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
    
    if (website) {
        console.warn("Bot detected via honeypot.");
        return; 
    }

    if (!signupForm.agreeTerms) {
      alert("You must agree to the Terms & Conditions to create an account.");
      return;
    }

    if (signupForm.password.length < 8) {
        alert("Security Alert: Password must be at least 8 characters long.");
        return;
    }
    if (!/\d/.test(signupForm.password)) {
        alert("Security Alert: Password must contain at least one number.");
        return;
    }

    if (parseInt(captchaInput, 10) !== captcha.num1 + captcha.num2) {
        alert("Incorrect security answer. Please prove you are human.");
        regenerateCaptcha();
        return;
    }

    const allUsersJSON = localStorage.getItem('starlight_all_users');
    if (allUsersJSON) {
        const allUsers = JSON.parse(allUsersJSON);
        const nameExists = allUsers.some((u: any) => u.name.trim().toLowerCase() === signupForm.fullName.trim().toLowerCase());
        
        if (nameExists) {
            alert("Account name already exists. Please choose a different name.");
            return;
        }
    }

    setLoadingProvider('email');
    await new Promise(resolve => setTimeout(resolve, 1500));
    const cleanName = signupForm.fullName.replace(/<[^>]*>?/gm, "").trim();
    
    const newUser = {
      name: cleanName,
      email: signupForm.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanName.replace(/\s/g, '')}`
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
    // Fix: Pass rememberMe state
    login(mockUser, true, loginForm.rememberMe);
  };

  const handleForgotPassword = () => {
      if (!loginForm.email) {
          alert("Please enter your email address first to reset your password.");
          return;
      }
      // Simulate sending email
      alert(`A password reset link has been sent to ${loginForm.email}. Check your inbox!`);
  };

  const handleSendMobileOtp = () => {
    setMobileError('');
    if (!mobileNumber || mobileNumber.length < 5) {
        setMobileError('Please enter a valid mobile number.');
        return;
    }
    
    setLoadingProvider('mobile');
    
    setTimeout(() => {
        setLoadingProvider(null);
        setIsOtpSent(true);
        setResendTimer(30);
    }, 1500);
  };

  const handleMobileLogin = () => {
    setMobileError('');
    if (otp !== '123456') {
        setMobileError('Invalid OTP. Please use 123456.');
        return;
    }

    setLoadingProvider('mobile');

    setTimeout(() => {
        const fullNumber = countryCode + mobileNumber;
        const detailsJson = localStorage.getItem('starlight_profile_details');
        const usersJson = localStorage.getItem('starlight_all_users');
        
        let foundUser = null;

        if (detailsJson && usersJson) {
            const details = JSON.parse(detailsJson);
            const users = JSON.parse(usersJson);
            const userEmail = Object.keys(details).find(email => details[email].mobileNumber === fullNumber);
            if (userEmail) {
                foundUser = users.find((u: any) => u.email === userEmail);
            }
        }

        if (foundUser) {
            login(foundUser);
        } else {
            // Mock user if not found in DB for demo purposes
            login({
                name: "Mobile User",
                email: `mobile_${mobileNumber}@starlight.app`,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mobileNumber}`,
                isPremium: false
            });
        }
    }, 1000);
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

  const handleLeadAdminLogin = () => {
    setIsLoadingLead(true);
    setTimeout(() => {
        login({
            name: "Admin",
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=AdminStarlight`,
            email: "admin@starlight.app"
        });
    }, 600);
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

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
            type="button"
            onClick={handlePremiumLogin}
            disabled={loadingProvider !== null}
            className="py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black border border-amber-600 rounded-xl hover:brightness-105 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait text-sm"
        >
            {loadingProvider === 'premium' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gem className="w-4 h-4" />}
            {loadingProvider === 'premium' ? 'Logging in...' : 'Premium User'}
        </button>

        <button
            type="button"
            onClick={() => handleGuestLogin(1)}
            disabled={loadingProvider !== null}
            className="py-3 bg-[var(--background-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl hover:bg-[var(--background-tertiary)] transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait text-sm"
        >
            {loadingProvider === 'guest1' ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
            {loadingProvider === 'guest1' ? 'Logging in...' : 'Guest User'}
        </button>
      </div>

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
        <span className="text-xs text-[var(--text-secondary)] font-bold uppercase">Or sign up with email</span>
        <div className="h-px flex-1 bg-[var(--border-primary)]"></div>
      </div>
      
      <form onSubmit={handleSignupSubmit} className="space-y-5">
        <input 
            type="text" 
            name="website" 
            value={website} 
            onChange={(e) => setWebsite(e.target.value)} 
            style={{ position: 'absolute', opacity: 0, zIndex: -1, width: 0, height: 0 }} 
            tabIndex={-1} 
            autoComplete="off"
        />

        <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <input 
                type="text" 
                required 
                name="name"
                autoComplete="name"
                placeholder="Jane Doe" 
                value={signupForm.fullName} 
                onChange={e => setSignupForm({...signupForm, fullName: e.target.value})} 
                className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
              />
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <input 
                type="email" 
                required 
                name="email"
                autoComplete="email"
                placeholder="jane@example.com" 
                value={signupForm.email} 
                onChange={e => setSignupForm({...signupForm, email: e.target.value})} 
                className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
              />
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-secondary)]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <input 
                type="password" 
                required 
                name="password"
                autoComplete="new-password"
                placeholder="•••••••• (Min 8 chars)" 
                value={signupForm.password} 
                onChange={e => setSignupForm({...signupForm, password: e.target.value})} 
                className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
              />
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">Must be at least 8 characters with at least one number.</p>
        </div>

        <div className="p-3 rounded-lg bg-[var(--background-tertiary)]/50 border border-[var(--border-primary)] flex items-center justify-between">
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-sm font-semibold text-[var(--text-secondary)]">Security Check:</span>
                <span className="font-bold text-[var(--text-primary)]">{captcha.num1} + {captcha.num2} = ?</span>
            </div>
            <input 
                type="number" 
                required 
                placeholder="Answer"
                value={captchaInput}
                onChange={e => setCaptchaInput(e.target.value)}
                className="w-20 p-2 text-center bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
            />
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
          <p className="text-[var(--text-secondary)]"> {isLoginView ? 'Don\'t have an account?' : 'Already have an account?'} <button onClick={() => setIsLoginView(true)} className="text-[hsl(var(--accent-color))] font-bold hover:underline">{isLoginView ? 'Sign Up' : 'Log In'}</button></p>
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

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
            type="button"
            onClick={handlePremiumLogin}
            disabled={loadingProvider !== null}
            className="py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black border border-amber-600 rounded-xl hover:brightness-105 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait text-sm"
        >
            {loadingProvider === 'premium' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gem className="w-4 h-4" />}
            {loadingProvider === 'premium' ? 'Logging in...' : 'Premium User'}
        </button>

        <button
            type="button"
            onClick={() => handleGuestLogin(1)}
            disabled={loadingProvider !== null}
            className="py-3 bg-[var(--background-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl hover:bg-[var(--background-tertiary)] transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait text-sm"
        >
            {loadingProvider === 'guest1' ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
            {loadingProvider === 'guest1' ? 'Logging in...' : 'Guest User'}
        </button>
      </div>

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
        <span className="text-xs text-[var(--text-secondary)] font-bold uppercase">Or log in with</span>
        <div className="h-px flex-1 bg-[var(--border-primary)]"></div>
      </div>

      {/* Login Method Tabs */}
      <div className="flex bg-[var(--background-primary)] p-1 rounded-xl border border-[var(--border-primary)] mb-5">
        <button type="button" onClick={() => setLoginMethod('email')} className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${loginMethod === 'email' ? 'bg-[hsl(var(--accent-color))] text-white' : 'hover:bg-[var(--background-tertiary)]'}`}>Email</button>
        <button type="button" onClick={() => setLoginMethod('mobile')} className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${loginMethod === 'mobile' ? 'bg-[hsl(var(--accent-color))] text-white' : 'hover:bg-[var(--background-tertiary)]'}`}>Mobile</button>
      </div>

      {loginMethod === 'email' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text-secondary)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                <input 
                  type="email" 
                  required 
                  name="email"
                  autoComplete="email"
                  placeholder="jane@example.com" 
                  value={loginForm.email} 
                  onChange={e => setLoginForm({...loginForm, email: e.target.value})} 
                  className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                />
              </div>
          </div>
          <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text-secondary)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                <input 
                  type="password" 
                  required 
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••" 
                  value={loginForm.password} 
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
                  className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                />
              </div>
          </div>
          <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" checked={loginForm.rememberMe} onChange={e => setLoginForm({...loginForm, rememberMe: e.target.checked})} className="w-4 h-4 text-[hsl(var(--accent-color))] bg-[var(--background-primary)] border-[var(--border-primary)] rounded focus:ring-[hsl(var(--accent-color))]"/>
                <label htmlFor="remember-me" className="ml-2 text-sm text-[var(--text-secondary)]">Remember me</label>
              </div>
              <button type="button" onClick={handleForgotPassword} className="text-sm text-[hsl(var(--accent-color))] hover:underline font-medium">Forgot Password?</button>
          </div>
          <button type="submit" disabled={loadingProvider !== null} className="w-full py-3.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-xl hover:brightness-90 transition-all shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-wait">
            {loadingProvider === 'email' ? (<>Logging in <Loader2 className="w-5 h-5 animate-spin" /></>) : (<>Log In <LogIn className="w-5 h-5" /></>)}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
            <div className="relative flex w-full border border-[var(--border-primary)] rounded-xl focus-within:ring-2 focus-within:ring-[hsl(var(--accent-color))] bg-[var(--background-primary)] overflow-hidden">
                <div className="relative">
                    <select value={countryCode} onChange={e => setCountryCode(e.target.value)} disabled={isOtpSent || loadingProvider !== null} className="py-3 pl-3 pr-8 bg-transparent border-r border-[var(--border-primary)] text-[var(--text-secondary)] font-medium text-sm focus:outline-none appearance-none disabled:bg-[var(--background-tertiary)] disabled:text-[var(--text-tertiary)]">
                        {COUNTRY_CODES.map(c => <option key={c.iso} value={c.code}>{c.name} ({c.code})</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                </div>
                <div className="relative flex-grow">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" />
                    <input type="tel" value={mobileNumber} onChange={e => {setMobileNumber(e.target.value); setMobileError('');}} placeholder="Mobile number" disabled={isOtpSent || loadingProvider !== null} className="w-full p-3 pl-10 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none disabled:bg-[var(--background-tertiary)] disabled:text-[var(--text-tertiary)]" />
                </div>
            </div>
            {mobileError && <p className="text-red-500 text-sm">{mobileError}</p>}
            
            {!isOtpSent ? (
                <button type="button" onClick={handleSendMobileOtp} disabled={loadingProvider !== null || !mobileNumber || mobileNumber.length < 5} className="w-full py-3.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-xl hover:brightness-90 transition-all shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-wait">
                    {loadingProvider === 'mobile' ? (<>Sending OTP <Loader2 className="w-5 h-5 animate-spin" /></>) : (<>Send OTP <Send className="w-5 h-5" /></>)}
                </button>
            ) : (
                <div className="space-y-4 animate-in fade-in">
                    <p className="text-sm text-green-500 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> OTP sent to {countryCode} {mobileNumber}.</p>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                        <input type="text" value={otp} onChange={e => {setOtp(e.target.value); setMobileError('');}} placeholder="Enter 6-digit OTP (Hint: 123456)" maxLength={6} className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]" />
                    </div>
                    {mobileError && <p className="text-red-500 text-sm">{mobileError}</p>}
                    <button type="button" onClick={handleMobileLogin} disabled={loadingProvider !== null || otp.length !== 6} className="w-full py-3.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-xl hover:brightness-90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait">
                        {loadingProvider === 'mobile' ? (<>Logging in <Loader2 className="w-5 h-5 animate-spin" /></>) : (<>Log In <LogIn className="w-5 h-5" /></>)}
                    </button>
                    <div className="flex justify-between items-center text-xs mt-1">
                        <p className="text-[var(--text-tertiary)]">
                            Didn't receive OTP?
                        </p>
                        <button
                            type="button"
                            onClick={handleSendMobileOtp}
                            disabled={resendTimer > 0 || loadingProvider !== null}
                            className={`font-semibold flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md ${
                                resendTimer > 0 
                                    ? 'text-[var(--text-tertiary)] cursor-not-allowed bg-[var(--background-tertiary)]' 
                                    : 'text-[hsl(var(--accent-color))] hover:bg-[var(--background-tertiary)]'
                            }`}
                        >
                            {loadingProvider === 'mobile' ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <RefreshCw className={`w-3 h-3 ${resendTimer > 0 ? '' : ''}`} />
                            )}
                            {loadingProvider === 'mobile' ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                        </button>
                    </div>
                </div>
            )}
        </div>
      )}

      <div className="mt-8 text-center border-t border-[var(--border-primary)] pt-6">
          <p className="text-[var(--text-secondary)]"> {isLoginView ? 'Don\'t have an account?' : 'Already have an account?'} <button onClick={() => setIsLoginView(!isLoginView)} className="text-[hsl(var(--accent-color))] font-bold hover:underline">{isLoginView ? 'Sign Up' : 'Log In'}</button></p>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Image/Info (Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-[var(--background-secondary)] relative overflow-hidden flex-col justify-between p-12 border-r border-[var(--border-primary)]">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/starlight-auth/1920/1080')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10">
           <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold tracking-tighter text-[hsl(var(--accent-color))] uppercase font-sans">Star Light</span>
           </div>
        </div>
        <div className="relative z-10 space-y-6">
           <h1 className="text-5xl font-bold leading-tight text-[var(--text-primary)]">Create, Watch, and Discover without limits.</h1>
           <p className="text-xl text-[var(--text-secondary)]">Join the world's most advanced AI-powered video platform today.</p>
        </div>
        <div className="relative z-10 text-sm text-[var(--text-tertiary)]">
           © 2025 Starlight Inc.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-[var(--background-primary)] overflow-y-auto">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--background-tertiary)] transition-colors text-[var(--text-secondary)]"
          aria-label="Go home"
        >
          <Home className="w-6 h-6" />
        </button>

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {isLoginView ? desktopLoginView : desktopSignupView}

           {showLeadAccess && (
              <div className="mt-8 bg-red-500/5 p-6 rounded-2xl border border-red-500/20 text-center animate-in fade-in">
                  <h3 className="text-xl font-bold text-red-500 mb-3 flex items-center justify-center gap-2"><ShieldAlert className="w-6 h-6"/> Lead Admin Access</h3>
                  <p className="text-red-300/80 text-sm mb-4">This is a restricted login for the primary platform administrator.</p>
                  <button 
                      onClick={handleLeadAdminLogin} 
                      disabled={isLoadingLead}
                      className="px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-70 disabled:cursor-wait"
                  >
                      {isLoadingLead ? <Loader2 className="w-5 h-5 animate-spin"/> : <Shield className="w-5 h-5"/>}
                      {isLoadingLead ? 'Accessing...' : 'Access Lead Account'}
                  </button>
              </div>
           )}
        </div>
      </div>

       {showBiometricModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" onClick={() => setShowBiometricModal(false)}>
          <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-[var(--border-primary)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-[var(--border-primary)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-[hsl(var(--accent-color))]" /> Passkey Login
              </h2>
              <button onClick={() => setShowBiometricModal(false)} className="p-2 hover:bg-[var(--background-tertiary)] rounded-full transition-colors">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            <div className="p-6 text-center">
              {biometricStatus === 'scanning' && (
                <div className="animate-in fade-in">
                  <Fingerprint className="w-20 h-20 text-[hsl(var(--accent-color))] mx-auto mb-4 animate-pulse" />
                  <p className="text-xl font-bold mb-2">Scanning Biometrics...</p>
                  <p className="text-[var(--text-secondary)] text-sm">Please touch your fingerprint sensor or look at your device.</p>
                </div>
              )}
              {biometricStatus === 'success' && (
                <div className="animate-in fade-in">
                  <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4 animate-in zoom-in" />
                  <p className="text-xl font-bold mb-2">Login Successful!</p>
                  <p className="text-[var(--text-secondary)] text-sm">Redirecting...</p>
                </div>
              )}
              {biometricStatus === 'passcode' && (
                <div className="animate-in fade-in">
                  <Lock className="w-20 h-20 text-[hsl(var(--accent-color))] mx-auto mb-4" />
                  <p className="text-xl font-bold mb-2">Enter Passcode</p>
                  <p className="text-[var(--text-secondary)] text-sm mb-4">Biometric login failed. Please enter your 6-digit passcode.</p>
                  <div className="flex justify-center gap-2 mb-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className={`w-8 h-10 border-b-2 ${passcodeInput.length > i ? 'border-[hsl(var(--accent-color))]' : 'border-[var(--border-primary)]'} flex items-center justify-center font-mono text-2xl`}>
                              {passcodeInput[i] || ''}
                          </div>
                      ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
                        <button key={digit} type="button" onClick={() => handleDigitPress(digit)} className="p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-lg font-bold hover:bg-[var(--background-tertiary)]">{digit}</button>
                    ))}
                    <button type="button" onClick={handleBackspace} className="p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-lg font-bold hover:bg-[var(--background-tertiary)]"><Delete className="w-6 h-6 mx-auto text-red-500"/></button>
                    <button type="button" onClick={() => handleDigitPress(0)} className="p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-lg font-bold hover:bg-[var(--background-tertiary)]">0</button>
                    <button type="button" className="p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-lg font-bold hover:bg-[var(--background-tertiary)] opacity-0 cursor-default" disabled></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
