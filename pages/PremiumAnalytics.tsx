
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    Gem, TrendingUp, DollarSign, Eye, Clock, Users, MapPin, 
    Download, Calendar, BarChart2, Globe
} from 'lucide-react';
import { Video } from '../types';

interface Metric {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: React.ElementType;
}

interface LocationData {
    country: string;
    city: string;
    viewers: number;
    percentage: string;
}

export const PremiumAnalytics: React.FC = () => {
    const { currentUser, isPremium } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // Analytics State
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [adsDisplayed, setAdsDisplayed] = useState(0);
    const [adWatchHours, setAdWatchHours] = useState(0);
    const [uniqueVisitors, setUniqueVisitors] = useState(0);
    const [topLocations, setTopLocations] = useState<LocationData[]>([]);
    const [cpm, setCpm] = useState(0); // Cost Per Mille (1000 impressions)

    useEffect(() => {
        if (!currentUser) {
            navigate('/signup');
            return;
        }
        if (!isPremium) {
            navigate('/premium');
            return;
        }

        // Simulate fetching advanced data
        const loadData = () => {
            setLoading(true);
            
            // Deterministic random data based on user name
            const seed = currentUser.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
            
            const uploadedVideosJSON = localStorage.getItem('starlight_uploaded_videos');
            const videos: Video[] = uploadedVideosJSON ? JSON.parse(uploadedVideosJSON) : [];
            const userVideoCount = videos.filter(v => v.uploaderName === currentUser.name).length;
            
            // Generate plausible stats
            const baseViews = (userVideoCount * 1500) + (seed * 10);
            const adsCount = Math.floor(baseViews * 0.45); // 45% fill rate
            const hours = Math.floor(adsCount * 15 / 3600); // 15 sec avg ad length
            const visitors = Math.floor(baseViews * 0.7);
            const revenue = (adsCount / 1000) * 4.25; // $4.25 CPM approx
            
            setTotalRevenue(revenue);
            setAdsDisplayed(adsCount);
            setAdWatchHours(hours);
            setUniqueVisitors(visitors);
            setCpm(4.25 + (seed % 200) / 100);

            // Mock Locations
            setTopLocations([
                { country: 'United States', city: 'New York', viewers: Math.floor(visitors * 0.35), percentage: '35%' },
                { country: 'India', city: 'Mumbai', viewers: Math.floor(visitors * 0.25), percentage: '25%' },
                { country: 'United Kingdom', city: 'London', viewers: Math.floor(visitors * 0.15), percentage: '15%' },
                { country: 'Germany', city: 'Berlin', viewers: Math.floor(visitors * 0.10), percentage: '10%' },
                { country: 'Other', city: 'Various', viewers: Math.floor(visitors * 0.15), percentage: '15%' },
            ]);

            setLoading(false);
        };

        setTimeout(loadData, 800);
    }, [currentUser, isPremium, navigate]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[hsl(var(--accent-color))] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[var(--text-secondary)] font-medium">Crunching Premium Data...</p>
                </div>
            </div>
        );
    }

    const StatCard = ({ label, value, subtext, icon: Icon, colorClass }: { label: string, value: string, subtext: string, icon: React.ElementType, colorClass: string }) => (
        <div className="bg-[var(--background-secondary)] p-6 rounded-xl border border-[var(--border-primary)] shadow-sm print:border-gray-300 print:shadow-none print:break-inside-avoid">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium">{label}</p>
                    <h3 className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
                    <Icon className={`w-6 h-6 ${colorClass}`} />
                </div>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" /> {subtext}
            </p>
        </div>
    );

    return (
        <div className="w-full h-full overflow-y-auto bg-[var(--background-primary)] text-[var(--text-primary)]">
            {/* Report Container ID for Print Styling */}
            <div id="premium-analytics-report" className="max-w-6xl mx-auto p-6 md:p-10">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-[var(--border-primary)]">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Gem className="w-8 h-8 text-amber-500" />
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600 print:text-black">
                                Premium Analytics
                            </h1>
                        </div>
                        <p className="text-[var(--text-secondary)]">
                            Deep insights for <span className="font-semibold text-[var(--text-primary)]">{currentUser?.name}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3 no-print">
                        <span className="text-sm text-[var(--text-secondary)] bg-[var(--background-secondary)] px-3 py-1.5 rounded-full border border-[var(--border-primary)]">
                            Last 30 Days
                        </span>
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 transition-all shadow-md"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download Report (PDF)</span>
                        </button>
                    </div>
                    {/* Print Only Date Header */}
                    <div className="hidden print:block text-right">
                        <p className="text-sm text-gray-500">Report Generated on:</p>
                        <p className="font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Financial Overview */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-500" /> Financial Overview
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print-grid">
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-xl border border-green-500/20 print:border-gray-300 print:bg-white">
                            <p className="text-sm font-semibold text-green-700 dark:text-green-400">Total Estimated Revenue</p>
                            <h3 className="text-3xl font-bold mt-2 text-green-900 dark:text-green-100 print:text-black">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                            <p className="text-xs text-green-600/80 mt-2">+12.5% from last month</p>
                        </div>
                        <StatCard 
                            label="CPM (Cost Per Mille)" 
                            value={`$${cpm.toFixed(2)}`} 
                            subtext="Average rate per 1,000 views" 
                            icon={BarChart2} 
                            colorClass="text-blue-500" 
                        />
                        <StatCard 
                            label="RPM (Revenue Per Mille)" 
                            value={`$${(cpm * 0.55).toFixed(2)}`} 
                            subtext="Your take-home per 1,000 views" 
                            icon={DollarSign} 
                            colorClass="text-purple-500" 
                        />
                    </div>
                </div>

                {/* Ad Performance */}
                <div className="mb-8 print-break-inside">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-blue-500" /> Ad Performance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print-grid">
                        <StatCard 
                            label="Ads Displayed" 
                            value={adsDisplayed.toLocaleString()} 
                            subtext="Total ad impressions on content" 
                            icon={Eye} 
                            colorClass="text-indigo-500" 
                        />
                        <StatCard 
                            label="Ad Watch Hours" 
                            value={`${adWatchHours} hrs`} 
                            subtext="Time audience spent watching ads" 
                            icon={Clock} 
                            colorClass="text-orange-500" 
                        />
                        <StatCard 
                            label="Unique Visitors" 
                            value={uniqueVisitors.toLocaleString()} 
                            subtext="Distinct viewers this month" 
                            icon={Users} 
                            colorClass="text-pink-500" 
                        />
                        <StatCard 
                            label="Fill Rate" 
                            value="94.2%" 
                            subtext="Monetized playback ratio" 
                            icon={Calendar} 
                            colorClass="text-teal-500" 
                        />
                    </div>
                </div>

                {/* Audience Geography */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print-grid print-break-inside">
                    <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] p-6 print:border-gray-300">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-500" /> Top Audience Locations
                        </h3>
                        <div className="space-y-4">
                            {topLocations.map((loc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[var(--background-primary)] rounded-lg border border-[var(--border-primary)] print:border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--background-tertiary)] flex items-center justify-center font-bold text-xs text-[var(--text-secondary)]">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{loc.city}, {loc.country}</p>
                                            <p className="text-xs text-[var(--text-tertiary)]">{loc.viewers.toLocaleString()} viewers</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden hidden sm:block print:block">
                                            <div className="h-full bg-[hsl(var(--accent-color))]" style={{ width: loc.percentage }}></div>
                                        </div>
                                        <span className="font-bold text-sm">{loc.percentage}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] p-6 flex flex-col justify-center print:border-gray-300">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-500" /> Geographic Distribution
                        </h3>
                        <div className="flex-1 flex items-center justify-center relative min-h-[300px] bg-[var(--background-primary)] rounded-xl border border-[var(--border-primary)] print:border-gray-200">
                            {/* Abstract Map Placeholder Visualization */}
                            <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-contain bg-no-repeat bg-center"></div>
                            
                            {/* Animated Pulse Points for Locations */}
                            <div className="relative w-full h-full">
                                <div className="absolute top-[30%] left-[25%] w-3 h-3 bg-red-500 rounded-full animate-ping"></div> {/* US */}
                                <div className="absolute top-[30%] left-[25%] w-3 h-3 bg-red-500 rounded-full"></div>
                                
                                <div className="absolute top-[45%] left-[68%] w-3 h-3 bg-blue-500 rounded-full animate-ping delay-300"></div> {/* India */}
                                <div className="absolute top-[45%] left-[68%] w-3 h-3 bg-blue-500 rounded-full"></div>

                                <div className="absolute top-[25%] left-[48%] w-3 h-3 bg-green-500 rounded-full animate-ping delay-700"></div> {/* UK/EU */}
                                <div className="absolute top-[25%] left-[48%] w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            
                            <p className="absolute bottom-4 text-xs text-[var(--text-tertiary)] bg-[var(--background-secondary)] px-3 py-1 rounded-full shadow-sm">
                                Real-time heatmap visualization (Simulated)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--border-primary)] text-center text-xs text-[var(--text-tertiary)] print:block hidden">
                    <p>StarLight Premium Creator Report • Confidential • {currentUser?.email}</p>
                </div>
            </div>
        </div>
    );
};
