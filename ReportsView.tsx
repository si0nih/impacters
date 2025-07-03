import React, { useMemo } from 'react';
import { Event, Member } from '../types';
import { ICONS } from '../constants';

interface ReportsViewProps {
  events: Event[];
  members: Member[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ events, members }) => {
    
    const sortedEvents = useMemo(() => 
        [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), 
        [events]
    );

    const attendanceData = useMemo(() => {
        return members.map(member => {
            const attendedCount = sortedEvents.filter(event => event.attendance.includes(member.id)).length;
            const percentage = events.length > 0 ? (attendedCount / events.length * 100).toFixed(0) : 0;
            return {
                ...member,
                attendedCount,
                percentage
            };
        });
    }, [members, sortedEvents, events.length]);

    const handleExportXLS = () => {
        const XLSX = (window as any).XLSX;
        if (!XLSX) {
            alert("Error: Excel export library not found.");
            return;
        }

        const header = [
            'Member Name',
            'Email',
            'Phone',
            ...sortedEvents.map(e => `${e.title} (${e.date})`),
            'Total Attended',
            'Attendance Percentage'
        ];

        const data = attendanceData.map(member => {
            const row = [
                member.name,
                member.email,
                member.phone,
            ];
            sortedEvents.forEach(event => {
                row.push(event.attendance.includes(member.id) ? '✔' : '');
            });
            row.push(`${member.attendedCount} / ${events.length}`);
            row.push(`${member.percentage}%`);
            return row;
        });

        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
        
        // Adjust column widths
        const colWidths = header.map((_, i) => ({
            wch: i < 3 ? 25 : (i < header.length - 2 ? 20 : 15) // name, email, phone wider
        }));
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');

        XLSX.writeFile(wb, 'Impacters_Attendance_Report.xlsx');
    };
    
    if(events.length === 0 || members.length === 0) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <h2 className="text-xl font-bold text-gray-100 mb-4">Attendance Report</h2>
                <p className="text-gray-500">No data to display. Add members and events to see reports.</p>
            </div>
        );
    }
    
    return (
        <div id="report-container" className="bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-100">Attendance Report</h2>
                <button
                    onClick={handleExportXLS}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                    {ICONS.download}
                    <span>Export to XLS</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700 border border-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="sticky left-0 bg-gray-900 px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Member Name</th>
                            {sortedEvents.map(event => (
                                <th key={event.id} className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                    {event.title}
                                    <br />
                                    <span className="font-normal normal-case">{event.date}</span>
                                </th>
                            ))}
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {attendanceData.map(member => (
                            <tr key={member.id} className="hover:bg-gray-700/50">
                                <td className="sticky left-0 bg-gray-800 hover:bg-gray-700/50 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{member.name}</td>
                                {sortedEvents.map(event => (
                                    <td key={event.id} className="px-6 py-4 text-center">
                                        {event.attendance.includes(member.id) ? (
                                            <span className="text-teal-400">{ICONS.check}</span>
                                        ) : (
                                            <span className="text-gray-600">-</span>
                                        )}
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-400 font-medium">
                                    {member.attendedCount} / {events.length} ({member.percentage}%)
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsView;