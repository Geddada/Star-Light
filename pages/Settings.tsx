
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    User, Mail, Phone, CheckCircle2, MapPin, 
    Lock, Send, Languages, KeyRound, ShieldCheck, Video as VideoIcon, 
    RefreshCw, AlertTriangle, ChevronDown, Save, UserX, Trash2, Loader2, Clock, Edit, Shield, LogIn,
    ChevronLeft, ChevronRight, Monitor, Smartphone, LogOut, PlayCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAutoplay } from '../contexts/AutoplayContext';
import { COUNTRY_CODES, INDIAN_STATES, ANDHRA_PRADESH_CITIES, USA_STATES, UK_STATES, ALL_NATIVE_LANGUAGES, COUNTRY_LANGUAGES } from '../constants';
import { ProfileDetails } from '../types';
import { AdminLoginModal } from '../components/AdminLoginModal';

type SettingsTab = 'account' | 'security' | 'api' | 'playback';

const NAV_ITEMS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Login & Security', icon: Lock },
    { id: 'playback', label: 'Playback', icon: PlayCircle },
    { id: 'api', label: 'API Keys', icon: KeyRound },
];

const WhatsAppIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.39 1.88 6.161l-1.334 4.869 4.893-1.309zM9.356 8.014c-.13-.306-.279-.32-1.042-.324-.712-.004-1.393-.243-1.393-.243s-.542.13-.542.13c-.144.06-.144.06-.144.06-.516.216-1.033.972-1.033 2.064 0 1.062.279 2.1.279 2.1s.18.216.516.576c.336.36.456.456 1.448 1.968 1.488 2.209 2.1.279 2.1s.18.216.516.576c.336.36.456.456 1.448 1.968 1.488 2.209 2.133 2.58 3.129 2.928.612.216 1.296.12 1.776-.18.396-.24.516-.54.516-.54s.06-.12.06-.12c0-.06 0-.624-.036-.66-.036-.036-.216-.096-.456-.216-.24-.12-.48-.12-1.116-.36-.456-.156-.812-.12-.812-.12s-.216.06-.396.24c-.18.18-.36.36-.54.36-.18.012-.336-.024-.336-.024s-.276-.12-.516-.24c-.24-.12-.54-.24-.816-.54-.6-.66-1.068-1.344-1.068-1.344s-.06-.096 0-.192c.06-.096.12-.12.18-.18.06.012.276-.24.396-.396.12-.156.18-.24.24-.36.06-.12.12-.24.06-.36-.516-1.2-.516-1.2z"/>
    </svg>
);


const AccountSettings: React.FC<{
    currentUser: any;
    profileDetails: ProfileDetails;
    setProfileDetails: React.Dispatch<React.SetStateAction<ProfileDetails>>;
}> = ({ currentUser, profileDetails, setProfileDetails }) => {
    const { deleteAccount, updateUser } = useAuth();
    const [nameInput, setNameInput] = useState(currentUser.name);
    const [countryCode, setCountryCode] = useState('+91');
    const [mobileInput, setMobileInput] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpMethod, setOtpMethod] = useState<'sms' | 'whatsapp'>('whatsapp');
    const [stateInput, setStateInput] = useState('');
    const [cityInput, setCityInput] = useState('');
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [genderInput, setGenderInput] = useState<ProfileDetails['gender'] | ''>('');
    const [error, setError] = useState('');
    const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [showMobileForm, setShowMobileForm] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Delete Account State
    const [deleteStep, setDeleteStep] = useState<'initial' | 'confirm_otp' | 'deleting'>('initial');
    const [deleteOtpCode, setDeleteOtpCode] = useState('');
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        if (profileDetails) {
            setStateInput(profileDetails.state || '');
            setCityInput(profileDetails.city || '');
            setSelectedLanguages(profileDetails.nativeLanguages || []);
            setGenderInput(profileDetails.gender || '');
            if (profileDetails.mobileNumber) {
                const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
                const foundCode = sortedCodes.find(c => profileDetails.mobileNumber!.startsWith(c.code));
                if(foundCode) {
                    setCountryCode(foundCode.code);
                    setMobileInput(profileDetails.mobileNumber!.substring(foundCode.code.length));
                } else {
                    setMobileInput(profileDetails.mobileNumber!);
                }
            }
        }
        setShowMobileForm(!profileDetails.isMobileVerified);
    }, [profileDetails]);

    useEffect(() => {
        let interval: any;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);
    
    const saveProfileDetails = (details: ProfileDetails) => {
        if (!currentUser?.email) return;
        const allProfileDetailsJSON = localStorage.getItem('starlight_profile_details');
        const allDetails = allProfileDetailsJSON ? JSON.parse(allProfileDetailsJSON) : {};
        allDetails[currentUser.email] = details;
        localStorage.setItem('starlight_profile_details', JSON.stringify(allDetails));
        setProfileDetails(details);
    };

    const handleLanguageChange = (language: string) => {
        setSelectedLanguages(prev => 
            prev.includes(language) 
            ? prev.filter(lang => lang !== language)
            : [...prev, language]
        );
    };

    const handleSaveChanges = () => {
        setSaveStatus('saving');
        
        // Update Auth User Name
        if (nameInput !== currentUser.name) {
            updateUser({ name: nameInput });
        }

        // Update Profile Details
        const newDetails: ProfileDetails = {
            ...profileDetails,
            state: stateInput,
            city: cityInput,
            nativeLanguages: selectedLanguages,
            gender: genderInput || undefined,
        };
        saveProfileDetails(newDetails);
        
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2500);
        }, 1000);
    };

    const handleSendOtp = () => {
        if (!/^\d{5,}$/.test(mobileInput)) {
            setError("Please enter a valid mobile number.");
            return;
        }
        setError('');
        setOtpSuccessMessage('');
        setIsSendingOtp(true);
        
        // Simulate API call delay for sending OTP
        setTimeout(() => {
            setIsSendingOtp(false);
            setOtpSent(true);
            setResendTimer(30);
            const methodLabel = otpMethod === 'whatsapp' ? 'WhatsApp' : 'SMS';
            setOtpSuccessMessage(`We've sent a verification code to ${countryCode} ${mobileInput} via ${methodLabel}.`);
        }, 1500);
    };

    const handleEditNumber = () => {
        setOtpSent(false);
        setOtpSuccessMessage('');
        setError('');
        setResendTimer(0);
        setOtpInput('');
    };

    const handleSubmitOtp = () => {
        if (otpInput === '123456') {
            const countryName = COUNTRY_CODES.find(c => c.code === countryCode)?.name;
            saveProfileDetails({ 
                ...profileDetails, 
                mobileNumber: countryCode + mobileInput, 
                country: countryName,
                isMobileVerified: true 
            });
            setOtpSent(false);
            setOtpInput('');
            setError('');
            setOtpSuccessMessage('');
            setShowMobileForm(false);
        } else {
            setError('Invalid OTP. Please try again. (Hint: use 123456)');
        }
    };

    const initiateDelete = () => {
        if(window.confirm("Are you sure you want to begin the account deletion process? An OTP will be sent to your email to confirm.")) {
            setDeleteStep('confirm_otp');
            // In a real app, an API call would be made here to send an OTP.
            // We simulate this and immediately move to the OTP entry step.
        }
    };
    
    const handleConfirmDelete = () => {
        setDeleteError('');
        if (deleteOtpCode === '123456') {
            setDeleteStep('deleting');
            // Simulate API call delay
            setTimeout(() => {
                deleteAccount();
                // User will be logged out and redirected by deleteAccount function
            }, 1500);
        } else {
            setDeleteError('Invalid OTP. Please try again. (Hint: use 123456)');
        }
    };
    
    const countryForStateDropdown = profileDetails.country || COUNTRY_CODES.find(c => c.code === countryCode)?.name;

    const languagesToDisplay = useMemo(() => {
        const countryName = countryForStateDropdown;
        if (countryName && COUNTRY_LANGUAGES[countryName]) {
            return COUNTRY_LANGUAGES[countryName];
        }
        return ALL_NATIVE_LANGUAGES;
    }, [countryForStateDropdown]);
    
    useEffect(() => {
        setSelectedLanguages(prev => prev.filter(lang => languagesToDisplay.includes(lang)));
    }, [languagesToDisplay]);
    
    return (
        <div className="space-y-8">
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h3 className="text-lg font-bold mb-6">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                            <input 
                                type="text" 
                                value={nameInput} 
                                onChange={(e) => setNameInput(e.target.value)}
                                className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]" 
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                            <input type="email" disabled value={currentUser.email || ''} className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-secondary)] cursor-not-allowed" />
                        </div>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Gender</label>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                            {(['male', 'female', 'prefer_not_to_say'] as const).map(gender => (
                                <label key={gender} className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="gender" value={gender} checked={genderInput === gender} onChange={() => setGenderInput(gender)} className="w-4 h-4 text-[hsl(var(--accent-color))] bg-[var(--background-primary)] border-[var(--border-secondary)] focus:ring-[hsl(var(--accent-color))]"/>
                                    <span className="text-sm font-medium capitalize">{gender.replace('_', ' ')}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Contact Information</h3>
                    {profileDetails.isMobileVerified && !showMobileForm && (
                        <button onClick={() => setShowMobileForm(true)} className="text-sm font-semibold text-[hsl(var(--accent-color))] hover:underline">Change</button>
                    )}
                </div>
                 {!showMobileForm && profileDetails.isMobileVerified ? (
                    <div className="flex items-center gap-3">
                        <div className="relative flex-grow">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                            <input type="tel" value={profileDetails.mobileNumber || ''} disabled className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-secondary)] cursor-not-allowed" />
                        </div>
                        <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-sm font-semibold flex items-center gap-2 border border-green-500/20">
                            <CheckCircle2 className="w-4 h-4" /> Verified
                        </div>
                    </div>
                 ) : (
                    <div className="space-y-4">
                        <div className="relative flex w-full border border-[var(--border-primary)] rounded-lg focus-within:ring-2 focus-within:ring-[hsl(var(--accent-color))] bg-[var(--background-primary)] overflow-hidden">
                            <div className="relative">
                                <select value={countryCode} onChange={e => setCountryCode(e.target.value)} disabled={otpSent} className="py-3 pl-3 pr-8 bg-transparent border-r border-[var(--border-primary)] text-[var(--text-secondary)] font-medium text-sm focus:outline-none appearance-none disabled:bg-[var(--background-tertiary)] disabled:text-[var(--text-tertiary)]">
                                    {COUNTRY_CODES.map(c => <option key={c.iso} value={c.code}>{c.name} ({c.code})</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                            </div>
                            <div className="relative flex-grow">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" />
                                <input type="tel" value={mobileInput} onChange={e => setMobileInput(e.target.value)} placeholder="Mobile number" disabled={otpSent} className="w-full p-3 pl-10 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none disabled:bg-[var(--background-tertiary)] disabled:text-[var(--text-tertiary)]" />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex-1 w-full">
                                <div className="flex gap-2 rounded-lg bg-[var(--background-primary)] p-1 border border-[var(--border-primary)] w-full sm:w-auto">
                                    <button type="button" onClick={() => setOtpMethod('sms')} disabled={otpSent} className={`flex-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${otpMethod === 'sms' ? 'bg-[hsl(var(--accent-color))] text-white' : 'hover:bg-[var(--background-tertiary)]'} ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}>SMS</button>
                                    <button type="button" onClick={() => setOtpMethod('whatsapp')} disabled={otpSent} className={`flex-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${otpMethod === 'whatsapp' ? 'bg-[#25D366] text-white' : 'hover:bg-[var(--background-tertiary)]'} ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}><WhatsAppIcon className="w-4 h-4" /> WhatsApp</button>
                                </div>
                            </div>
                            <button 
                                onClick={otpSent ? handleEditNumber : handleSendOtp} 
                                disabled={isSendingOtp} 
                                className={`px-5 py-3 rounded-lg font-semibold text-sm transition-colors w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 min-w-[160px] ${
                                    otpSent 
                                    ? 'bg-[var(--background-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--border-primary)]'
                                    : otpMethod === 'whatsapp' 
                                        ? 'bg-[#25D366] hover:bg-[#128C7E] text-white' 
                                        : 'bg-[hsl(var(--accent-color))] hover:brightness-90 text-white'
                                }`}
                            >
                                {isSendingOtp ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                                ) : otpSent ? (
                                    <><Edit className="w-4 h-4" /> Change Number</>
                                ) : (
                                    <><Send className="w-4 h-4" /> Send {otpMethod === 'whatsapp' ? 'via WhatsApp' : 'OTP'}</>
                                )}
                            </button>
                        </div>
                        {otpSent && (
                        <div className="mt-4 flex flex-col gap-3 animate-in fade-in">
                            {otpSuccessMessage && (
                                <div className={`p-3 rounded-lg flex items-start gap-3 ${otpMethod === 'whatsapp' ? 'bg-[#25D366]/10 border border-[#25D366]/20 text-[#128C7E]' : 'bg-green-500/10 border border-green-500/20 text-green-600'}`}>
                                    {otpMethod === 'whatsapp' ? <WhatsAppIcon className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                                    <p className="text-sm font-medium">{otpSuccessMessage}</p>
                                </div>
                            )}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <div className="relative flex-grow w-full">
                                    <input 
                                        type="text" 
                                        value={otpInput} 
                                        onChange={(e) => setOtpInput(e.target.value)} 
                                        placeholder="Enter 6-digit code" 
                                        className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))] font-mono tracking-widest text-center"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                                <button 
                                    onClick={handleSubmitOtp} 
                                    className={`px-6 py-3 text-white rounded-lg font-bold text-sm transition-colors w-full sm:w-auto flex-shrink-0 ${
                                        otpMethod === 'whatsapp' ? 'bg-[#25D366] hover:bg-[#128C7E]' : 'bg-[hsl(var(--accent-color))] hover:brightness-90'
                                    }`}
                                >
                                    Verify & Save
                                </button>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-center text-xs mt-1 gap-2">
                                <p className="text-[var(--text-tertiary)]">
                                    Hint: Use code <strong>123456</strong> for this demo.
                                </p>
                                <button
                                    onClick={handleSendOtp}
                                    disabled={resendTimer > 0 || isSendingOtp}
                                    className={`font-semibold flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md ${
                                        resendTimer > 0 
                                            ? 'text-[var(--text-tertiary)] cursor-not-allowed bg-[var(--background-tertiary)]' 
                                            : 'text-[hsl(var(--accent-color))] hover:bg-[var(--background-tertiary)]'
                                    }`}
                                >
                                    {isSendingOtp ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <RefreshCw className={`w-3 h-3 ${resendTimer > 0 ? '' : ''}`} />
                                    )}
                                    {isSendingOtp ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                                </button>
                            </div>
                        </div>
                        )}
                        {error && <p className="text-red-500 text-sm mt-2 animate-in fade-in flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {error}</p>}
                    </div>
                 )}
            </div>

            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h3 className="text-lg font-bold mb-6">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">State</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] z-10" />
                            {countryForStateDropdown === 'United States of America' ? (<><select value={stateInput} onChange={(e) => { setStateInput(e.target.value); setCityInput(''); }} className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))] appearance-none"><option value="">Select State</option>{USA_STATES.map(s => <option key={s} value={s}>{s}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" /></>) : countryForStateDropdown === 'India' ? (<><select value={stateInput} onChange={(e) => { setStateInput(e.target.value); setCityInput(''); }} className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))] appearance-none"><option value="">Select State</option>{INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" /></>) : countryForStateDropdown === 'United Kingdom' ? (<><select value={stateInput} onChange={(e) => { setStateInput(e.target.value); setCityInput(''); }} className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))] appearance-none"><option value="">Select Region/County</option>{UK_STATES.map(s => <option key={s} value={s}>{s}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" /></>) : (<input type="text" value={stateInput} onChange={(e) => setStateInput(e.target.value)} placeholder="e.g. California" className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]" />)}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">City</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] z-10" />
                            {stateInput === 'Andhra Pradesh' ? (<><select value={cityInput} onChange={(e) => setCityInput(e.target.value)} className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))] appearance-none"><option value="">Select City</option>{ANDHRA_PRADESH_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" /></>) : (<input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)} placeholder="e.g. Mumbai" className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]" />)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <div className="flex items-center gap-3 mb-6">
                    <Languages className="w-6 h-6 text-[var(--text-secondary)]" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Native Languages</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4">
                    {languagesToDisplay.map(lang => (
                        <label key={lang} className="flex items-center gap-2.5 cursor-pointer group">
                            <input type="checkbox" checked={selectedLanguages.includes(lang)} onChange={() => handleLanguageChange(lang)} className="w-4 h-4 text-[hsl(var(--accent-color))] bg-[var(--background-primary)] border-[var(--border-secondary)] rounded focus:ring-[hsl(var(--accent-color))] focus:ring-offset-0" />
                            <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{lang}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div id="delete-account" className="bg-red-500/5 p-6 rounded-2xl border border-red-500/20">
                <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5"/> Danger Zone
                </h3>
                <p className="text-red-300/80 text-sm mt-3">
                    Deleting your account is a permanent action. All of your uploaded content,
                    ad campaigns, reports, and personal settings will be permanently removed.
                    This action cannot be undone.
                </p>
                
                {deleteStep === 'initial' && (
                    <div className="mt-6 flex justify-end">
                        <button onClick={initiateDelete} className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all flex items-center gap-2">
                            <Trash2 className="w-4 h-4"/> Delete My Account
                        </button>
                    </div>
                )}
                
                {deleteStep === 'confirm_otp' && (
                    <div className="mt-6 pt-4 border-t border-red-500/20 animate-in fade-in">
                        <p className="font-semibold text-red-400">Enter the 6-digit confirmation code sent to your email to proceed.</p>
                        <p className="text-xs text-red-300/70 mb-4">(For this demo, use the code: <strong className="text-white">123456</strong>)</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={deleteOtpCode}
                                onChange={e => setDeleteOtpCode(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                className="flex-1 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-white placeholder-red-300/50 focus:outline-none focus:ring-2 focus:ring-red-400"
                            />
                            <button onClick={handleConfirmDelete} className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                                Confirm & Delete
                            </button>
                        </div>
                        {deleteError && <p className="text-sm text-yellow-300 mt-2">{deleteError}</p>}
                    </div>
                )}

                {deleteStep === 'deleting' && (
                     <div className="mt-6 pt-4 border-t border-red-500/20 flex items-center justify-center gap-3 text-white">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <p className="font-semibold">Deleting your account data...</p>
                    </div>
                )}
            </div>
            
            <div className="flex justify-end items-center gap-4 pt-4">
                {saveStatus === 'saved' && <p className="text-green-500 text-sm font-semibold animate-in fade-in flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Saved successfully!</p>}
                <button onClick={handleSaveChanges} disabled={saveStatus === 'saving'} className="px-6 py-2.5 bg-[hsl(var(--accent-color))] hover:brightness-90 text-white rounded-lg font-semibold text-sm transition-colors shadow-md flex items-center justify-center gap-2 w-32 disabled:opacity-70">
                    {saveStatus === 'saving' ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Save className="w-4 h-4"/> Save</>}
                </button>
            </div>
        </div>
    );
};

const PlaybackSettings: React.FC = () => {
    const { autoplayEnabled, setAutoplayEnabled } = useAutoplay();

    return (
        <div className="space-y-8">
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><PlayCircle className="w-5 h-5" /> Video Playback</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-sm text-[var(--text-primary)]">Autoplay previews</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">Play videos automatically when hovering over thumbnails.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={autoplayEnabled}
                            onChange={(e) => setAutoplayEnabled(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[hsl(var(--accent-color))]"></div>
                    </label>
                </div>
            </div>
        </div>
    );
};

const BlockedUsersManager: React.FC = () => {
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
    
    useEffect(() => {
        const stored = localStorage.getItem('starlight_blocked_users');
        if (stored) {
            setBlockedUsers(JSON.parse(stored));
        }
    }, []);

    const handleUnblock = (userToUnblock: string) => {
        const updated = blockedUsers.filter(user => user !== userToUnblock);
        setBlockedUsers(updated);
        localStorage.setItem('starlight_blocked_users', JSON.stringify(updated));
    };

    return (
        <div id="blocked-users" className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><UserX className="w-5 h-5"/> Blocked Users</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">Users you block will not have their comments shown to you. This list is only stored in your browser.</p>
            {blockedUsers.length > 0 ? (
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {blockedUsers.map(user => (
                        <li key={user} className="flex justify-between items-center bg-[var(--background-primary)] p-3 rounded-lg border border-[var(--border-primary)]">
                            <div className="flex items-center gap-3">
                                <img src={`https://picsum.photos/seed/${user}/40/40`} className="w-8 h-8 rounded-full" alt="" />
                                <span className="font-semibold">{user}</span>
                            </div>
                            <button onClick={() => handleUnblock(user)} className="px-3 py-1.5 text-sm font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-colors">
                                Unblock
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-center text-[var(--text-secondary)] py-4">You haven't blocked any users yet.</p>
            )}
        </div>
    );
};

const SecuritySettings: React.FC<{ currentUser: any }> = ({ currentUser }) => {
    const [resetLinkSent, setResetLinkSent] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [is2FALoading, setIs2FALoading] = useState(false);
    const [devices, setDevices] = useState([
        { id: 1, name: 'Chrome on Windows', location: 'Mountain View, CA', time: 'Active now', icon: Monitor, current: true },
        { id: 2, name: 'Starlight App on iPhone 13', location: 'San Francisco, CA', time: '2 hours ago', icon: Smartphone, current: false },
        { id: 3, name: 'Safari on MacBook Pro', location: 'New York, NY', time: 'Yesterday', icon: Monitor, current: false },
    ]);

    const handleSendPasswordReset = () => {
        setResetLinkSent(true);
        setTimeout(() => { setResetLinkSent(false); }, 5000);
    };

    const toggle2FA = () => {
        setIs2FALoading(true);
        // Simulate API call
        setTimeout(() => {
            setIs2FAEnabled(!is2FAEnabled);
            setIs2FALoading(false);
        }, 1500);
    };

    const handleSignOutDevice = (id: number) => {
        if(window.confirm('Are you sure you want to sign out this device?')) {
            setDevices(devices.filter(d => d.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            {/* Password Section */}
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[hsl(var(--accent-color))]" /> Password
                </h3>
                 <div className="bg-[var(--background-primary)] rounded-xl p-6 border border-[var(--border-primary)] flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex-1 text-center sm:text-left">
                        <p className="text-[var(--text-primary)] font-medium">Last changed 3 months ago</p>
                        <p className="text-[var(--text-secondary)] text-sm mt-1">
                            We recommend changing your password periodically to keep your account secure.
                            Link will be sent to <strong>{currentUser.email}</strong>.
                        </p>
                    </div>
                    <button 
                        onClick={handleSendPasswordReset} 
                        disabled={resetLinkSent || !currentUser.email} 
                        className="px-6 py-2.5 bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg font-semibold text-sm transition-colors shadow-sm whitespace-nowrap flex items-center gap-2"
                    >
                        {resetLinkSent ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Send className="w-4 h-4" />}
                        {resetLinkSent ? 'Reset Link Sent' : 'Send Reset Link'}
                    </button>
                </div>
            </div>

            {/* 2FA Section */}
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" /> 2-Step Verification
                    </h3>
                    {is2FAEnabled && <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/20">Enabled</span>}
                </div>
                 <div className="bg-[var(--background-primary)] rounded-xl p-6 border border-[var(--border-primary)]">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${is2FAEnabled ? 'bg-green-500/10 text-green-500' : 'bg-[var(--background-tertiary)] text-[var(--text-tertiary)]'}`}>
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-[var(--text-primary)] font-medium">Add an extra layer of security</p>
                            <p className="text-[var(--text-secondary)] text-sm mt-1">
                                Enter a password and a unique verification code sent to your phone when signing in.
                            </p>
                        </div>
                        <button 
                            onClick={toggle2FA} 
                            disabled={is2FALoading}
                            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm min-w-[120px] flex items-center justify-center ${
                                is2FAEnabled 
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' 
                                : 'bg-[hsl(var(--accent-color))] text-white hover:brightness-90'
                            }`}
                        >
                            {is2FALoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (is2FAEnabled ? 'Turn Off' : 'Turn On')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Devices Section */}
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-[hsl(var(--accent-color))]" /> Your Devices
                </h3>
                <p className="text-[var(--text-secondary)] text-sm mb-6">You’re signed in on these devices.</p>
                <div className="space-y-3">
                    {devices.map(device => (
                        <div key={device.id} className="flex items-center justify-between p-4 bg-[var(--background-primary)] rounded-xl border border-[var(--border-primary)]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[var(--background-tertiary)] rounded-full text-[var(--text-secondary)]">
                                    <device.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                                        {device.name}
                                        {device.current && <span className="px-2 py-0.5 bg-[hsl(var(--accent-color))]/10 text-[hsl(var(--accent-color))] text-[10px] font-bold rounded uppercase">Current Device</span>}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mt-0.5">
                                        <span>{device.location}</span>
                                        <span>•</span>
                                        <span>{device.time}</span>
                                    </div>
                                </div>
                            </div>
                            {!device.current && (
                                <button onClick={() => handleSignOutDevice(device.id)} className="p-2 text-[var(--text-tertiary)] hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors" title="Sign out device">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <BlockedUsersManager />
        </div>
    );
};

const ApiSettings: React.FC = () => {
    const [isVeoKeySelected, setIsVeoKeySelected] = useState(false);
    const [keyCheckLoading, setKeyCheckLoading] = useState(true);

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio?.hasSelectedApiKey) {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setIsVeoKeySelected(hasKey);
            }
            setKeyCheckLoading(false);
        };
        checkKey();
    }, []);

    const handleSelectVeoKey = async () => {
        if (window.aistudio?.openSelectKey) {
            setKeyCheckLoading(true);
            await window.aistudio.openSelectKey();
            setIsVeoKeySelected(true);
            setKeyCheckLoading(false);
        }
    };
    
    return (
        <div className="space-y-8">
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h3 className="text-lg font-bold mb-3">Standard API Key</h3>
                <div className="bg-[var(--background-primary)] rounded-lg p-6 border border-[var(--border-primary)] flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0"><ShieldCheck className="w-6 h-6" /></div>
                    <div className="flex-1 text-center sm:text-left"><p className="text-[var(--text-primary)] font-medium">Platform Managed Key</p><p className="text-[var(--text-secondary)] text-sm mt-1">For most features, Starlight uses a securely managed platform API key. This key is not user-configurable.</p></div>
                </div>
            </div>
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h3 className="text-lg font-bold mb-3">Veo Video Generation API Key</h3>
                <div className="bg-[var(--background-primary)] rounded-lg p-6 border border-[var(--border-primary)]">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 flex-shrink-0"><VideoIcon className="w-6 h-6" /></div>
                        <div className="flex-1 text-center sm:text-left"><p className="text-[var(--text-primary)] font-medium">User-Selected Key</p><p className="text-[var(--text-secondary)] text-sm mt-1">Veo video generation requires your own API key with billing enabled.</p></div>
                        <button onClick={handleSelectVeoKey} className="px-6 py-2.5 bg-[hsl(var(--accent-color))] hover:brightness-90 text-white rounded-lg font-semibold text-sm transition-colors shadow-md whitespace-nowrap">{isVeoKeySelected ? 'Change Key' : 'Select Key'}</button>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[var(--border-primary)] flex items-center gap-3">
                        {keyCheckLoading ? (<Loader2 className="w-4 h-4 animate-spin text-[var(--text-tertiary)]" />) : isVeoKeySelected ? (<CheckCircle2 className="w-5 h-5 text-green-500" />) : (<AlertTriangle className="w-5 h-5 text-yellow-500" />)}
                        <p className="text-sm font-medium text-[var(--text-secondary)]">Status: {keyCheckLoading ? 'Checking...' : isVeoKeySelected ? 'API Key Selected' : 'No API Key Selected'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Settings: React.FC = () => {
    const { currentUser, isAdmin, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [profileDetails, setProfileDetails] = useState<ProfileDetails>({});
    const [showAdminModal, setShowAdminModal] = useState(false);
    
    // Tab Navigation State
    const [showScrollArrows, setShowScrollArrows] = useState(false);
    const [isScrolledLeft, setIsScrolledLeft] = useState(true);
    const [isScrolledRight, setIsScrolledRight] = useState(false);
    const tabsContainerRef = useRef<HTMLDivElement>(null);

    const activeTab: SettingsTab = useMemo(() => {
        const hash = location.hash.substring(1);
        if (['blocked-users'].includes(hash)) {
            return 'security';
        }
        if (['delete-account'].includes(hash)) {
            return 'account';
        }
        if (['account', 'security', 'api', 'playback'].includes(hash)) {
            return hash as SettingsTab;
        }
        return 'account';
    }, [location.hash]);

    useEffect(() => {
        const hash = location.hash.substring(1);
        if (hash) {
            setTimeout(() => {
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, [location.hash, activeTab]);

    const loadProfileData = useCallback(() => {
        if (currentUser) {
            if (currentUser.email) {
                const allProfileDetailsJSON = localStorage.getItem('starlight_profile_details');
                if (allProfileDetailsJSON) {
                    const allDetails = JSON.parse(allProfileDetailsJSON);
                    const userDetails = allDetails[currentUser.email];
                    if (userDetails) setProfileDetails(userDetails);
                }
            }
        }
    }, [currentUser]);

    useEffect(() => {
        loadProfileData();
    }, [loadProfileData]);

    // Mobile Scroll Arrow Logic
    const checkScrollPosition = useCallback(() => {
        const container = tabsContainerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setShowScrollArrows(scrollWidth > clientWidth);
            setIsScrolledLeft(scrollLeft <= 0);
            // Use a small threshold for precision issues
            setIsScrolledRight(Math.ceil(scrollLeft + clientWidth) >= scrollWidth);
        }
    }, []);

    useEffect(() => {
        const container = tabsContainerRef.current;
        if (container) {
            checkScrollPosition();
            container.addEventListener('scroll', checkScrollPosition);
            window.addEventListener('resize', checkScrollPosition);
            return () => {
                container.removeEventListener('scroll', checkScrollPosition);
                window.removeEventListener('resize', checkScrollPosition);
            };
        }
    }, [checkScrollPosition, activeTab]);

    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsContainerRef.current) {
            const scrollAmount = 200;
            tabsContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const renderContent = () => {
        const currentNavItem = NAV_ITEMS.find(item => item.id === activeTab);
        return (
            <div className="animate-in fade-in duration-300">
                <h1 className="text-3xl font-bold mb-8 hidden md:block">{currentNavItem?.label}</h1>
                {(() => {
                    switch(activeTab) {
                        case 'account':
                            return <AccountSettings currentUser={currentUser} profileDetails={profileDetails} setProfileDetails={setProfileDetails} />;
                        case 'security':
                            return <SecuritySettings currentUser={currentUser} />;
                        case 'playback':
                            return <PlaybackSettings />;
                        case 'api':
                            return <ApiSettings />;
                        default:
                            return null;
                    }
                })()}
                
                <div className="mt-16 bg-[var(--background-secondary)] p-6 rounded-xl border border-[var(--border-primary)] flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Advanced Options</h3>
                    {!isAdmin ? (
                        <button 
                            onClick={() => setShowAdminModal(true)} 
                            className="flex items-center gap-2 px-8 py-3 bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] border-2 border-red-500/20 hover:border-red-500/50 text-red-600 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md"
                        >
                            <Shield className="w-5 h-5" /> Admin Access
                        </button>
                    ) : (
                        <button 
                            onClick={() => navigate('/admin')} 
                            className="flex items-center gap-2 px-8 py-3 bg-[var(--background-primary)] hover:bg-[var(--background-tertiary)] border-2 border-green-500/20 hover:border-green-500/50 text-green-600 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md"
                        >
                            <Shield className="w-5 h-5" /> Go to Admin Dashboard
                        </button>
                    )}
                    <p className="text-xs text-[var(--text-tertiary)] mt-3 max-w-sm">
                        Restricted area for platform administrators only. Requires a secure PIN.
                    </p>
                </div>
                {showAdminModal && <AdminLoginModal onClose={() => setShowAdminModal(false)} onSuccess={() => navigate('/admin')} />}
            </div>
        );
    };

    if (!currentUser) {
        return (
            <main className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-screen bg-[var(--background-primary)]">
                <div className="text-center space-y-6 max-w-md w-full bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] shadow-xl">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-[var(--text-secondary)]">Please sign in to manage your account and application settings.</p>
                    <button 
                        onClick={() => navigate('/signup')} 
                        className="w-full py-3 bg-[hsl(var(--accent-color))] text-white rounded-xl font-bold hover:brightness-90 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogIn className="w-5 h-5" /> Sign In
                    </button>
                </div>
                
                <div className="mt-8 w-full max-w-md flex flex-col items-center gap-4">
                     <div className="flex items-center gap-4 w-full">
                        <div className="h-px bg-[var(--border-primary)] flex-1"></div>
                        <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Administration</span>
                        <div className="h-px bg-[var(--border-primary)] flex-1"></div>
                     </div>
                     
                     <button 
                        onClick={() => setShowAdminModal(true)} 
                        className="flex items-center gap-2 px-8 py-3 bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] border-2 border-red-500/20 hover:border-red-500/50 text-red-500 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md w-full justify-center"
                    >
                        <Shield className="w-5 h-5" /> Admin Access (PIN)
                    </button>
                </div>
                {showAdminModal && <AdminLoginModal onClose={() => setShowAdminModal(false)} onSuccess={() => navigate('/admin')} />}
            </main>
        );
    }

    return (
        <main className="p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Mobile Tabs Navigation */}
                <div className="relative mb-6 border-b border-[var(--border-primary)] md:hidden">
                    <div 
                        ref={tabsContainerRef}
                        className="flex overflow-x-auto no-scrollbar items-center gap-6 px-4 scroll-smooth"
                    >
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                onClick={() => navigate(`#${item.id}`)}
                                className={`py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                                    activeTab === item.id 
                                    ? 'border-[hsl(var(--accent-color))] text-[hsl(var(--accent-color))]' 
                                    : 'border-transparent text-[var(--text-secondary)]'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    {/* Left Scroll Arrow */}
                    {showScrollArrows && !isScrolledLeft && (
                        <div className="absolute left-0 top-0 bottom-0 flex items-center bg-gradient-to-r from-[var(--background-primary)] to-transparent pr-4 pl-1 z-10">
                            <button 
                                onClick={() => scrollTabs('left')} 
                                className="p-1.5 rounded-full bg-[var(--background-secondary)] border border-[var(--border-primary)] shadow-md text-[var(--text-primary)] hover:bg-[var(--background-tertiary)]"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    
                    {/* Right Scroll Arrow */}
                    {showScrollArrows && !isScrolledRight && (
                        <div className="absolute right-0 top-0 bottom-0 flex items-center bg-gradient-to-l from-[var(--background-primary)] to-transparent pl-4 pr-1 z-10">
                            <button 
                                onClick={() => scrollTabs('right')} 
                                className="p-1.5 rounded-full bg-[var(--background-secondary)] border border-[var(--border-primary)] shadow-md text-[var(--text-primary)] hover:bg-[var(--background-tertiary)]"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {renderContent()}
            </div>
        </main>
    );
};
