import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Check, X, UserMinus, UserCheck, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const AttendanceCalendar = ({ students }) => {
  const { isAdmin } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', dateStr);

    if (error) {
      console.error('Error fetching attendance:', error);
    } else {
      setAttendance(data || []);
    }
    setLoading(false);
  };

  const toggleAttendance = async (studentId) => {
    if (!isAdmin) return;

    const existing = attendance.find(a => a.student_id === studentId);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    setSaving(studentId); // Use studentId as a loading state for this row

    try {
      if (existing) {
        // Toggle: if present -> absent, if absent -> remove, else add present
        // Simplified: toggle between present and absent
        const newStatus = existing.status === 'present' ? 'absent' : 'present';
        
        const { error } = await supabase
          .from('attendance')
          .update({ status: newStatus })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Add as present
        const { error } = await supabase
          .from('attendance')
          .insert([{ student_id: studentId, date: dateStr, status: 'present' }]);
        
        if (error) throw error;
      }
      
      await fetchAttendance();
    } catch (err) {
      console.error('Attendance update failed:', err);
    } finally {
      setSaving(null);
    }
  };

  const getStatus = (studentId) => {
    const record = attendance.find(a => a.student_id === studentId);
    return record ? record.status : 'not-marked';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '2rem' }}>
      <aside className="premium-card glass" style={{ height: 'fit-content' }}>
        <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Select Date</h3>
        <style>{`
          .rdp { --rdp-accent-color: #D32F2F; --rdp-background-color: #222; margin: 0; }
          .rdp-day_selected { background-color: var(--rdp-accent-color) !important; color: white !important; }
          .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #333 !important; }
        `}</style>
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="custom-calendar"
        />
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #333' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4CAF50' }}></div>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Present</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5252' }}></div>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Absent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#333' }}></div>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Not Marked</span>
          </div>
        </div>
      </aside>

      <main className="premium-card glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <span style={{ color: '#888', fontSize: '0.9rem' }}>
            {attendance.length} of {students.length} marked
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader2 className="animate-spin" color="#D32F2F" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {students.map(student => {
              const status = getStatus(student.id);
              return (
                <div 
                  key={student.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    border: '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(211,47,47,0.2)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: student.picture_url ? `url(${student.picture_url})` : '#333',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '2px solid #222'
                    }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>{student.position}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {status === 'present' && <span style={{ color: '#4CAF50', fontSize: '0.8rem', fontWeight: 700 }}>PRESENT</span>}
                    {status === 'absent' && <span style={{ color: '#FF5252', fontSize: '0.8rem', fontWeight: 700 }}>ABSENT</span>}
                    
                    {isAdmin && (
                      <button 
                        onClick={() => toggleAttendance(student.id)}
                        disabled={saving === student.id}
                        className={`premium-btn ${status === 'present' ? 'glass' : ''}`}
                        style={{ 
                          padding: '0.5rem', 
                          borderRadius: '8px', 
                          background: status === 'present' ? 'rgba(76, 175, 80, 0.1)' : (status === 'absent' ? 'rgba(255, 82, 82, 0.1)' : 'rgba(255,255,255,0.05)'),
                          borderColor: status === 'present' ? '#4CAF50' : (status === 'absent' ? '#FF5252' : '#333'),
                          color: status === 'present' ? '#4CAF50' : (status === 'absent' ? '#FF5252' : '#888'),
                          minWidth: '100px',
                          justifyContent: 'center'
                        }}
                      >
                        {saving === student.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          status === 'present' ? 'Mark Absent' : 'Mark Present'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AttendanceCalendar;
