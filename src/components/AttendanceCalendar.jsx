import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

const AttendanceCalendar = ({ students }) => {
  const { isAdmin } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return format(now, 'yyyy-MM-dd');
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', selectedDate);

      if (error) {
        console.error('Error fetching attendance:', error);
      } else {
        setAttendance(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
    setLoading(false);
  };

  const toggleAttendance = async (studentId) => {
    if (!isAdmin) return;

    const existing = attendance.find(a => a.student_id === studentId);
    setSaving(studentId);

    try {
      if (existing) {
        const newStatus = existing.status === 'present' ? 'absent' : 'present';
        const { error } = await supabase
          .from('attendance')
          .update({ status: newStatus })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('attendance')
          .insert([{ student_id: studentId, date: selectedDate, status: 'present' }]);
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

  // Custom Calendar Logic
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const { year, month } = currentMonth;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const selectDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const selectedDay = (() => {
    const parts = selectedDate.split('-');
    if (parseInt(parts[0]) === year && parseInt(parts[1]) - 1 === month) {
      return parseInt(parts[2]);
    }
    return null;
  })();

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div key={`empty-${i}`} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = day === selectedDay;
    const isToday = (() => {
      const now = new Date();
      return day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
    })();

    calendarCells.push(
      <button
        key={day}
        onClick={() => selectDay(day)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: isToday && !isSelected ? '2px solid #D32F2F' : 'none',
          background: isSelected ? '#D32F2F' : 'transparent',
          color: isSelected ? 'white' : (isToday ? '#D32F2F' : 'white'),
          fontWeight: isSelected || isToday ? 700 : 400,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = '#333'; }}
        onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
      >
        {day}
      </button>
    );
  }

  const displayDate = (() => {
    const parts = selectedDate.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  })();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: '2rem' }}>
      {/* Calendar Side */}
      <aside className="premium-card glass" style={{ height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button onClick={prevMonth} style={{ background: 'transparent', color: 'white', fontSize: '1.2rem', padding: '0.25rem 0.75rem', borderRadius: '6px' }} 
            onMouseOver={e => e.currentTarget.style.background = '#333'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            ‹
          </button>
          <h3 style={{ fontWeight: 700 }}>{monthNames[month]} {year}</h3>
          <button onClick={nextMonth} style={{ background: 'transparent', color: 'white', fontSize: '1.2rem', padding: '0.25rem 0.75rem', borderRadius: '6px' }}
            onMouseOver={e => e.currentTarget.style.background = '#333'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            ›
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', justifyItems: 'center' }}>
          {dayNames.map(d => (
            <div key={d} style={{ fontSize: '0.7rem', color: '#666', fontWeight: 600, padding: '0.5rem 0', textTransform: 'uppercase' }}>{d}</div>
          ))}
          {calendarCells}
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #333' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4CAF50' }} />
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Present</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5252' }} />
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Absent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#333' }} />
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Not Marked</span>
          </div>
        </div>
      </aside>

      {/* Attendance List */}
      <main className="premium-card glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {format(displayDate, 'MMMM d, yyyy')}
          </h2>
          <span style={{ color: '#888', fontSize: '0.9rem' }}>
            {attendance.length} of {students.length} marked
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#555' }}>
            <p>No students in the roster yet.</p>
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
                      background: student.picture_url ? `url(${student.picture_url}) center/cover` : 'linear-gradient(135deg, #333, #555)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #222',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#888'
                    }}>
                      {!student.picture_url && (student.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>{student.position || 'No position'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {status === 'present' && <span style={{ color: '#4CAF50', fontSize: '0.8rem', fontWeight: 700 }}>PRESENT</span>}
                    {status === 'absent' && <span style={{ color: '#FF5252', fontSize: '0.8rem', fontWeight: 700 }}>ABSENT</span>}
                    
                    {isAdmin && (
                      <button 
                        onClick={() => toggleAttendance(student.id)}
                        disabled={saving === student.id}
                        className="premium-btn"
                        style={{ 
                          padding: '0.4rem 0.75rem', 
                          borderRadius: '8px', 
                          fontSize: '0.8rem',
                          background: status === 'present' ? 'rgba(76, 175, 80, 0.15)' : (status === 'absent' ? 'rgba(255, 82, 82, 0.15)' : 'rgba(255,255,255,0.05)'),
                          border: '1px solid',
                          borderColor: status === 'present' ? '#4CAF50' : (status === 'absent' ? '#FF5252' : '#333'),
                          color: status === 'present' ? '#4CAF50' : (status === 'absent' ? '#FF5252' : '#888'),
                          boxShadow: 'none',
                          minWidth: '110px',
                          justifyContent: 'center'
                        }}
                      >
                        {saving === student.id ? (
                          <Loader2 size={14} className="spinner-icon" />
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
