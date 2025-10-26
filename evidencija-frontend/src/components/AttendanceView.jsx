// components/AttendanceView.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AttendanceView = ({ user, formatDate, formatDateTime }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [viewMode, setViewMode] = useState('daily'); // 'daily' ili 'detailed'
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    actionType: 'all', // 'all', 'checkin', 'checkout', 'break'
    employee: 'all'
  });

  useEffect(() => {
    loadAttendanceData();
  }, []);

  useEffect(() => {
    groupDataByDay();
  }, [attendanceData]);

  const loadAttendanceData = async () => {
    try {
      const url = user.role === 'admin' 
        ? `${config.API_BASE_URL}/attendance-history/all`
        : `${config.API_BASE_URL}/attendance-history/${user.id}`;
      
      const response = await axios.get(url);
      if (response.data.success) {
        setAttendanceData(response.data.history);
      }
    } catch (error) {
      console.error('Greška pri učitavanju podataka:', error);
    }
  };

  const groupDataByDay = () => {
    const grouped = {};
    
    attendanceData.forEach(record => {
      const date = new Date(record.timestamp_dolaska).toDateString();
      
      if (!grouped[date]) {
        grouped[date] = {
          date: date,
          records: [],
          employees: new Set()
        };
      }
      
      grouped[date].records.push(record);
      grouped[date].employees.add(record.user_id);
    });
    
    setGroupedData(grouped);
  };

  const calculateDailyStats = (records) => {
    const stats = {
      totalEmployees: new Set(records.map(r => r.user_id)).size,
      totalCheckins: records.length,
      totalBreaks: records.reduce((sum, record) => sum + (record.pauze?.length || 0), 0),
      totalHours: records.reduce((sum, record) => sum + parseFloat(record.ukupno_vreme_sati || 0), 0)
    };
    
    return stats;
  };

  const getInitials = (name, surname) => {
    return (name?.charAt(0) + surname?.charAt(0)).toUpperCase();
  };

  // Dnevni pregled (1 box po danu)
  const renderDailyView = () => (
    <div className="daily-attendance-view">
      {Object.values(groupedData).map((dayData, index) => {
        const stats = calculateDailyStats(dayData.records);
        
        return (
          <div key={index} className="daily-card">
            <div className="daily-header">
              <h3>{formatDate(dayData.date)}</h3>
              <div className="daily-stats">
                <span className="stat">👥 {stats.totalEmployees} zaposlenih</span>
                <span className="stat">📊 {stats.totalCheckins} dolazaka</span>
                <span className="stat">⏸️ {stats.totalBreaks} pauza</span>
                <span className="stat">⏱️ {stats.totalHours.toFixed(1)}h</span>
              </div>
            </div>
            
            <div className="daily-records">
              {dayData.records.map((record, recordIndex) => (
                <div key={recordIndex} className="record-item">
                  <div className="record-user">
                    <div className="user-avatar-xs">
                      {getInitials(record.user.ime, record.user.prezime)}
                    </div>
                    <div className="user-info">
                      <strong>{record.user.ime} {record.user.prezime}</strong>
                      <span>{record.user.mesto_rada}</span>
                    </div>
                  </div>
                  
                  <div className="record-times">
                    <div className="time-row">
                      <span>⬇️ {formatDateTime(record.timestamp_dolaska)}</span>
                      {record.timestamp_odlaska && (
                        <span>⬆️ {formatDateTime(record.timestamp_odlaska)}</span>
                      )}
                    </div>
                    
                    {record.pauze && record.pauze.length > 0 && (
                      <div className="breaks-info">
                        <details>
                          <summary>⏸️ {record.pauze.length} pauza</summary>
                          <div className="breaks-list">
                            {record.pauze.map((pauza, idx) => (
                              <div key={idx} className="break-item">
                                {formatDateTime(pauza.pocetak)} - {pauza.kraj ? formatDateTime(pauza.kraj) : 'Aktivan'}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Detaljni pregled (postojeći)
  const renderDetailedView = () => (
    <div className="detailed-attendance-view">
      {/* Postojeći kod iz AdvancedAttendance.jsx */}
      <div className="attendance-grid">
        {attendanceData.map((record, index) => (
          <div key={index} className="attendance-card">
            {/* ... postojeći kod za kartice ... */}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="attendance-view">
      <div className="view-header">
        <h2>📊 Evidencija Radnika</h2>
        <div className="view-controls">
          <div className="view-toggle">
            <button 
              className={`btn btn-sm ${viewMode === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('daily')}
            >
              📅 Dnevni Pregled
            </button>
            <button 
              className={`btn btn-sm ${viewMode === 'detailed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('detailed')}
            >
              📋 Detaljni Pregled
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'daily' ? renderDailyView() : renderDetailedView()}
    </div>
  );
};

export default AttendanceView;