
import React, { useState } from 'react';
import { CreditCard, DollarSign, CheckCircle, AlertCircle, RefreshCw, Wallet, Building, Clock } from 'lucide-react';
import { Transaction } from '../types';

// Mock data
const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'tx_1', sponsorName: 'TechCorp Inc.', campaignId: 'cmp_alpha', amount: '$4,500.00', date: '2025-03-10', status: 'Completed', method: 'Credit Card' },
    { id: 'tx_2', sponsorName: 'GreenEnergy Co.', campaignId: 'cmp_beta', amount: '$2,100.00', date: '2025-03-12', status: 'Pending', method: 'Bank Transfer' },
    { id: 'tx_3', sponsorName: 'Urban Style', campaignId: 'cmp_gamma', amount: '$850.00', date: '2025-03-14', status: 'Completed', method: 'PayPal' },
    { id: 'tx_4', sponsorName: 'Foodie Express', campaignId: 'cmp_delta', amount: '$1,200.00', date: '2025-03-15', status: 'Failed', method: 'Credit Card' },
    { id: 'tx_5', sponsorName: 'NextGen Gaming', campaignId: 'cmp_epsilon', amount: '$3,000.00', date: '2025-03-15', status: 'Pending', method: 'Credit Card' },
];

export const PaymentGateway: React.FC = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
    const [selectedProvider, setSelectedProvider] = useState<'stripe' | 'paypal' | null>(null);

    const handleConnect = (provider: 'stripe' | 'paypal') => {
        setSelectedProvider(provider);
        setIsConnecting(true);
        setTimeout(() => {
            setIsConnected(true);
            setIsConnecting(false);
        }, 2000);
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

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] max-w-2xl w-full text-center shadow-xl">
                    <div className="w-20 h-20 bg-[hsl(var(--accent-color))]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Wallet className="w-10 h-10 text-[hsl(var(--accent-color))]" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Set up Payments</h2>
                    <p className="text-[var(--text-secondary)] mb-8">To receive payments from ad sponsors, please connect a payment gateway provider.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold bg-green-500/10 text-green-500 px-2 py-1 rounded-full">+12.5%</span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm">Total Revenue</p>
                    <h3 className="text-3xl font-bold">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                </div>

                <div className="bg-[var(--background-secondary)] p-6 rounded-xl border border-[var(--border-primary)]">
                    <div className="flex justify-between items-start mb-4">
                         <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm">Pending Clearance</p>
                    <h3 className="text-3xl font-bold">${pendingAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
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
                    <h3 className="text-xl font-bold">{selectedProvider === 'stripe' ? 'Stripe Connect' : 'PayPal Business'}</h3>
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
