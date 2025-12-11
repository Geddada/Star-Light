
import React from 'react';
import { 
    Shield, Database, Users, ServerCrash, DollarSign, Info, Cog, Share2, 
    UserCheck, Smile, FileClock, Mail, Cookie
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PolicySection: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => {
    return (
        <section className="bg-[var(--background-secondary)] p-6 md:p-8 rounded-2xl border border-[var(--border-primary)]">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-[hsl(var(--accent-color))]/10 rounded-lg text-[hsl(var(--accent-color))] mt-1">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold mb-3">{title}</h2>
                    <div className="text-[var(--text-secondary)] leading-relaxed space-y-3">
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
};

export const Privacy: React.FC = () => {
    const navigate = useNavigate();
  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto pb-10">
        {/* Header */}
        <header className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex justify-center mb-6">
            <div className="p-5 rounded-3xl bg-blue-500/10 shadow-lg shadow-blue-500/5">
               <Shield className="w-20 h-20 text-blue-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-[var(--text-secondary)]">Last updated: March 15, 2025</p>
          <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto">
            Your privacy is important. Starlight is a demo application designed with a privacy-first approach. We don't have servers, so we don't store your data. It all stays with you.
          </p>
        </header>

        {/* Full Policy */}
        <h2 className="text-3xl font-bold text-center mb-8">Privacy at a Glance</h2>
        <div className="space-y-6">
          
          <PolicySection icon={Info} title="1. Our Philosophy">
            <p>Welcome to Starlight. This Privacy Policy explains our minimalist approach to data in this demonstration application. Since Starlight is a client-side showcase without a production backend, our data handling practices are fundamentally different from typical web services and are designed to be as private as possible.</p>
          </PolicySection>
          
          <PolicySection icon={Database} title="2. Information We Store (Locally)">
            <p>Starlight does not have a central database. All data related to your use of the application is stored on your own device within your browser's Local Storage. We do not have access to this information. This locally-stored data includes:</p>
            <ul className="list-disc list-inside space-y-3 mt-4 pl-4 text-sm">
              <li><strong>Account Information:</strong> Your name, email, and avatar URL are saved locally to keep you logged in between sessions.</li>
              <li><strong>User Activity:</strong> Data such as your watch history, liked videos, watch later list, and community subscriptions are stored in your browser to personalize your experience.</li>
              <li><strong>User-Generated Content:</strong> Metadata for any videos you "upload," playlists you create, and reports you submit are all stored locally. No actual video files are uploaded to any server.</li>
              <li><strong>Application Settings:</strong> Your preferences, such as theme choice (light/dark) and language selection, are saved to provide a consistent experience.</li>
            </ul>
          </PolicySection>

          <PolicySection icon={Cog} title="3. How We Use This Information">
              <p>The data stored in your browser is used exclusively to make the application function correctly and provide a personalized experience on your device. For example:</p>
               <ul className="list-disc list-inside space-y-3 mt-4 pl-4 text-sm">
                  <li>Your user profile is used to display your name and avatar throughout the app.</li>
                  <li>Your watch history populates the "History" page for your convenience.</li>
                  <li>Your settings are used to apply the correct theme when you open the app.</li>
              </ul>
          </PolicySection>

          <PolicySection icon={Share2} title="4. Third-Party Services">
             <p>While Starlight has no backend of its own, it interacts with essential third-party services to function. Your interaction with these services is governed by their respective privacy policies.</p>
             <ul className="list-disc list-inside space-y-4 mt-4 pl-4 text-sm">
                <li><strong>Google Gemini API:</strong> The app sends text prompts to the Google Gemini API to generate content like video titles, comments, and search results. These requests are stateless and are not linked to your personal identity. Data handling is governed by the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--accent-color))] hover:underline font-medium">Google Privacy Policy</a>.</li>
                <li><strong>Google Sign-In:</strong> If you use Google to sign in, we use their service for authentication. We only receive your basic profile info (name, email, avatar) and store it locally. We do not send any of your activity data from our app back to Google.</li>
                <li><strong>Placeholder Images:</strong> We use services like <a href="https://picsum.photos/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--accent-color))] hover:underline font-medium">Picsum Photos</a> and <a href="https://www.dicebear.com/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--accent-color))] hover:underline font-medium">Dicebear</a> for placeholder images. These services receive non-identifiable requests to generate visuals.</li>
            </ul>
          </PolicySection>
          
          <PolicySection icon={UserCheck} title="5. Your Control Over Your Data">
            <p>You have complete and direct control over your data in Starlight. Because all information is stored locally in your browser, you can view, manage, and delete it at any time using your browser's developer tools.</p>
            <p><strong>The easiest way to erase all your data is to clear your browser's cache and site data for this application.</strong> This action will completely reset the app to its default state, log you out, and delete all stored history, settings, and uploads.</p>
          </PolicySection>

           <PolicySection icon={Cookie} title="6. Cookies and Tracking Technologies">
            <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
            <p>We use local storage cookies to persist your session state, preferences (like dark mode), and locally saved content. These are essential for the application to function correctly as a client-side app.</p>
          </PolicySection>

           <PolicySection icon={Smile} title="7. Children's Privacy">
            <p>Starlight is a technical demonstration and is not intended for use by anyone under the age of 13. We do not knowingly collect any data from children because we do not collect data from anyone on a central server.</p>
          </PolicySection>

           <PolicySection icon={FileClock} title="8. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time to reflect changes in functionality or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new policy on this page.</p>
          </PolicySection>

           {/* Contact */}
           <div className="text-center pt-8">
                <h3 className="text-xl font-bold mb-3">Questions?</h3>
                <p className="text-[var(--text-secondary)]">If you have any questions about this Privacy Policy, please contact us.</p>
                <a href="mailto:privacy@starlight.app" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-[var(--background-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-full font-bold hover:bg-[var(--background-tertiary)] transition-all">
                    <Mail className="w-5 h-5" /> privacy@starlight.app
                </a>
           </div>
        </div>
      </div>
    </div>
  );
};
