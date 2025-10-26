// components/AttendanceView.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AttendanceView = ({ user, formatDate, formatDateTime }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [groupedData, setGroupedData] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('daily');
  const [filters, setFilters] = useState({
    employee: 'all',
    dateFrom: '',
    dateTo: '',
    actionType: 'all'
  });

  useEffect(() => {
    loadAllUsers();
    loadAttendanceData();
  }, []);

  useEffect(() => {
    groupDataByDay();
  }, [attendanceData, filters]);

  const loadAllUsers = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/all-users`);
      if (response.data.success) {
        setAllUsers(response.data.users);
      }
    } catch (error) {
      console.error('Greška pri učitavanju korisnika:', error);
    }
  };

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_BASE_URL}/attendance-history/all`);
      if (response.data.success) {
        setAttendanceData(response.data.history);
      }
    } catch (error) {
      console.error('Greška pri učitavanju podataka:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupDataByDay = () => {
    const grouped = {};
    
    let filteredData = [...attendanceData];
    
    // Filter po zaposlenom
    if (filters.employee !== 'all') {
      filteredData = filteredData.filter(record => record.user_id === filters.employee);
    }
    
    // Filter po datumu od
    if (filters.dateFrom) {
      filteredData = filteredData.filter(record => 
        new Date(record.timestamp_dolaska) >= new Date(filters.dateFrom)
      );
    }
    
    // Filter po datumu do
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      filteredData = filteredData.filter(record => 
        new Date(record.timestamp_dolaska) <= endDate
      );
    }
    
    // Filter po tipu akcije
    if (filters.actionType !== 'all') {
      switch (filters.actionType) {
        case 'checkin':
          filteredData = filteredData.filter(record => !record.timestamp_odlaska);
          break;
        case 'checkout':
          filteredData = filteredData.filter(record => !!record.timestamp_odlaska);
          break;
        case 'break':
          filteredData = filteredData.filter(record => 
            record.pauze && record.pauze.length > 0
          );
          break;
        default:
          break;
      }
    }
    
    // Grupiranje po danu
    filteredData.forEach(record => {
      const dateKey = new Date(record.timestamp_dolaska).toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: new Date(record.timestamp_dolaska),
          records: [],
          employees: new Set(),
          totalCheckins: 0,
          totalCheckouts: 0,
          totalBreaks: 0,
          totalHours: 0
        };
      }
      
      grouped[dateKey].records.push(record);
      grouped[dateKey].employees.add(record.user_id);
      grouped[dateKey].totalCheckins++;
      
      if (record.timestamp_odlaska) {
        grouped[dateKey].totalCheckouts++;
      }
      
      if (record.pauze) {
        grouped[dateKey].totalBreaks += record.pauze.length;
      }
      
      grouped[dateKey].totalHours += parseFloat(record.ukupno_vreme_sati || 0);
    });
    
    // Konvertuj u array i sortiraj
    const groupedArray = Object.values(grouped).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    setGroupedData(groupedArray);
  };

  const getInitials = (name, surname) => {
    return (name?.charAt(0) + surname?.charAt(0)).toUpperCase();
  };

  const resetFilters = () => {
    setFilters({
      employee: 'all',
      dateFrom: '',
      dateTo: '',
      actionType: 'all'
    });
  };

  // DAILY VIEW - 1 BOX PO DANU
  const renderDailyView = () => (
    <div className="daily-attendance-view">
      {groupedData.map((dayData, index) => (
        <div key={index} className="daily-card">
          <div className="daily-header">
            <div className="daily-date">
              <h3>{formatDate(dayData.date)}</h3>
              <div className="daily-stats">
                <span className="stat-badge">👥 {dayData.employees.size} zaposlenih</span>
                <span className="stat-badge">⬇️ {dayData.totalCheckins} dolazaka</span>
                <span className="stat-badge">⬆️ {dayData.totalCheckouts} odlazaka</span>
                <span className="stat-badge">⏸️ {dayData.totalBreaks} pauza</span>
                <span className="stat-badge">⏱️ {dayData.totalHours.toFixed(1)}h</span>
              </div>
            </div>
          </div>
          
          <div className="daily-records">
            {dayData.records.map((record, recordIndex) => (
              <div key={recordIndex} className="record-item">
                <div className="record-user">
                  <div className="user-avatar-sm">
                    {getInitials(record.user.ime, record.user.prezime)}
                  </div>
                  <div className="user-info">
                    <strong>{record.user.ime} {record.user.prezime}</strong>
                    <span>{record.user.mesto_rada}</span>
                  </div>
                </div>
                
                <div className="record-details">
                  <div className="time-info">
                    <div className="time-entry">
                      <span className="time-label">Dolazak:</span>
                      <span className="time-value">{formatDateTime(record.timestamp_dolaska)}</span>
                    </div>
                    {record.timestamp_odlaska && (
                      <div className="time-entry">
                        <span className="time-label">Odlazak:</span>
                        <span className="time-value">{formatDateTime(record.timestamp_odlaska)}</span>
                      </div>
                    )}
                  </div>
                  
                  {record.pauze && record.pauze.length > 0 && (
                    <div className="breaks-info">
                      <details>
                        <summary>⏸️ {record.pauze.length} pauza (ukupno: {record.ukupno_pauza_sati}h)</summary>
                        <div className="breaks-list">
                          {record.pauze.map((pauza, idx) => (
                            <div key={idx} className="break-item">
                              <span className="break-time">
                                {formatDateTime(pauza.pocetak)} - {pauza.kraj ? formatDateTime(pauza.kraj) : 'Aktivan'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                  
                  <div className="record-stats">
                    <span className="stat">⏱️ {record.ukupno_vreme_sati}h</span>
                    <span className="stat">⏸️ {record.ukupno_pauza_sati}h</span>
                    <span className="stat">✅ {record.efektivno_vreme_sati}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {groupedData.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Nema podataka za prikaz</h3>
          <p>Promenite filtere da biste videli rezultate</p>
        </div>
      )}
    </div>
  );

  // LIST VIEW - Originalni prikaz
  const renderListView = () => (
    <div className="list-attendance-view">
      <div className="attendance-grid">
        {groupedData.flatMap(dayData => dayData.records).map((record, index) => (
          <div key={index} className="attendance-card">
            <div className="card-header">
              <div className="user-info">
                <div className="user-avatar">
                  {getInitials(record.user.ime, record.user.prezime)}
                </div>
                <div className="user-details">
                  <h4>{record.user.ime} {record.user.prezime}</h4>
                  <p>{record.user.mesto_rada} • {formatDate(record.timestamp_dolaska)}</p>
                </div>
              </div>
              <div className={`status-badge ${record.timestamp_odlaska ? 'completed' : 'active'}`}>
                {record.timestamp_odlaska ? '✅ Završeno' : '🟢 Aktivan'}
              </div>
            </div>

            <div className="card-body">
              <div className="time-info">
                <div className="time-row">
                  <span className="time-label">⬇️ Dolazak:</span>
                  <span className="time-value">{formatDateTime(record.timestamp_dolaska)}</span>
                </div>
                {record.timestamp_odlaska && (
                  <div className="time-row">
                    <span className="time-label">⬆️ Odlazak:</span>
                    <span className="time-value">{formatDateTime(record.timestamp_odlaska)}</span>
                  </div>
                )}
              </div>

              <div className="stats-info">
                <div className="stat-row">
                  <span className="stat-label">⏱️ Ukupno:</span>
                  <span className="stat-value">{record.ukupno_vreme_sati}h</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">⏸️ Pauze:</span>
                  <span className="stat-value">{record.ukupno_pauza_sati}h</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">✅ Efektivno:</span>
                  <span className="stat-value">{record.efektivno_vreme_sati}h</span>
                </div>
              </div>

              {record.pauze && record.pauze.length > 0 && (
                <div className="breaks-section">
                  <details>
                    <summary>⏸️ Detalji pauza ({record.pauze.length})</summary>
                    <div className="breaks-list">
                      {record.pauze.map((pauza, idx) => (
                        <div key={idx} className="break-item">
                          <span className="break-time">
                            {formatDateTime(pauza.pocetak)} - {pauza.kraj ? formatDateTime(pauza.kraj) : 'U toku'}
                          </span>
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
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('list')}
            >
              📋 Lista Dolazaka
            </button>
          </div>
        </div>
      </div>

      {/* FILTERI */}
      <div className="filters-panel">
        <div className="filters-header">
          <h4>🔍 Filteri</h4>
          <button className="btn btn-sm btn-secondary" onClick={resetFilters}>
            🔄 Resetuj
          </button>
        </div>
        
        <div className="filters-grid">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Zaposleni</label>
              <select 
                value={filters.employee}
                onChange={(e) => setFilters(prev => ({...prev, employee: e.target.value}))}
                className="filter-select"
              >
                <option value="all">Svi zaposleni</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.ime} {user.prezime}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Tip akcije</label>
              <select 
                value={filters.actionType}
                onChange={(e) => setFilters(prev => ({...prev, actionType: e.target.value}))}
                className="filter-select"
              >
                <option value="all">Sve akcije</option>
                <option value="checkin">Samo dolasci</option>
                <option value="checkout">Samo odlasci</option>
                <option value="break">Samo sa pauzama</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Datum od</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({...prev, dateFrom: e.target.value}))}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Datum do</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({...prev, dateTo: e.target.value}))}
                className="filter-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* REZULTATI */}
      <div className="results-section">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Učitavam podatke...</p>
          </div>
        ) : (
          viewMode === 'daily' ? renderDailyView() : renderListView()
        )}
      </div>
    </div>
  );
};

export default AttendanceView;