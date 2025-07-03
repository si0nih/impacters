
import React, { useState, useEffect } from 'react';
import { Event, Member } from '../types';
import { ICONS } from '../constants';
import Modal from './Modal';

const EMPTY_EVENT: Event = { id: '', title: '', date: '', description: '', attendance: [] };

// Event Form Component
const EventForm: React.FC<{ event: Event, onSave: (event: Event) => void, onCancel: () => void }> = ({ event, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Event>(event);

    useEffect(() => { setFormData(event); }, [event]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                <label className="block text-sm font-medium text-gray-400">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Event</button>
            </div>
        </form>
    );
};


// Attendance Modal
const AttendanceModal: React.FC<{ event: Event, members: Member[], onSave: (event: Event) => void, onClose: () => void }> = ({ event, members, onSave, onClose }) => {
    const [attendance, setAttendance] = useState<string[]>(event.attendance);

    const handleToggle = (memberId: string) => {
        setAttendance(prev => prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]);
    };
    
    const handleSave = () => {
        onSave({...event, attendance});
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Attendance for ${event.title}`}>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                        <label htmlFor={`member-${member.id}`} className="font-medium text-gray-200">{member.name}</label>
                        <input id={`member-${member.id}`} type="checkbox" checked={attendance.includes(member.id)} onChange={() => handleToggle(member.id)} className="h-5 w-5 rounded text-indigo-500 focus:ring-indigo-600 border-gray-500 bg-gray-600 focus:ring-offset-gray-800"/>
                    </div>
                ))}
            </div>
            <div className="flex justify-end space-x-3 pt-6">
                <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Attendance</button>
            </div>
        </Modal>
    );
};

// Main View Component
interface EventsViewProps {
  events: Event[];
  members: Member[];
  addEvent: (event: Omit<Event, 'id' | 'attendance'>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
}

const EventsView: React.FC<EventsViewProps> = ({ events, members, addEvent, updateEvent, deleteEvent }) => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const openAddModal = () => {
        setSelectedEvent(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (event: Event) => {
        setSelectedEvent(event);
        setIsFormModalOpen(true);
    };
    
    const openAttendanceModal = (event: Event) => {
        setSelectedEvent(event);
        setIsAttendanceModalOpen(true);
    }

    const handleSave = (event: Event) => {
        if (event.id) {
            updateEvent(event);
        } else {
            addEvent(event);
        }
        setIsFormModalOpen(false);
    };
    
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-100">Events</h2>
                <button onClick={openAddModal} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    {ICONS.plus}
                    <span>Add Event</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedEvents.map(event => (
                    <div key={event.id} className="bg-gray-700 rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition-shadow">
                        <div>
                            <p className="text-xs text-gray-400">{event.date}</p>
                            <h3 className="font-bold text-lg text-gray-100 mt-1">{event.title}</h3>
                            <p className="text-sm text-gray-300 mt-2 h-16 overflow-hidden">{event.description}</p>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <button onClick={() => openAttendanceModal(event)} className="flex items-center space-x-2 text-sm font-medium text-teal-400 hover:text-teal-300">
                                {ICONS.attendance}
                                <span>Attendance ({event.attendance.length}/{members.length})</span>
                            </button>
                            <div className="flex items-center space-x-3">
                                <button onClick={() => openEditModal(event)} className="text-indigo-400 hover:text-indigo-300">{ICONS.pencil}</button>
                                <button onClick={() => deleteEvent(event.id)} className="text-red-500 hover:text-red-400">{ICONS.trash}</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isFormModalOpen && (
                <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedEvent ? 'Edit Event' : 'Add New Event'}>
                    <EventForm event={selectedEvent || EMPTY_EVENT} onSave={handleSave} onCancel={() => setIsFormModalOpen(false)} />
                </Modal>
            )}

            {isAttendanceModalOpen && selectedEvent && (
                <AttendanceModal 
                    event={selectedEvent}
                    members={members}
                    onSave={updateEvent}
                    onClose={() => setIsAttendanceModalOpen(false)}
                />
            )}
        </div>
    );
};

export default EventsView;