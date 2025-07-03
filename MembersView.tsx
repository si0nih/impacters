
import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { ICONS } from '../constants';
import Modal from './Modal';

const EMPTY_MEMBER: Member = { id: '', name: '', email: '', phone: '', birthday: '', anniversary: '' };

// Member Form Component
const MemberForm: React.FC<{ member: Member, onSave: (member: Member) => void, onCancel: () => void }> = ({ member, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Member>(member);

    useEffect(() => {
        setFormData(member);
    }, [member]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-400">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Birthday</label>
                <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Anniversary</label>
                <input type="date" name="anniversary" value={formData.anniversary} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Member</button>
            </div>
        </form>
    );
};


// CSV Uploader Component
const CsvUploader: React.FC<{ onUpload: (members: Omit<Member, 'id'>[]) => void }> = ({ onUpload }) => {
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setError(null);
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const text = event.target?.result as string;
                    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                    if (lines.length < 2) {
                        throw new Error("CSV must have a header row and at least one data row.");
                    }
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                    const requiredHeaders = ['name', 'email', 'phone', 'birthday', 'anniversary'];
                    if (!requiredHeaders.every(h => headers.includes(h))) {
                         throw new Error(`CSV header must contain: ${requiredHeaders.join(', ')}`);
                    }

                    const newMembers: Omit<Member, 'id'>[] = lines.slice(1).map(line => {
                        const values = line.split(',');
                        const memberData: any = {};
                        headers.forEach((header, i) => {
                            memberData[header] = values[i]?.trim() || '';
                        });
                        return {
                            name: memberData.name || '',
                            email: memberData.email || '',
                            phone: memberData.phone || '',
                            birthday: memberData.birthday || '',
                            anniversary: memberData.anniversary || '',
                        };
                    });
                    onUpload(newMembers);
                } catch (err: any) {
                    setError(err.message || 'Failed to parse CSV file.');
                } finally {
                   if(fileInputRef.current) fileInputRef.current.value = "";
                }
            };
            reader.readAsText(file);
        }
    };
    
    return (
        <div>
            <label className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-indigo-400 rounded-md shadow-sm border border-gray-600 cursor-pointer hover:bg-gray-600">
                {ICONS.upload}
                <span>Upload CSV</span>
                <input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            </label>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
};


// Main View Component
interface MembersViewProps {
  members: Member[];
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (member: Member) => void;
  deleteMember: (id: string) => void;
  bulkAddMembers: (members: Omit<Member, 'id'>[]) => void;
}

const MembersView: React.FC<MembersViewProps> = ({ members, addMember, updateMember, deleteMember, bulkAddMembers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMembers = members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const openAddModal = () => {
        setEditingMember(null);
        setIsModalOpen(true);
    };

    const openEditModal = (member: Member) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleSave = (member: Member) => {
        if (member.id) {
            updateMember(member);
        } else {
            addMember(member);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="flex items-center space-x-3">
                    <CsvUploader onUpload={bulkAddMembers} />
                    <button onClick={openAddModal} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        {ICONS.plus}
                        <span>Add Member</span>
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Birthday</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Anniversary</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {filteredMembers.map(member => (
                            <tr key={member.id} className="hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{member.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    <div>{member.email}</div>
                                    <div>{member.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{member.birthday}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{member.anniversary}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-3">
                                        <button onClick={() => openEditModal(member)} className="text-indigo-400 hover:text-indigo-300">{ICONS.pencil}</button>
                                        <button onClick={() => deleteMember(member.id)} className="text-red-500 hover:text-red-400">{ICONS.trash}</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMember ? 'Edit Member' : 'Add New Member'}>
                <MemberForm 
                    member={editingMember || EMPTY_MEMBER} 
                    onSave={handleSave} 
                    onCancel={() => setIsModalOpen(false)} 
                />
            </Modal>
        </div>
    );
};

export default MembersView;