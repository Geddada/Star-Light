
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle2, Star, LogIn, Home, Gem, Sparkles, X, Fingerprint, Scan, Delete, ShieldCheck, Shield, Phone, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { COUNTRY_CODES } from '../constants';

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
    login(mockUser);
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
              <input type="password" required placeholder="•••••••• (Min 8 chars)" value={signupForm.password} onChange={e => setSignupForm({...signupForm, password: e.target.value})} className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"/>
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
      <div className="flex bg-[var(--background-primary)] p-1 rounded-xl mb-6 border border-[var(--border-primary)]">
        <button 
            type="button"
            onClick={() => { setLoginMethod('email'); setMobileError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginMethod === 'email' ? 'bg-[hsl(var(--accent-color))] text-white shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
        >
            Email
        </button>
        <button 
            type="button"
            onClick={() => { setLoginMethod('mobile'); setMobileError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginMethod === 'mobile' ? 'bg-[hsl(var(--accent-color))] text-white shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
        >
            Mobile Number
        </button>
      </div>
      
      {loginMethod === 'email' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-5 animate-in fade-in">
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
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); isOtpSent ? handleMobileLogin() : handleSendMobileOtp(); }} className="space-y-5 animate-in fade-in">
            {!isOtpSent ? (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Mobile Number</label>
                        <div className="flex gap-2">
                            <div className="relative w-24 flex-shrink-0">
                                <select 
                                    value={countryCode} 
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))] appearance-none"
                                >
                                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                            </div>
                            <div className="relative flex-1">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                                <input 
                                    type="tel" 
                                    value={mobileNumber} 
                                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))} 
                                    placeholder="Mobile Number" 
                                    className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {mobileError && <p className="text-red-500 text-xs flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> {mobileError}</p>}

                    <button 
                        type="submit" 
                        disabled={loadingProvider !== null || !mobileNumber} 
                        className="w-full py-3.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-xl hover:brightness-90 transition-all shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {loadingProvider === 'mobile' ? (<>Sending OTP... <Loader2 className="w-5 h-5 animate-spin" /></>) : (<>Send OTP <ArrowRight className="w-5 h-5" /></>)}
                    </button>
                </div>
            ) : (
                <div className="space-y-4 animate-in slide-in-from-right">
                    <div className="text-center mb-4">
                        <p className="text-sm text-[var(--text-secondary)]">Enter the 6-digit code sent to</p>
                        <p className="font-bold text-[var(--text-primary)]">{countryCode} {mobileNumber} <button type="button" onClick={() => { setIsOtpSent(false); setOtp(''); }} className="text-[hsl(var(--accent-color))] text-xs ml-2 hover:underline">Change</button></p>
                    </div>

                    <div className="space-y-2">
                        <input 
                            type="text" 
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="123456" 
                            className="w-full p-4 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))] text-center text-2xl tracking-widest font-mono"
                            autoFocus
                        />
                        <div className="text-center text-xs text-[var(--text-tertiary)] mt-2">Hint: Use 123456</div>
                    </div>

                    {mobileError && <p className="text-red-500 text-xs flex items-center gap-1 justify-center"><ShieldCheck className="w-3 h-3"/> {mobileError}</p>}

                    <button 
                        type="submit" 
                        disabled={loadingProvider !== null || otp.length !== 6} 
                        className="w-full py-3.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-xl hover:brightness-90 transition-all shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {loadingProvider === 'mobile' ? (<>Verifying... <Loader2 className="w-5 h-5 animate-spin" /></>) : (<>Verify & Login <ArrowRight className="w-5 h-5" /></>)}
                    </button>
                    
                    <div className="text-center mt-4">
                        <button 
                            type="button" 
                            onClick={handleSendMobileOtp}
                            disabled={resendTimer > 0}
                            className={`text-xs font-semibold ${resendTimer > 0 ? 'text-[var(--text-tertiary)] cursor-not-allowed' : 'text-[hsl(var(--accent-color))] hover:underline'}`}
                        >
                            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                        </button>
                    </div>
                </div>
            )}
        </form>
      )}

      <div className="mt-8 text-center border-t border-[var(--border-primary)] pt-6">
          <p className="text-[var(--text-secondary)]"> Don't have an account? <button onClick={() => setIsLoginView(false)} className="text-[hsl(var(--accent-color))] font-bold hover:underline">Sign Up</button></p>
      </div>
    </>
  );

  // Dedicated Lead Admin Login View - displayed only on specific route
  if (isLeadAdminRoute) {
      return (
          <div className="w-full min-h-full flex flex-col items-center justify-center p-6 bg-[var(--background-primary)]">
              <div className="w-full max-w-md p-8 bg-[var(--background-secondary)] rounded-3xl shadow-2xl border border-red-500/30">
                  <div className="text-center mb-8">
                      <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
                      <h1 className="text-2xl font-bold text-red-600">Lead Admin Access</h1>
                      <p className="text-[var(--text-secondary)] mt-2">Restricted Entry</p>
                  </div>
                  <button 
                    onClick={handleLeadAdminLogin}
                    disabled={isLoadingLead}
                    className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    {isLoadingLead ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    {isLoadingLead ? 'Verifying...' : 'Enter Dashboard'}
                  </button>
                  <button 
                    onClick={() => navigate('/')} 
                    className="mt-6 text-sm text-[var(--text-tertiary)] hover:underline block mx-auto"
                  >
                    Return Home
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full min-h-full flex flex-col items-center justify-center p-6 bg-[var(--background-primary)] overflow-y-auto relative">
      
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
