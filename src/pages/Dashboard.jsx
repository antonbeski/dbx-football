import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, Calendar as CalendarIcon, Filter, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddStudentModal from '../components/AddStudentModal';
import AttendanceCalendar from '../components/AttendanceCalendar';
import StudentCard from '../components/StudentCard';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'attendance'

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching students:', error);
    } else {
      setStudents(data);
    }
    setLoading(false);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
            {view === 'list' ? 'Student ' : 'Attendance '}
            <span style={{ color: '#D32F2F' }}>{view === 'list' ? 'Roster' : 'Records'}</span>
          </h1>
          <p style={{ color: '#888' }}>
            {view === 'list' 
              ? `Managing ${students.length} active players in the academy` 
              : 'Track and monitor daily attendance patterns'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className={`premium-btn ${view === 'attendance' ? '' : 'glass'}`} 
            style={{ 
              background: view === 'attendance' ? '#D32F2F' : 'transparent',
              borderColor: view === 'attendance' ? '#D32F2F' : 'rgba(255,255,255,0.1)'
            }}
            onClick={() => setView(view === 'list' ? 'attendance' : 'list')}
          >
            {view === 'list' ? <CalendarIcon size={20} /> : <Users size={20} />}
            {view === 'list' ? 'View Attendance' : 'View Students'}
          </button>
          
          {isAdmin && view === 'list' && (
            <button className="premium-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              Add Student
            </button>
          )}
        </div>
      </header>

      {view === 'list' ? (
        <>
          <div style={{ 
            marginBottom: '2rem', 
            position: 'relative',
            maxWidth: '500px'
          }}>
            <Search size={20} color="#555" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by name or position..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '3rem' }}
            />
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
              <Loader2 size={48} className="animate-spin" color="#D32F2F" />
            </div>
          ) : (
            <motion.div 
              layout
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '1.5rem' 
              }}
            >
              <AnimatePresence>
                {filteredStudents.map(student => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </AnimatePresence>
              
              {filteredStudents.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: '#555' }}>
                  <Users size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                  <p>No students found matching your search.</p>
                </div>
              )}
            </motion.div>
          )}
        </>
      ) : (
        <AttendanceCalendar students={students} />
      )}

      {showAddModal && (
        <AddStudentModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false);
            fetchStudents();
          }} 
        />
      )}
    </div>
  );
};

export default Dashboard;
