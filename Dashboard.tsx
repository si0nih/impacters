
import React, { useMemo } from 'react';
import { Member, Event } from '../types';
import { ICONS } from '../constants';

interface DashboardProps {
  members: Member[];
  events: Event[];
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  // Appending T00:00:00 ensures the date is parsed in the user's local timezone, avoiding off-by-one day errors.
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(date);
};

type ReminderType = 'birthday' | 'anniversary';

const ReminderListItem: React.FC<{ member: Member; date: string; type: ReminderType }> = ({ member, date, type }) => (
    <div className="flex items-center justify-between p-2 bg-gray-700 rounded-md hover:bg-gray-600">
        <div className="flex items-center space-x-3">
            <span className={`flex-shrink-0 p-1.5 rounded-full ${type === 'birthday' ? 'bg-pink-200 text-pink-700' : 'bg-red-200 text-red-700'}`}>
                {ICONS[type]}
            </span>
            <p className="font-semibold text-sm text-gray-200">{member.name}</p>
        </div>
        <p className="font-mono text-xs text-gray-400 flex-shrink-0 ml-2">{formatDate(date)}</p>
    </div>
);

const MonthlyViewer: React.FC<{ members: Member[]; type: ReminderType }> = ({ members, type }) => {
    const { thisMonthReminders, nextMonthReminders } = useMemo(() => {
        const today = new Date();
        const thisMonth = today.getMonth();
        const nextMonth = (thisMonth + 1) % 12;
        const dateKey = type;

        const getMonth = (dateStr: string) => new Date(dateStr + 'T00:00:00').getMonth();
        const getDate = (dateStr: string) => new Date(dateStr + 'T00:00:00').getDate();
        
        const filterAndSort = (month: number) => members
            .filter(member => {
                const dateVal = member[dateKey];
                return dateVal && getMonth(dateVal) === month;
            })
            .sort((a, b) => getDate(a[dateKey]) - getDate(b[dateKey]));

        return {
            thisMonthReminders: filterAndSort(thisMonth),
            nextMonthReminders: filterAndSort(nextMonth)
        };
    }, [members, type]);

    const title = type.charAt(0).toUpperCase() + type.slice(1) + 's';
    const thisMonthName = new Date().toLocaleString('default', { month: 'long' });
    const nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const nextMonthName = nextMonthDate.toLocaleString('default', { month: 'long' });

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center space-x-2">
                <span className={type === 'birthday' ? 'text-pink-400' : 'text-red-400'}>{ICONS[type]}</span>
                <span>{title}</span>
            </h3>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                 <div>
                    <h4 className="font-medium text-gray-400 mb-2 border-b border-gray-600 pb-1 text-sm">This Month ({thisMonthName})</h4>
                    <div className="space-y-2 mt-2">
                        {thisMonthReminders.length > 0 
                            ? thisMonthReminders.map(member => (
                                <ReminderListItem key={`${member.id}-${type}`} member={member} date={member[type]} type={type} />
                             )) 
                            : <p className="text-gray-500 text-center py-2 text-sm">No {type}s this month.</p>}
                    </div>
                </div>
                 <div className="mt-4">
                    <h4 className="font-medium text-gray-400 mb-2 border-b border-gray-600 pb-1 text-sm">Next Month ({nextMonthName})</h4>
                     <div className="space-y-2 mt-2">
                        {nextMonthReminders.length > 0 
                            ? nextMonthReminders.map(member => (
                                <ReminderListItem key={`${member.id}-${type}`} member={member} date={member[type]} type={type} />
                            )) 
                            : <p className="text-gray-500 text-center py-2 text-sm">No {type}s next month.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const UpcomingEvents: React.FC<{ events: Event[] }> = ({ events }) => {
    const upcoming = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        return events
            .filter(event => new Date(event.date + 'T00:00:00') >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);
    }, [events]);

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Upcoming Events</h3>
            <div className="space-y-3">
                {upcoming.length > 0 ? upcoming.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                        <div>
                            <p className="font-semibold text-gray-200">{event.title}</p>
                            <p className="text-sm text-gray-400">{event.description}</p>
                        </div>
                        <p className="font-mono text-sm text-gray-400 flex-shrink-0 ml-2">{formatDate(event.date)}</p>
                    </div>
                )) : <p className="text-gray-500 text-center py-4">No upcoming events.</p>}
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ members, events }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpcomingEvents events={events} />
            <div className="space-y-6">
                <MonthlyViewer members={members} type="birthday" />
                <MonthlyViewer members={members} type="anniversary" />
            </div>
        </div>
    );
};

export default Dashboard;