
import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, CheckCircle, AlertCircle, RefreshCw, Wallet, Building, Clock, IndianRupee, Globe } from 'lucide-react';
import { Transaction } from '../types';

// PhonePe Icon
const PhonePeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM11.192 15.228C11.399 15.688 11.756 16.035 12.284 16.035C12.923 16.035 13.31 15.657 13.31 15.228C13.31 14.829 13.016 14.535 12.377 14.341L11.708 14.136C10.875 13.881 10.458 13.431 10.458 12.783C10.458 12.018 11.161 11.451 12.224 11.451C13.141 11.451 13.791 11.85 14.067 12.447L14.77 11.13C14.283 10.593 13.488 10.26 12.512 10.26C11.954 10.26 11.417 10.377 10.976 10.593C10.154 11.022 9.64601 11.829 9.64601 12.798C9.64601 13.986 10.397 14.751 11.531 15.111L12.213 15.326C13.025 15.57 13.488 15.969 13.488 16.596C13.488 17.316 12.871 17.853 11.965 17.853C10.88 17.853 10.129 17.327 9.87401 16.71L9.17101 18.027C9.72901 18.519 10.667 18.9 11.729 18.9C12.338 18.9 12.926 18.771 13.434 18.528C14.329 18.1095 14.887 17.316 14.887 16.299C14.887 15.003 14.019 14.2275 12.841 13.881L12.159 13.665C11.368 13.422 10.88 13.098 10.88 12.486C10.88 11.97 11.297 11.583 11.894 11.583C12.382 11.583 12.787 11.7555 13.063 12.1155L13.755 10.809C13.208 10.239 12.386 9.84 11.47 9.84C10.746 9.84 10.054 10.0335 9.51601 10.422C8.61101 11.049 8.08301 11.958 8.08301 13.047C8.08301 14.313 8.94701 15.15 10.173 15.588L10.855 15.804C11.041 15.8625 11.129 15.909 11.192 15.9945V15.228Z" fill="currentColor"/>
        <path d="M16.5913 14.0625L17.7523 11.9445L16.2223 11.13L15.0613 13.248L16.5913 14.0625Z" fill="currentColor"/>
        <path d="M15.421 8.16C15.034 7.905 14.542 7.749 14.005 7.749C12.97 7.749 12.118 8.199 11.668 8.871L12.964 9.603C13.093 9.429 13.318 9.2145 13.696 9.2145C14.083 9.2145 14.338 9.429 14.467 9.603C14.5855 9.777 14.596 9.99 14.536 10.2045L13.2505 15.021L14.887 15.021L16.561 8.841C16.327 8.424 15.9595 8.16 15.421 8.16Z" fill="currentColor"/>
    </svg>
);

// RuPay Icon (Simplified)
const RuPayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 15H10.5C12.5 15 13.5 14 13.5 12C13.5 10 12.5 9 10.5 9H7V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.5 12.5L16.5 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Mock data
const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'tx_1', sponsorName: 'TechCorp Inc.', campaignId: 'cmp_alpha', amount: '$4,500.00', date: '2025-03-10', status: 'Completed', method: 'Credit Card' },
    { id: 'tx_2', sponsorName: 'GreenEnergy Co.', campaignId: 'cmp_beta', amount: '$2,100.00', date: '2025-03-12', status: 'Pending', method: 'Bank Transfer' },
    { id: 'tx_3', sponsorName: 'Urban Style', campaignId: 'cmp_gamma', amount: '$850.00', date: '2025-03-14', status: 'Completed', method: 'PayPal' },
    { id: 'tx_4', sponsorName: 'Foodie Express', campaignId: 'cmp_delta', amount: '$1,200.00', date: '2025-03-15', status: 'Failed', method: 'Credit Card' },
    { id: 'tx_5', sponsorName: 'NextGen Gaming', campaignId: 'cmp_epsilon', amount: '$3,000.00', date: '2025-03-15', status: 'Pending', method: 'Credit Card' },
];

const MOCK_INR_TRANSACTIONS: Transaction[] = [
    { id: 'tx_inr_1', sponsorName: 'Chai Point', campaignId: 'cmp_inr_1', amount: '₹3,75,000.00', date: '2025-03-10', status: 'Completed', method: 'Credit Card' },
    { id: 'tx_inr_2', sponsorName: 'Desi Drapes', campaignId: 'cmp_inr_2', amount: '₹1,68,000.00', date: '2025-03-12', status: 'Pending', method: 'Bank Transfer' },
    { id: 'tx_inr_3', sponsorName: 'Spice Route', campaignId: 'cmp_inr_3', amount: '₹68,000.00', date: '2025-03-14', status: 'Completed', method: 'PayPal' },
    { id: 'tx_inr_4', sponsorName: 'Belly Buns', campaignId: 'cmp_inr_4', amount: '₹96,000.00', date: '2025-03-15', status: 'Failed', method: 'Credit Card' },
    { id: 'tx_inr_5', sponsorName: 'Indie Games Studio', campaignId: 'cmp_inr_5', amount: '₹2,40,000.00', date: '2025-03-15', status: 'Pending', method: 'Credit Card' },
];

export const PaymentGateway: React.FC = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<'stripe' | 'paypal' | 'phonepe' | 'rupay' | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
    const [region, setRegion] = useState<'Global' | 'India'>('Global');
    const [isDetecting, setIsDetecting] = useState(false);

    const handleConnect = (provider: 'stripe' | 'paypal' | 'phonepe' | 'rupay') => {
        setSelectedProvider(provider);
        setIsConnecting(true);
        setTimeout(() => {
            setIsConnected(true);
            setIsConnecting(false);
            
            // Switch to INR transactions if India-specific providers are selected
            if (provider === 'phonepe' || provider === 'rupay') {
                setTransactions(MOCK_INR_TRANSACTIONS);
            } else {
                setTransactions(MOCK_TRANSACTIONS);
            }
        }, 2000);
    };

    const handleAutoDetect = () => {
        setIsDetecting(true);
        setTimeout(() => {
            // Simulate detection logic - let's toggle based on current state for demo purposes
            // In a real app, this would use IP geolocation or browser locale
            const newRegion = region === 'Global' ? 'India' : 'Global';
            setRegion(newRegion);
            // Reset connection when region changes to force re-selection appropriate for region
            setIsConnected(false);
            setSelectedProvider(null);
            setIsDetecting(false);
        }, 1200);
    };

    const processTransaction = (id: string) => {
        setTransactions(prev => prev.map(t => 
            t.id === id ? { ...t, status: 'Completed' } : t
        ));
    };

    const totalRevenue = transactions
        .filter(t => t.status === 'Completed')
        .reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^0-9.-]+/g,"")), 0);

    const pendingAmount = transactions
        .filter(t => t.status === 'Pending')
        .reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^0-9.-]+/g,"")), 0);

    const currencySymbol = (selectedProvider === 'phonepe' || selectedProvider === 'rupay') ? '₹' : '$';

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] max-w-4xl w-full text-center shadow-xl">
                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={handleAutoDetect} 
                            disabled={isDetecting}
                            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--background-tertiary)] hover:bg-[var(--background-primary)] border border-[var(--border-primary)] transition-colors"
                        >
                            {isDetecting ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Globe className="w-3 h-3"/>}
                            {isDetecting ? 'Detecting...' : `Region: ${region} (Auto-Select)`}
                        </button>
                    </div>

                    <div className="w-20 h-20 bg-[hsl(var(--accent-color))]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Wallet className="w-10 h-10 text-[hsl(var(--accent-color))]" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Set up Payments</h2>
                    <p className="text-[var(--text-secondary)] mb-8">
                        {region === 'India' 
                            ? 'Select a payment method optimized for India.' 
                            : 'Select a global payment gateway to receive funds.'}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {region === 'Global' ? (
                            <>
                                <button 
                                    onClick={() => handleConnect('stripe')}
                                    disabled={isConnecting}
                                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 ${selectedProvider === 'stripe' && isConnecting ? 'border-[hsl(var(--accent-color))] bg-[hsl(var(--accent-color))]/5' : 'border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] hover:bg-[var(--background-tertiary)]'}`}
                                >
                                    <div className="font-bold text-2xl">Stripe</div>
                                    <p className="text-sm text-[var(--text-secondary)]">Accept credit cards & bank transfers globally.</p>
                                    {selectedProvider === 'stripe' && isConnecting && <RefreshCw className="w-5 h-5 animate-spin text-[hsl(var(--accent-color))]" />}
                                </button>

                                <button 
                                    onClick={() => handleConnect('paypal')}
                                    disabled={isConnecting}
                                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 ${selectedProvider === 'paypal' && isConnecting ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--border-primary)] hover:border-blue-500 hover:bg-[var(--background-tertiary)]'}`}
                                >
                                    <div className="font-bold text-2xl text-blue-600 italic">PayPal</div>
                                    <p className="text-sm text-[var(--text-secondary)]">Fast and secure payments with PayPal business.</p>
                                    {selectedProvider === 'paypal' && isConnecting && <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />}
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => handleConnect('phonepe')}
                                    disabled={isConnecting}
                                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 ${selectedProvider === 'phonepe' && isConnecting ? 'border-[#6739B7] bg-[#6739B7]/5' : 'border-[var(--border-primary)] hover:border-[#6739B7] hover:bg-[var(--background-tertiary)]'}`}
                                >
                                    <PhonePeIcon className="w-8 h-8 text-[#6739B7]" />
                                    <div className="font-bold text-2xl text-[#6739B7]">PhonePe</div>
                                    <p className="text-sm text-[var(--text-secondary)]">Secure UPI & Wallet Payments for India.</p>
                                    {selectedProvider === 'phonepe' && isConnecting && <RefreshCw className="w-5 h-5 animate-spin text-[#6739B7]" />}
                                </button>

                                <button 
                                    onClick={() => handleConnect('rupay')}
                                    disabled={isConnecting}
                                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 ${selectedProvider === 'rupay' && isConnecting ? 'border-orange-500 bg-orange-500/5' : 'border-[var(--border-primary)] hover:border-orange-500 hover:bg-[var(--background-tertiary)]'}`}
                                >
                                    <RuPayIcon className="w-10 h-10 text-orange-500" />
                                    <div className="font-bold text-2xl text-orange-500">RuPay</div>
                                    <p className="text-sm text-[var(--text-secondary)]">Domestic card payments for India.</p>
                                    {selectedProvider === 'rupay' && isConnecting && <RefreshCw className="w-5 h-5 animate-spin text-orange-500" />}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--background-secondary)] p-6 rounded-xl border border-[var(--border-primary)]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
                            {(selectedProvider === 'phonepe' || selectedProvider === 'rupay') ? <IndianRupee className="w-6 h-6" /> : <DollarSign className="w-6 h-6" />}
                        </div>
                        <span className="text-xs font-bold bg-green-500/10 text-green-500 px-2 py-1 rounded-full">+12.5%</span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm">Total Revenue</p>
                    <h3 className="text-3xl font-bold">{currencySymbol}{totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                </div>

                <div className="bg-[var(--background-secondary)] p-6 rounded-xl border border-[var(--border-primary)]">
                    <div className="flex justify-between items-start mb-4">
                         <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm">Pending Clearance</p>
                    <h3 className="text-3xl font-bold">{currencySymbol}{pendingAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                </div>

                <div className="bg-[var(--background-secondary)] p-6 rounded-xl border border-[var(--border-primary)]">
                    <div className="flex justify-between items-start mb-4">
                         <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                            <Building className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs text-[var(--text-secondary)]">Active</span>
                        </div>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm">Gateway Status</p>
                    <h3 className="text-xl font-bold">
                        {selectedProvider === 'stripe' ? 'Stripe Connect' : selectedProvider === 'paypal' ? 'PayPal Business' : selectedProvider === 'phonepe' ? 'PhonePe Business' : 'RuPay Merchant'}
                    </h3>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
                <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center">
                    <h3 className="font-bold text-lg">Recent Transactions</h3>
                    <button className="text-sm text-[hsl(var(--accent-color))] hover:underline">Export CSV</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--background-tertiary)] text-[var(--text-secondary)] uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Sponsor</th>
                                <th className="px-6 py-4">Campaign ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-primary)]">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-[var(--background-tertiary)]/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{tx.sponsorName}</td>
                                    <td className="px-6 py-4 text-[var(--text-secondary)]">{tx.campaignId}</td>
                                    <td className="px-6 py-4 text-[var(--text-secondary)]">{tx.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-[var(--text-tertiary)]" />
                                            {tx.method}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold">{tx.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${tx.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 
                                              tx.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                                              'bg-red-500/10 text-red-500'}`}>
                                            {tx.status === 'Completed' && <CheckCircle className="w-3 h-3" />}
                                            {tx.status === 'Failed' && <AlertCircle className="w-3 h-3" />}
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {tx.status === 'Pending' ? (
                                            <button 
                                                onClick={() => processTransaction(tx.id)}
                                                className="text-xs bg-[hsl(var(--accent-color))] text-white px-3 py-1.5 rounded-lg hover:brightness-90 transition-all"
                                            >
                                                Process
                                            </button>
                                        ) : (
                                            <span className="text-[var(--text-tertiary)] text-xs">View</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
