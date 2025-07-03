import React, { useState, useCallback } from 'react';
import { Member, Event } from './types';
import { ICONS } from './constants';
import Dashboard from './components/Dashboard';
import MembersView from './components/MembersView';
import EventsView from './components/EventsView';
import ReportsView from './components/ReportsView';

type View = 'dashboard' | 'members' | 'events' | 'reports';

const MOCK_MEMBERS: Member[] = [
    { id: 'm1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', birthday: '1990-05-15', anniversary: '2015-06-20' },
    { id: 'm2', name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901', birthday: '1992-08-22', anniversary: '2018-07-10' },
    { id: 'm3', name: 'Peter Jones', email: 'peter@example.com', phone: '345-678-9012', birthday: '1985-12-01', anniversary: '' },
    { id: 'm4', name: 'Mary Garcia', email: 'mary@example.com', phone: '456-789-0123', birthday: '1995-05-30', anniversary: '2020-09-05' },
];

const MOCK_EVENTS: Event[] = [
    { id: 'e1', title: 'Weekly Bible Study', date: '2024-05-10', description: 'Chapter 5 of Romans', attendance: ['m1', 'm3'] },
    { id: 'e2', title: 'Community Outreach', date: '2024-05-18', description: 'Serving at the local shelter', attendance: ['m1', 'm2', 'm3', 'm4'] },
    { id: 'e3', title: 'Game Night', date: '2024-06-01', description: 'Fun and fellowship', attendance: [] },
];

const App: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
    const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);

    // Member CRUD
    const addMember = useCallback((memberData: Omit<Member, 'id'>) => {
        const newMember: Member = { ...memberData, id: crypto.randomUUID() };
        setMembers(prev => [...prev, newMember]);
    }, []);
    
    const bulkAddMembers = useCallback((memberData: Omit<Member, 'id'>[]) => {
        const newMembers = memberData.map(m => ({ ...m, id: crypto.randomUUID() }));
        setMembers(prev => [...prev, ...newMembers]);
    }, []);

    const updateMember = useCallback((updatedMember: Member) => {
        setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    }, []);

    const deleteMember = useCallback((id: string) => {
        setMembers(prev => prev.filter(m => m.id !== id));
        setEvents(prev => prev.map(e => ({...e, attendance: e.attendance.filter(attId => attId !== id)})));
    }, []);

    // Event CRUD
    const addEvent = useCallback((eventData: Omit<Event, 'id' | 'attendance'>) => {
        const newEvent: Event = { ...eventData, id: crypto.randomUUID(), attendance: [] };
        setEvents(prev => [...prev, newEvent]);
    }, []);

    const updateEvent = useCallback((updatedEvent: Event) => {
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    }, []);

    const deleteEvent = useCallback((id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
    }, []);

    const renderView = () => {
        switch (view) {
            case 'members':
                return <MembersView members={members} addMember={addMember} updateMember={updateMember} deleteMember={deleteMember} bulkAddMembers={bulkAddMembers} />;
            case 'events':
                return <EventsView events={events} members={members} addEvent={addEvent} updateEvent={updateEvent} deleteEvent={deleteEvent} />;
            case 'reports':
                return <ReportsView events={events} members={members} />;
            case 'dashboard':
            default:
                return <Dashboard members={members} events={events} />;
        }
    };

    const NavItem: React.FC<{ targetView: View; icon: React.ReactNode; label: string }> = ({ targetView, icon, label }) => {
        const isActive = view === targetView;
        return (
            <button onClick={() => setView(targetView)} className={`flex flex-col md:flex-row items-center space-x-0 md:space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                {icon}
                <span>{label}</span>
            </button>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <header className="bg-gray-800 shadow-lg">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <span className="font-bold text-white text-xl">IMPACTERS</span>
                        </div>
                        <div className="flex items-center space-x-1 md:space-x-4">
                            <NavItem targetView="dashboard" icon={ICONS.dashboard} label="Dashboard" />
                            <NavItem targetView="members" icon={ICONS.users} label="Members" />
                            <NavItem targetView="events" icon={ICONS.calendar} label="Events" />
                            <NavItem targetView="reports" icon={ICONS.reports} label="Reports" />
                        </div>
                    </div>
                </nav>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {renderView()}
            </main>
        </div>
    );
};

export default App;