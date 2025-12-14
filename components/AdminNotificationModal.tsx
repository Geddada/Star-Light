
import React, { useState, useEffect } from 'react';
import { X, Send, Loader2, Mail, CheckCircle, FileText, Users, AlertTriangle, Sparkles, ShieldAlert, UserCheck, Clock } from 'lucide-react';
import { User } from '../types';

interface AdminNotificationModalProps {
  onClose: () => void;
  recipients: User[];
  onSuccess: () => void;
}

type TemplateType = 'custom' | 'welcome' | 'ban' | 'suspend' | 'promote' | 'warning';

const TEMPLATES: Record<TemplateType, { subject: string; body: string; label: string; icon: React.ElementType; color: string }> = {
  custom: {
    label: 'Custom Message',
    subject: '',
    body: '',
    icon: FileText,
    color: 'text-gray-500'
  },
  welcome: {
    label: 'Registration Success',
    subject: 'Welcome to StarLight!',
    body: 'Hi {name},\n\nWe are thrilled to have you on board! Your account has been successfully registered.\n\nStart exploring, creating, and sharing your amazing content today.\n\nCheers,\nThe StarLight Team',
    icon: UserCheck,
    color: 'text-green-500'
  },
  promote: {
    label: 'Account Promoted',
    subject: 'Congratulations! You have been upgraded',
    body: 'Hi {name},\n\nGreat news! Your account has been promoted to Premium status. You now have access to exclusive features like Ad-Free viewing, Starlight Labs, and more.\n\nEnjoy the upgrade!\n\nThe StarLight Team',
    icon: Sparkles,
    color: 'text-amber-500'
  },
  warning: {
    label: 'Policy Warning',
    subject: 'Notice regarding your account activity',
    body: 'Hi {name},\n\nWe noticed some activity on your account that may violate our Community Guidelines. Please review our policies to ensure your content remains compliant.\n\nRegards,\nTrust & Safety Team',
    icon: AlertTriangle,
    color: 'text-yellow-500'
  },
  suspend: {
    label: 'Account Suspended',
    subject: 'Action Required: Account Suspension',
    body: 'Hi {name},\n\nYour account has been temporarily suspended due to a violation of our Terms of Service. You will not be able to upload or comment during this period.\n\nPlease contact support if you believe this is an error.',
    icon: Clock,
    color: 'text-orange-500'
  },
  ban: {
    label: 'Account Banned',
    subject: 'Urgent: Account Termination Notice',
    body: 'Hi {name},\n\nYour account has been permanently banned from StarLight due to severe or repeated violations of our Community Guidelines.\n\nThis decision is final.',
    icon: ShieldAlert,
    color: 'text-red-500'
  }
};

export const AdminNotificationModal: React.FC<AdminNotificationModalProps> = ({ onClose, recipients, onSuccess }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('custom');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  useEffect(() => {
    if (selectedTemplate !== 'custom') {
      setSubject(TEMPLATES[selectedTemplate].subject);
      setMessage(TEMPLATES[selectedTemplate].body);
    }
  }, [selectedTemplate]);

  const handleSend = () => {
    if (!subject || !message) {
        alert("Please enter a subject and message.");
        return;
    }

    setStatus('sending');
    
    // Simulate sending delay
    setTimeout(() => {
        console.log(`Sending email to ${recipients.length} recipients.`);
        console.log(`Subject: ${subject}`);
        console.log(`Message: ${message}`);
        
        setStatus('success');
        setTimeout(() => {
            onSuccess();
            onClose();
        }, 1500);
    }, 2000);
  };

  const recipientLabel = recipients.length === 1 
    ? recipients[0].name 
    : `${recipients.length} users`;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[var(--border-primary)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-[var(--border-primary)] bg-[var(--background-secondary)]">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-[hsl(var(--accent-color))]/10 rounded-lg text-[hsl(var(--accent-color))]">
                <Mail className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Send Notification</h2>
                <p className="text-xs text-[var(--text-secondary)]">
                    To: <span className="font-semibold text-[var(--text-primary)]">{recipientLabel}</span>
                    {recipients.length > 1 && <span className="ml-1 text-[var(--text-tertiary)]">({recipients.map(r => r.email).join(', ').substring(0, 30)}...)</span>}
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--background-tertiary)] transition-colors">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Body */}
        {status === 'success' ? (
             <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                 <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                     <CheckCircle className="w-8 h-8 text-green-500" />
                 </div>
                 <h3 className="text-2xl font-bold text-[var(--text-primary)]">Sent Successfully!</h3>
                 <p className="text-[var(--text-secondary)] mt-2">Your notification has been dispatched to {recipients.length} users.</p>
             </div>
        ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Template Selector */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-[var(--text-secondary)]">Choose Template</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(Object.keys(TEMPLATES) as TemplateType[]).map((key) => {
                            const template = TEMPLATES[key];
                            const Icon = template.icon;
                            const isSelected = selectedTemplate === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedTemplate(key)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                        isSelected 
                                            ? `border-[hsl(var(--accent-color))] bg-[hsl(var(--accent-color))]/5` 
                                            : 'border-[var(--border-primary)] hover:bg-[var(--background-tertiary)]'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${template.color}`} />
                                    <span className={`text-xs font-medium ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                        {template.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[var(--border-primary)]">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Subject</label>
                        <input 
                            type="text" 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Notification Subject"
                            className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))]"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Message Body</label>
                        <textarea 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            placeholder="Type your message here..."
                            className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent-color))] resize-none"
                        />
                        <p className="text-xs text-[var(--text-tertiary)]">
                            Tip: Use <code className="bg-[var(--background-tertiary)] px-1 rounded">{'{name}'}</code> to dynamically insert the user's name.
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* Footer */}
        {status !== 'success' && (
            <div className="p-5 border-t border-[var(--border-primary)] bg-[var(--background-secondary)] flex justify-end gap-3">
                <button 
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-lg font-semibold text-sm border border-[var(--border-primary)] hover:bg-[var(--background-tertiary)] transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSend}
                    disabled={status === 'sending' || !subject || !message}
                    className="px-6 py-2.5 bg-[hsl(var(--accent-color))] text-white rounded-lg font-semibold text-sm hover:brightness-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                    {status === 'sending' ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    ) : (
                        <><Send className="w-4 h-4" /> Send Notification</>
                    )}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
