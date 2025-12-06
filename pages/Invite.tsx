import React, { useState, useEffect } from 'react';
import { UserPlus, CheckCircle2, AlertTriangle, Send, Mail, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { COUNTRY_CODES } from '../constants';

interface Contact {
  name: string[];
  email?: string[];
  tel?: string[];
  icon?: string[];
}

const WhatsAppIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.39 1.88 6.161l-1.334 4.869 4.893-1.309zM9.356 8.014c-.13-.306-.279-.32-1.042-.324-.712-.004-1.393-.243-1.393-.243s-.542.13-.542.13c-.144.06-.144.06-.144.06-.516.216-1.033.972-1.033 2.064 0 1.062.279 2.1.279 2.1s.18.216.516.576c.336.36.456.456 1.448 1.968 1.488 2.209 2.133 2.58 3.129 2.928.612.216 1.296.12 1.776-.18.396-.24.516-.54.516-.54s.06-.12.06-.12c0-.06 0-.624-.036-.66-.036-.036-.216-.096-.456-.216-.24-.12-.48-.12-1.116-.36-.456-.156-.812-.12-.812-.12s-.216.06-.396.24c-.18.18-.36.36-.54.36-.18.012-.336-.024-.336-.024s-.276-.12-.516-.24c-.24-.12-.54-.24-.816-.54-.6-.66-1.068-1.344-1.068-1.344s-.06-.096 0-.192c.06-.096.12-.12.18-.18.06.012.276-.24.396-.396.12-.156.18-.24.24-.36.06-.12.12-.24.06-.36-.06-.12-.516-1.2-.516-1.2z"/>
    </svg>
);

export const Invite: React.FC = () => {
  const [isApiSupported, setIsApiSupported] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [invitedContacts, setInvitedContacts] = useState<Set<string>>(new Set());
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // New state for manual invite form
  const [manualNumber, setManualNumber] = useState('');
  const [manualCountryCode, setManualCountryCode] = useState('+91');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [manualError, setManualError] = useState('');

  const inviteMessage = `Hey! Check out this awesome AI-powered video platform called StarLight. Join me here: ${window.location.href}`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(inviteMessage)}`;


  useEffect(() => {
    if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
      setIsApiSupported(true);
    }
  }, []);
  
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <UserPlus className="w-24 h-24 text-[hsl(var(--accent-color))] mb-6 opacity-50" />
        <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Invite your friends</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md">
          Sign in to access your contacts and send invitations.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="px-8 py-3 bg-[hsl(var(--accent-color))] text-white font-semibold rounded-full filter hover:brightness-90 transition-colors shadow-lg"
        >
           Sign In
        </button>
      </div>
    );
  }

  const handleSelectContacts = async () => {
    if (!isApiSupported) return;
    try {
      const contacts = await (navigator as any).contacts.select(['name', 'email', 'tel'], { multiple: true });
      if (contacts.length > 0) {
        setSelectedContacts(contacts);
        setInvitedContacts(new Set()); // Reset invited status when new contacts are selected
      }
    } catch (ex) {
      console.error('Error selecting contacts:', ex);
    }
  };
  
  const handleInvite = (contact: Contact) => {
    // This is a simulation. In a real app, this would trigger an email or SMS.
    const identifier = contact.email?.[0] || contact.tel?.[0];
    if (identifier) {
        setInvitedContacts(new Set(invitedContacts).add(identifier));
    }
  };
  
  const getIdentifier = (contact: Contact) => contact.email?.[0] || contact.tel?.[0] || 'No contact info';

  const handleManualInvite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setManualError('');
    if (!/^\d{7,15}$/.test(manualNumber)) {
        setManualError("Please enter a valid mobile number.");
        return;
    }
    setInviteStatus('sending');

    // Add subject for Formspree
    formData.append('_subject', 'New Invite from Starlight Page');

    fetch('https://formspree.io/f/mldywbwz', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    }).catch(error => {
        console.error("Error submitting to Formspree:", error);
    });

    // Keep existing UI simulation
    setTimeout(() => {
        setInviteStatus('sent');
        console.log(`Sending invite to ${manualCountryCode}${manualNumber}`);
        setTimeout(() => {
            setInviteStatus('idle');
            setManualNumber('');
        }, 3000);
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
            <UserPlus className="w-20 h-20 text-[hsl(var(--accent-color))] mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Invite Friends</h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                Share Starlight with your friends and build a community.
            </p>
        </header>

        <div className="bg-[var(--background-secondary)] p-6 md:p-8 rounded-2xl border border-[var(--border-primary)] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
          <h2 className="text-xl font-bold mb-2">Invite by Phone Number</h2>
          <p className="text-[var(--text-secondary)] mb-6 text-sm">Enter your friend's mobile number, and we'll send them an SMS with a link to join Starlight.</p>
          <form onSubmit={handleManualInvite} className="flex flex-col sm:flex-row items-start gap-3">
              <div className="flex-shrink-0">
                  <select
                      name="country_code"
                      value={manualCountryCode}
                      onChange={e => setManualCountryCode(e.target.value)}
                      className="p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))] h-full"
                  >
                      {COUNTRY_CODES.map(c => <option key={c.iso} value={c.code}>{c.iso} {c.code}</option>)}
                  </select>
              </div>
              <div className="relative flex-1 w-full">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                  <input
                      type="tel"
                      name="mobile_number"
                      required
                      placeholder="Enter mobile number"
                      value={manualNumber}
                      onChange={e => setManualNumber(e.target.value)}
                      className="w-full p-3 pl-10 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                  />
              </div>
              <button
                  type="submit"
                  disabled={inviteStatus !== 'idle'}
                  className="w-full sm:w-auto px-6 py-3 bg-[hsl(var(--accent-color))] text-white font-bold rounded-xl hover:brightness-90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
              >
                  {inviteStatus === 'sending' ? (
                      <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Sending...</span>
                      </>
                  ) : (
                      <>
                          <Send className="w-5 h-5" />
                          <span>Send Invite</span>
                      </>
                  )}
              </button>
          </form>
          {manualError && <p className="text-sm text-red-500 mt-2">{manualError}</p>}
          {inviteStatus === 'sent' && (
              <div className="mt-4 flex items-center gap-2 text-green-500 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5" />
                  <p className="text-sm font-semibold">Invitation sent successfully!</p>
              </div>
          )}
        </div>

        <div className="bg-[var(--background-secondary)] p-6 md:p-8 rounded-2xl border border-[var(--border-primary)] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-200">
            <h2 className="text-xl font-bold mb-2">Share an Invite Link</h2>
            <p className="text-[var(--text-secondary)] mb-6 text-sm">Quickly send an invite link through your favorite apps.</p>
            <div className="flex flex-wrap gap-4">
                <a 
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-500/10"
                >
                    <WhatsAppIcon className="w-6 h-6" />
                    <span>Invite via WhatsApp</span>
                </a>
            </div>
        </div>

        {!isApiSupported ? (
            <div className="bg-yellow-500/10 p-6 rounded-2xl border border-yellow-500/20 flex items-start gap-4 text-yellow-500 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-300">
                <AlertTriangle className="w-8 h-8 flex-shrink-0" />
                <div>
                    <h3 className="font-bold">Contact Picker API Not Supported</h3>
                    <p className="text-sm">Your browser does not support this feature. Please try a different browser like Chrome on Android or use the manual invite option above.</p>
                </div>
            </div>
        ) : (
            <main className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] animate-in fade-in slide-in-from-bottom-6 duration-500 delay-300">
                {selectedContacts.length === 0 ? (
                     <div className="text-center py-10">
                         <p className="text-lg text-[var(--text-secondary)] mb-6">Alternatively, select contacts from your device.</p>
                         <button 
                             onClick={handleSelectContacts}
                             className="px-8 py-4 bg-[hsl(var(--accent-color))] text-white rounded-full font-bold hover:brightness-90 transition-all shadow-lg flex items-center gap-2 mx-auto"
                         >
                            <UserPlus className="w-5 h-5" />
                            Select Contacts from Device
                         </button>
                         <p className="text-xs text-[var(--text-tertiary)] mt-4">We respect your privacy. We will only see contacts you select.</p>
                     </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                             <h2 className="text-xl font-bold">Selected Contacts ({selectedContacts.length})</h2>
                             <button
                                onClick={handleSelectContacts}
                                className="text-sm font-semibold text-[hsl(var(--accent-color))] hover:underline"
                             >
                                Select More
                             </button>
                        </div>
                       
                        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                           {selectedContacts.map((contact, index) => {
                               const identifier = getIdentifier(contact);
                               const hasBeenInvited = invitedContacts.has(identifier);
                               return (
                                   <li key={index} className="flex items-center justify-between p-3 bg-[var(--background-primary)] rounded-lg border border-[var(--border-primary)]">
                                       <div className="flex items-center gap-3 overflow-hidden">
                                           {contact.email?.[0] ? <Mail className="w-5 h-5 text-[var(--text-tertiary)] flex-shrink-0"/> : <Phone className="w-5 h-5 text-[var(--text-tertiary)] flex-shrink-0"/>}
                                           <div className="overflow-hidden">
                                                <p className="font-semibold truncate">{contact.name.join(' ')}</p>
                                                <p className="text-xs text-[var(--text-tertiary)] truncate">{identifier}</p>
                                           </div>
                                       </div>
                                       <button 
                                            onClick={() => handleInvite(contact)}
                                            disabled={hasBeenInvited}
                                            className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 transition-colors flex-shrink-0 ${
                                                hasBeenInvited
                                                    ? 'bg-green-500/10 text-green-500 cursor-default'
                                                    : 'bg-[hsl(var(--accent-color))] text-white hover:brightness-90'
                                            }`}
                                        >
                                           {hasBeenInvited ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                           {hasBeenInvited ? 'Invited' : 'Invite'}
                                       </button>
                                   </li>
                               );
                           })}
                        </ul>
                    </div>
                )}
            </main>
        )}
      </div>
    </div>
  );
};