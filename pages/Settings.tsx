import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    User, Mail, Phone, CheckCircle2, Globe, MapPin, Settings as SettingsIcon, 
    Lock, Send, Languages, KeyRound, ShieldCheck, Video as VideoIcon, 
    RefreshCw, AlertTriangle, ChevronDown, Users, Home, Check, Loader2, Save, UserX, Trash2,
    Puzzle, PlusCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { COUNTRY_CODES, INDIAN_STATES, ANDHRA_PRADESH_CITIES, USA_STATES, UK_STATES, ALL_NATIVE_LANGUAGES, COUNTRY_LANGUAGES } from '../constants';
import { ProfileDetails, Community } from '../types';

type SettingsTab = 'account' | 'security' | 'integrations' | 'api';

const NAV_ITEMS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Login & Security', icon: Lock },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
    { id: 'api', label: 'API Keys', icon: KeyRound },
];

const WhatsAppIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.39 1.88 6.161l-1.334 4.869 4.893-1.309zM9.356 8.014c-.13-.306-.279-.32-1.042-.324-.712-.004-1.393-.243-1.393-.243s-.542.13-.542.13c-.144.06-.144.06-.144.06-.516.216-1.033.972-1.033 2.064 0 1.062.279 2.1.279 2.1s.18.216.516.576c.336.36.456.456 1.448 1.968 1.488 2.209 2.133 2.58 3.129 2.928.612.216 1.296.12 1.776-.18.396-.24.516-.54.516-.54s.06-.12.06-.12c0-.06 0-.624-.036-.66-.036-.036-.216-.096-.456-.216-.24-.12-.48-.12-1.116-.36-.456-.156-.812-.12-.812-.12s-.216.06-.396.24c-.18.18-.36.36-.54.36-.18.012-.336-.024-.336-.024s-.276-.12-.516-.24c-.24-.12-.54-.24-.816-.54-.6-.66-1.068-1.344-1.068-1.344s-.06-.096 0-.192c.06-.096.12-.12.18-.18.06.012.276-.24.396-.396.12-.156.18-.24.24-.36.06-.12.12-.24.06-.36-.06-.12-.516-1.2-.516-1.2z"/>
    </svg>
);

const AccountSettings: React.FC<{
    currentUser: any;
    profileDetails: ProfileDetails;
    setProfileDetails: React.Dispatch<React.SetStateAction<ProfileDetails>>;
}> = ({ currentUser, profileDetails, setProfileDetails }) => {
    const [countryCode, setCountryCode] = useState('+91');
    const [mobileInput, setMobileInput] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpMethod, setOtpMethod] = useState<'sms' | 'whatsapp'>('sms');
    const [stateInput, setStateInput] = useState('');
    const [cityInput, setCityInput] = useState('');
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [genderInput, setGenderInput] = useState<ProfileDetails['gender'] | ''>('');
    const [error, setError] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [showMobileForm, setShowMobileForm] = useState(false);

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
        setOtpSent(true);
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
            setShowMobileForm(false);
        } else {
            setError('Invalid OTP. Please try again. (Hint: use 123456)');
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
                            <input type="text" disabled value={currentUser.name} className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-secondary)] cursor-not-allowed" />
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
                                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} disabled={otpSent} className="py-3 pl-3 pr-8 bg-transparent border-r border-[var(--border-primary)] text-[var(--text-secondary)] font-medium text-sm focus:outline-none appearance-none">
                                    {COUNTRY_CODES.map(c => <option key={c.iso} value={c.code}>{c.name} ({c.code})</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                            </div>
                            <div className="relative flex-grow">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" />
                                <input type="tel" value={mobileInput} onChange={(e) => setMobileInput(e.target.value)} placeholder="Mobile number" disabled={otpSent} className="w-full p-3 pl-10 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none" />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <div className="flex gap-2 rounded-lg bg-[var(--background-primary)] p-1 border border-[var(--border-primary)] mt-1">
                                    <button type="button" onClick={() => setOtpMethod('sms')} className={`flex-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${otpMethod === 'sms' ? 'bg-[hsl(var(--accent-color))] text-white' : 'hover:bg-[var(--background-tertiary)]'}`}>SMS</button>
                                    <button type="button" onClick={() => setOtpMethod('whatsapp')} className={`flex-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${otpMethod === 'whatsapp' ? 'bg-green-600 text-white' : 'hover:bg-[var(--background-tertiary)]'}`}><WhatsAppIcon /> WhatsApp</button>
                                </div>
                            </div>
                            <button onClick={handleSendOtp} disabled={otpSent} className="px-5 py-3 bg-[hsl(var(--accent-color))] hover:brightness-90 text-white rounded-lg font-semibold text-sm transition-colors w-full sm:w-auto flex-shrink-0 disabled:opacity-50">{otpSent ? 'OTP Sent' : 'Send OTP'}</button>
                        </div>
                        {otpSent && (
                        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-in fade-in">
                            <div className="relative flex-grow w-full"><input type="text" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder={`Enter OTP from ${otpMethod}`} className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"/></div>
                            <button onClick={handleSubmitOtp} className="px-5 py-3 bg-[hsl(var(--accent-color))] hover:brightness-90 text-white rounded-lg font-semibold text-sm transition-colors w-full sm:w-auto flex-shrink-0">Submit OTP</button>
                        </div>
                        )}
                        {error && <p className="text-red-500 text-sm mt-2 animate-in fade-in">{error}</p>}
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
            
            <div className="flex justify-end items-center gap-4 pt-4">
                {saveStatus === 'saved' && <p className="text-green-500 text-sm font-semibold animate-in fade-in flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Saved successfully!</p>}
                <button onClick={handleSaveChanges} disabled={saveStatus === 'saving'} className="px-6 py-2.5 bg-[hsl(var(--accent-color))] hover:brightness-90 text-white rounded-lg font-semibold text-sm transition-colors shadow-md flex items-center justify-center gap-2 w-32 disabled:opacity-70">
                    {saveStatus === 'saving' ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Save className="w-4 h-4"/> Save</>}
                </button>
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
    const { deleteAccount } = useAuth();
    
    const [deleteStep, setDeleteStep] = useState<'initial' | 'confirm_otp' | 'deleting'>('initial');
    const [otpCode, setOtpCode] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const handleSendPasswordReset = () => {
        setResetLinkSent(true);
        setTimeout(() => { setResetLinkSent(false); }, 5000);
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
        if (otpCode === '123456') {
            setDeleteStep('deleting');
            // Simulate API call delay
            setTimeout(() => {
                deleteAccount();
                // User will be logged out and redirected by deleteAccount function
            }, 1500);
        } else {
            setDeleteError('Invalid OTP code. Please try again.');
        }
    };


    return (
        <div className="space-y-8">
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h3 className="text-lg font-bold mb-3">Change Password</h3>
                 <div className="bg-[var(--background-primary)] rounded-lg p-6 border border-[var(--border-primary)] flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-[hsl(var(--accent-color))]/10 flex items-center justify-center text-[hsl(var(--accent-color))] flex-shrink-0"><Lock className="w-6 h-6" /></div>
                    <div className="flex-1 text-center sm:text-left"><p className="text-[var(--text-primary)] font-medium">Forgot your password or want to change it?</p><p className="text-[var(--text-secondary)] text-sm mt-1">We will send a secure link to <strong>{currentUser.email || 'your email'}</strong> to create a new password.</p></div>
                    <button onClick={handleSendPasswordReset} disabled={resetLinkSent || !currentUser.email} className="px-6 py-2.5 bg-[hsl(var(--accent-color))] hover:brightness-90 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors shadow-md whitespace-nowrap flex items-center gap-2">
                        {resetLinkSent ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                        {resetLinkSent ? 'Link Sent' : 'Send Reset Link'}
                    </button>
                </div>
            </div>
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h3 className="text-lg font-bold mb-3">Two-Factor Authentication</h3>
                 <div className="bg-[var(--background-primary)] rounded-lg p-6 border border-[var(--border-primary)] flex flex-col sm:flex-row items-center gap-6 opacity-60">
                    <div className="w-12 h-12 rounded-full bg-gray-500/10 flex items-center justify-center text-gray-500 flex-shrink-0"><ShieldCheck className="w-6 h-6" /></div>
                    <div className="flex-1 text-center sm:text-left"><p className="text-[var(--text-primary)] font-medium">Add an extra layer of security</p><p className="text-[var(--text-secondary)] text-sm mt-1">Protect your account from unauthorized access.</p></div>
                    <div className="px-6 py-2.5 bg-gray-500 text-white rounded-lg font-semibold text-sm cursor-not-allowed">Coming Soon</div>
                </div>
            </div>
            <BlockedUsersManager />

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
                                value={otpCode}
                                onChange={e => setOtpCode(e.target.value)}
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
        </div>
    );
};

const IntegrationsSettings: React.FC = () => {
    const [isCanvaConnected, setIsCanvaConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    
    useEffect(() => {
        const canvaStatus = localStorage.getItem('starlight_canva_connected');
        setIsCanvaConnected(canvaStatus === 'true');
    }, []);
    
    const handleConnect = () => {
        setIsConnecting(true);
        setTimeout(() => {
            localStorage.setItem('starlight_canva_connected', 'true');
            setIsCanvaConnected(true);
            setIsConnecting(false);
        }, 1500);
    };

    const handleDisconnect = () => {
        localStorage.removeItem('starlight_canva_connected');
        setIsCanvaConnected(false);
    };
    
    return (
        <div className="space-y-8">
            <div className="bg-[var(--background-secondary)] p-6 rounded-2xl border border-[var(--border-primary)]">
                <h3 className="text-lg font-bold mb-3">Connected Apps</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-6">Connect your Starlight account to other services to streamline your workflow.</p>

                <div className="bg-[var(--background-primary)] rounded-lg p-6 border border-[var(--border-primary)] flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-[#00C4CC]/10 flex items-center justify-center flex-shrink-0">
                        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-[#00C4CC]">
                            <title>Canva</title>
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.21 4.56c1.17 0 2.233.385 3.12 1.042l-2.09 2.09a2.43 2.43 0 00-1.03-1.031zm-1.041 1.03v2.09L9.04 9.77a2.44 2.44 0 00-1.03-1.03zm-1.04 1.042L5.43 8.76a7.485 7.485 0 011.042-3.12l2.09 2.09c-.36.326-.642.72-.82 1.15zM4.56 11.81h2.09l2.09-2.09c.43.178.823.46 1.15.82L7.79 12.63l-2.09 2.09H4.56zm1.03 3.12l2.09-2.09 2.09 2.09H6.67c-.326-.36-.563-.765-.78-1.19zM8.76 18.57l3.12-3.12 3.12 3.12a7.485 7.485 0 01-6.24 0zm3.12-4.16l-2.09 2.09V14.41l2.09-2.09zm0-1.041L9.77 15.46l-2.09-2.09V11.28l2.09 2.09zm1.041 1.041l2.09-2.09v2.09l-2.09 2.09zm1.03-1.041l2.09 2.09v-2.09l-2.09-2.09zm4.68-3.12a2.43 2.43 0 00-1.03 1.031l2.09 2.09V11.81zM18.57 8.76l-3.12 3.12-3.12-3.12a7.485 7.485 0 016.24 0z"/>
                        </svg>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <p className="text-[var(--text-primary)] font-bold text-lg">Canva</p>
                        <p className="text-[var(--text-secondary)] text-sm mt-1">Design beautiful thumbnails for your videos directly with Canva <span className="font-semibold text-[var(--text-primary)]">in the upload modal</span>.</p>
                    </div>
                    
                    {isCanvaConnected ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Connected
                            </span>
                            <button onClick={handleDisconnect} className="px-5 py-2 bg-[var(--background-primary)] text-red-500 border border-[var(--border-primary)] hover:bg-red-500/10 hover:border-red-500/20 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap">
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleConnect} disabled={isConnecting} className="px-6 py-2.5 bg-[#00C4CC] hover:brightness-90 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors shadow-md whitespace-nowrap flex items-center gap-2">
                            {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                            {isConnecting ? 'Connecting...' : 'Connect'}
                        </button>
                    )}
                </div>
            </div>
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
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [profileDetails, setProfileDetails] = useState<ProfileDetails>({});
    
    const activeTab: SettingsTab = useMemo(() => {
        const hash = location.hash.substring(1);
        if (hash === 'blocked-users' || hash === 'delete-account') {
            return 'security';
        }
        if (['account', 'security', 'api', 'integrations'].includes(hash)) {
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
        } else {
            const savedUser = localStorage.getItem('currentUser');
            if (!savedUser) navigate('/');
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        loadProfileData();
    }, [loadProfileData]);

    const renderContent = () => {
        const currentNavItem = NAV_ITEMS.find(item => item.id === activeTab);
        return (
            <div className="animate-in fade-in duration-300">
                <h1 className="text-3xl font-bold mb-8">{currentNavItem?.label}</h1>
                {(() => {
                    switch(activeTab) {
                        case 'account':
                            return <AccountSettings currentUser={currentUser} profileDetails={profileDetails} setProfileDetails={setProfileDetails} />;
                        case 'security':
                            return <SecuritySettings currentUser={currentUser} />;
                        case 'integrations':
                            return <IntegrationsSettings />;
                        case 'api':
                            return <ApiSettings />;
                        default:
                            return null;
                    }
                })()}
            </div>
        );
    };

    if (!currentUser) {
        return null;
    }

    return (
        <main className="p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {renderContent()}
            </div>
        </main>
    );
};