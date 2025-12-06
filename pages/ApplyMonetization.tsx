import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, CheckCircle2, Clock, Loader2, ArrowRight } from 'lucide-react';

export const ApplyMonetization: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/signup');
    }
  }, [currentUser, navigate]);

  const handleAgree = () => {
    setStep(2);
  };

  const handleConnectAdSense = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setStep(3);
    }, 2500);
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] animate-in fade-in">
            <h2 className="text-xl font-bold mb-4">Step 1: Review Partner Program Terms</h2>
            <div className="h-64 overflow-y-auto p-4 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-secondary)] space-y-4">
              <h3 className="font-bold text-[var(--text-primary)]">Starlight Partner Program Terms</h3>
              <p>Welcome to the Starlight Partner Program ("Program"). By applying to the Program, you agree to be bound by these terms ("Terms"), our Starlight Terms of Service, and our Community Guidelines. Please read them carefully.</p>
              <h4 className="font-semibold text-[var(--text-primary)] pt-2">1. Monetization Revenue</h4>
              <p>You will receive a share of net revenues recognized by Starlight from advertisements displayed or streamed by Starlight on your content. The current revenue share is 55% to you, the creator. Starlight reserves the right to change this share with 30 days' notice.</p>
              <h4 className="font-semibold text-[var(--text-primary)] pt-2">2. Payment Account</h4>
              <p>To receive payments, you must create and maintain a valid AdSense account and link it to your Starlight account. Starlight is not responsible for any issues related to your AdSense account.</p>
              <h4 className="font-semibold text-[var(--text-primary)] pt-2">3. Termination</h4>
              <p>Either you or Starlight may terminate these Terms at any time for any reason. If terminated, you will be paid out any outstanding balance in your account in accordance with the payment schedule.</p>
            </div>
            <button 
              onClick={handleAgree}
              className="mt-6 w-full py-3 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all flex items-center justify-center gap-2"
            >
              I Agree to the Terms <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        );
      case 2:
        return (
          <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] text-center animate-in fade-in">
            <h2 className="text-xl font-bold mb-4">Step 2: Sign up for Google AdSense</h2>
            <p className="text-[var(--text-secondary)] mb-6">You will be redirected to AdSense to connect your existing account or create a new one. This is required to get paid.</p>
            <div className="p-4 bg-[var(--background-primary)] rounded-lg border border-[var(--border-primary)] text-left text-sm mb-6">
              <p>✅ Connect the account you want to use for payments.</p>
              <p>✅ If you don't have one, you can create one during this process.</p>
              <p>✅ Once complete, you'll be redirected back to Starlight.</p>
            </div>
            <button
              onClick={handleConnectAdSense}
              disabled={isConnecting}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Connecting...
                </>
              ) : (
                <>
                  Connect AdSense Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        );
      case 3:
        return (
          <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-green-500/30 text-center animate-in fade-in">
            <h2 className="text-xl font-bold mb-4">Step 3: Get Reviewed</h2>
            <Clock className="w-16 h-16 text-[hsl(var(--accent-color))] mx-auto my-6" />
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">Application in Review</h3>
            <p className="text-[var(--text-secondary)] mt-3 max-w-md mx-auto">
              Congratulations on reaching this step! We've received your application. Our team will now review your channel to ensure it complies with our policies. This process usually takes about a week. We will email you with a decision.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="mt-8 px-6 py-2.5 bg-[var(--background-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-full font-bold hover:bg-[var(--background-tertiary)] transition-all"
            >
              Go to Home
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const StepIndicator: React.FC<{ stepNum: number; title: string; currentStep: number }> = ({ stepNum, title, currentStep }) => {
    const isActive = stepNum === currentStep;
    const isCompleted = stepNum < currentStep;

    return (
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                isActive ? 'bg-[hsl(var(--accent-color))] text-white border-[hsl(var(--accent-color))]' :
                isCompleted ? 'bg-green-500 text-white border-green-500' :
                'bg-transparent text-[var(--text-secondary)] border-[var(--border-secondary)]'
            }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5"/> : stepNum}
            </div>
            <span className={`font-semibold ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {title}
            </span>
        </div>
    );
  };
  
  if (!currentUser) {
      return null;
  }

  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        <header className="text-center mb-12">
          <FileText className="w-16 h-16 text-[hsl(var(--accent-color))] mx-auto mb-4" />
          <h1 className="text-4xl font-bold">Starlight Partner Program Application</h1>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1 space-y-6 sticky top-6">
                <StepIndicator stepNum={1} title="Review Terms" currentStep={step} />
                <StepIndicator stepNum={2} title="Connect AdSense" currentStep={step} />
                <StepIndicator stepNum={3} title="Get Reviewed" currentStep={step} />
            </div>
            <main className="md:col-span-2">
                {renderStepContent()}
            </main>
        </div>
      </div>
    </div>
  );
};
