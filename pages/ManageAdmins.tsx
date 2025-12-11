
import React, { useState, useEffect, useCallback } from 'react';
import { Admin, AdminRole, ADMIN_ROLES } from '../types';
import { Loader2, PlusCircle, UserPlus, Users, Trash2, Edit, Save, X, Shield, MapPin, AlertCircle } from 'lucide-react';
import { COUNTRIES, USA_STATES, INDIAN_STATES, UK_STATES, ANDHRA_PRADESH_CITIES, ANDHRA_PRADESH_CONSTITUENCIES } from '../constants';

const ADMINS_STORAGE_KEY = 'starlight_admins';

const MOCK_ADMINS: Admin[] = [
    { id: 'admin-1', name: 'Admin', email: 'admin@starlight.app', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminStarlight', role: 'Lead Admin', country: 'United States of America', state: 'California', city: 'Mountain View' },
    { id: 'admin-2', name: 'Priya Sharma', email: 'priya.s@starlight.app', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSharma', role: 'Content Moderator', country: 'India', state: 'Maharashtra', city: 'Mumbai' },
    { id: 'admin-3', name: 'John Smith', email: 'john.s@starlight.app', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnSmith', role: 'Ad Manager', country: 'United Kingdom', state: 'England', city: 'London' },
    { id: 'admin-4', name: 'Yuki Tanaka', email: 'yuki.t@starlight.app', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YukiTanaka', role: 'Regional Lead', country: 'Japan', city: 'Tokyo' },
];

export const ManageAdmins: React.FC = () => {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [formState, setFormState] = useState<Partial<Admin>>({});
    const [error, setError] = useState('');

    const loadAdmins = useCallback(() => {
        setLoading(true);
        try {
            let allAdmins: Admin[] = [];
            const adminsJson = localStorage.getItem(ADMINS_STORAGE_KEY);
            if (adminsJson) {
                allAdmins = JSON.parse(adminsJson);
            } else {
                allAdmins = MOCK_ADMINS;
                localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(allAdmins));
            }
            setAdmins(allAdmins.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (err) { console.error("Failed to load admins", err); }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadAdmins();
    }, [loadAdmins]);

    const handleOpenForm = (admin: Admin | null = null) => {
        if (admin) {
            setEditingAdmin(admin);
            setFormState(admin);
        } else {
            setEditingAdmin(null);
            setFormState({ role: 'Content Moderator', country: 'India' });
        }
        setError('');
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingAdmin(null);
        setFormState({});
        setError('');
    };

    const handleDelete = (adminId: string) => {
        if (adminId === 'admin-1') {
            alert("The Lead Admin cannot be deleted.");
            return;
        }
        if (window.confirm("Are you sure you want to remove this admin?")) {
            const updatedAdmins = admins.filter(admin => admin.id !== adminId);
            setAdmins(updatedAdmins);
            localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(updatedAdmins));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formState.name || !formState.email || !formState.role || !formState.country) {
            setError('Please fill all required fields: Name, Email, Role, and Country.');
            return;
        }

        const emailExists = admins.some(
            admin => admin.email === formState.email && admin.id !== editingAdmin?.id
        );

        if (emailExists) {
            setError('An admin with this email already exists.');
            return;
        }

        let updatedAdmins;
        if (editingAdmin) {
            updatedAdmins = admins.map(admin =>
                admin.id === editingAdmin.id ? { ...admin, ...formState } as Admin : admin
            );
        } else {
            const newAdmin: Admin = {
                id: `admin-${Date.now()}`,
                name: formState.name,
                email: formState.email,
                role: formState.role,
                country: formState.country,
                state: formState.state,
                district: formState.district,
                city: formState.city,
                constituency: formState.constituency,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formState.name.replace(/\s/g, '')}`,
            };
            updatedAdmins = [...admins, newAdmin];
        }

        setAdmins(updatedAdmins.sort((a, b) => a.name.localeCompare(b.name)));
        localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(updatedAdmins));
        handleCloseForm();
    };
    
    const stateOptions = formState.country === 'India' ? INDIAN_STATES : formState.country === 'United States of America' ? USA_STATES : formState.country === 'United Kingdom' ? UK_STATES : [];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-[hsl(var(--accent-color))]"/>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Manage Admins</h1>
                </div>
                <button 
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--accent-color))] text-white rounded-lg font-semibold filter hover:brightness-90 transition-colors shadow-md w-full sm:w-auto"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>Add New Admin</span>
                </button>
            </div>
            
            {loading ? <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin"/></div> : (
                <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[var(--background-tertiary)]/50 text-xs text-[var(--text-secondary)] uppercase">
                                <tr>
                                    <th className="px-4 py-3">Admin</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Location</th>
                                    <th className="px-4 py-3 hidden sm:table-cell">Role</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map(admin => (
                                    <tr key={admin.id} className="border-b border-[var(--border-primary)] last:border-b-0 hover:bg-[var(--background-tertiary)]/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img src={admin.avatar} alt={admin.name} className="w-10 h-10 rounded-full" />
                                                <div>
                                                    <p className="font-bold text-base">{admin.name}</p>
                                                    <p className="text-xs text-[var(--text-tertiary)]">{admin.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[var(--text-secondary)] hidden md:table-cell">
                                            {[admin.city, admin.constituency, admin.district, admin.state, admin.country].filter(Boolean).join(', ')}
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${admin.role === 'Lead Admin' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                <Shield className="w-3.5 h-3.5" /> {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenForm(admin)} title="Edit Admin" className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-md"><Edit className="w-4 h-4" /></button>
                                                {admin.role !== 'Lead Admin' && <button onClick={() => handleDelete(admin.id)} title="Delete Admin" className="p-2 text-red-500 hover:bg-red-500/10 rounded-md"><Trash2 className="w-4 h-4" /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {isFormOpen && (
                 <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" onClick={handleCloseForm}>
                     <div className="bg-[var(--background-secondary)] rounded-xl shadow-2xl w-full max-w-2xl border border-[var(--border-primary)]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-5 border-b border-[var(--border-primary)]">
                          <h2 className="text-xl font-bold text-[var(--text-primary)]">{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</h2>
                          <button onClick={handleCloseForm} className="p-2 rounded-full hover:bg-[var(--background-tertiary)] transition-colors"><X className="w-5 h-5 text-[var(--text-secondary)]" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2"><label className="text-sm font-semibold text-[var(--text-secondary)]">Full Name *</label><input value={formState.name || ''} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg"/></div>
                                <div className="space-y-2"><label className="text-sm font-semibold text-[var(--text-secondary)]">Email *</label><input type="email" value={formState.email || ''} onChange={e => setFormState({...formState, email: e.target.value})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg"/></div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[var(--text-secondary)]">Role *</label>
                                <select value={formState.role || ''} onChange={e => setFormState({...formState, role: e.target.value as AdminRole})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg" disabled={editingAdmin?.role === 'Lead Admin'}>
                                    {ADMIN_ROLES.map(role => {
                                        if (role === 'Lead Admin' && editingAdmin?.role !== 'Lead Admin') return null;
                                        return <option key={role} value={role}>{role}</option>
                                    })}
                                </select>
                            </div>
                            <h3 className="text-md font-bold text-[var(--text-primary)] pt-4 mt-2 border-t border-[var(--border-primary)] flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2"><label className="text-sm font-semibold text-[var(--text-secondary)]">Country *</label><select value={formState.country || ''} onChange={e => setFormState({...formState, country: e.target.value, state: '', city: '', district: '', constituency: ''})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg"><option value="">Select Country</option>{COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--text-secondary)]">State / Region</label>
                                    {stateOptions.length > 0 ? (
                                        <select value={formState.state || ''} onChange={e => setFormState({...formState, state: e.target.value, city: '', constituency: ''})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg"><option value="">Select State</option>{stateOptions.map(s => <option key={s} value={s}>{s}</option>)}</select>
                                    ) : (
                                        <input value={formState.state || ''} onChange={e => setFormState({...formState, state: e.target.value})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg"/>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2"><label className="text-sm font-semibold text-[var(--text-secondary)]">District</label><input value={formState.district || ''} onChange={e => setFormState({...formState, district: e.target.value})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg"/></div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--text-secondary)]">City</label>
                                    {formState.state === 'Andhra Pradesh' ? (
                                        <select value={formState.city || ''} onChange={e => setFormState({...formState, city: e.target.value})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg">
                                            <option value="">Select City</option>
                                            {ANDHRA_PRADESH_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    ) : (
                                        <input value={formState.city || ''} onChange={e => setFormState({...formState, city: e.target.value})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg"/>
                                    )}
                                </div>
                            </div>
                            {formState.state === 'Andhra Pradesh' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--text-secondary)]">Constituency</label>
                                    <select value={formState.constituency || ''} onChange={e => setFormState({...formState, constituency: e.target.value})} className="w-full p-2 bg-[var(--background-primary)] border border-[var(--border-primary)] rounded-lg">
                                        <option value="">Select Constituency</option>
                                        {ANDHRA_PRADESH_CONSTITUENCIES.map(c => <option key={c.id} value={c.name}>{c.name}{c.isReservedSC ? ' (SC)' : ''}</option>)}
                                    </select>
                                </div>
                            )}
                            {error && <div className="flex items-start gap-2 text-red-500 text-sm bg-red-500/5 p-3 rounded-lg border border-red-500/10"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><p>{error}</p></div>}
                             <div className="flex justify-end pt-4"><button type="submit" className="px-5 py-2.5 bg-[hsl(var(--accent-color))] text-white font-bold rounded-lg hover:brightness-90 flex items-center gap-2"><Save className="w-4 h-4"/> Save</button></div>
                        </form>
                     </div>
                 </div>
            )}

        </div>
    );
};
