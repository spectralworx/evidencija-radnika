import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AttendanceView = ({ user, formatDate, formatDateTime }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [viewMode, setViewMode] = useState('box'); // 'box' ili 'list'
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'arrivals', 'departures', 'breaks'
    dateFrom: '',
    dateTo: '',
    employee: 'all'
  });
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    loadAttendanceData();
    if (user.role === 'admin') {
      loadAllUsers();
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, attendanceData]);

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
    try {
      let url = `${config.API_BASE_URL}/attendance-history/${user.id}`;
      if (user.role === 'admin') {
        url = `${config.API_BASE_URL}/attendance-history/all`;
      }
      
      const response = await axios.get(url);
      if (response.data.success) {
        // Grupiši podatke po danu i korisniku
        const groupedData = groupAttendanceByDay(response.data.history);
        setAttendanceData(groupedData);
      }
    } catch (error) {
      console.error('Greška pri učitavanju podataka:', error);
    }
  };

  const groupAttendanceByDay = (history) => {
    const grouped = {};
    
    history.forEach(record => {
      const date = new Date(record.timestamp_dolaska).toDateString();
      const key = `${date}_${record.user_id}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          date: date,
          user: record.user,
          user_id: record.user_id,
          records: [],
          totalHours: 0,
          breakCount: 0,
          totalBreakTime: 0
        };
      }
      
      grouped[key].records.push(record);
      
      // Izračunaj ukupno vreme
      if (record.ukupno_vreme_sati) {
        grouped[key].totalHours += parseFloat(record.ukupno_vreme_sati);
      }
      
      // Izračunaj pauze
      if (record.pauze && record.pauze.length > 0) {
        grouped[key].breakCount += record.pauze.length;
        record.pauze.forEach(pauza => {
          if (pauza.kraj) {
            const start = new Date(pauza.pocetak);
            const end = new Date(pauza.kraj);
            const breakTime = (end - start) / (1000 * 60 * 60); // sati
            grouped[key].totalBreakTime += breakTime;
          }
        });
      }
    });
    
    return Object.values(grouped);
  };

  const applyFilters = () => {
    let filtered = [...attendanceData];

    // Filter po tipu
    if (filters.type !== 'all') {
      filtered = filtered.filter(group => {
        if (filters.type === 'arrivals') {
          return group.records.some(r => r.timestamp_dolaska);
        } else if (filters.type === 'departures') {
          return group.records.some(r => r.timestamp_odlaska);
        } else if (filters.type === 'breaks') {
          return group.breakCount > 0;
        }
        return true;
      });
    }

    // Filter po zaposlenom (samo za admina)
    if (user.role === 'admin' && filters.employee !== 'all') {
      filtered = filtered.filter(group => group.user_id === filters.employee);
    }

    // Filter po datumu
    if (filters.dateFrom) {
      filtered = filtered.filter(group => 
        new Date(group.date) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(group => 
        new Date(group.date) <= endDate
      );
    }

    setFilteredData(filtered);
  };

  const getInitials = (name, surname) => {
    return (name?.charAt(0) + surname?.charAt(0)).toUpperCase();
  };

  // BOX VIEW
  const renderBoxView = () => (
    <div className="attendance-grid">
      {filteredData.map((group) => (
        <div key={group.id} className="attendance-group-card">
          <div className="group-header">
            <div className="user-info">
              <div className="user-avatar">
                {getInitials(group.user.ime, group.user.prezime)}
              </div>
              <div className="user-details">
                <h4>{group.user.ime} {group.user.prezime}</h4>
                <p>{formatDate(group.date)}</p>
              </div>
            </div>
            <div className="group-stats">
              <span className="stat">⏱️ {group.totalHours.toFixed(2)}h</span>
              <span className="stat">⏸️ {group.breakCount} pauze</span>
            </div>
          </div>

          <div className="group-records">
            {group.records.map((record, index) => (
              <div key={index} className="record-item">
                <div className="record-times">
                  <div className="time-block">
                    <strong>Dolazak:</strong>
                    <span>{formatDateTime(record.timestamp_dolaska)}</span>
                  </div>
                  {record.timestamp_odlaska && (
                    <div className="time-block">
                      <strong>Odlazak:</strong>
                      <span>{formatDateTime(record.timestamp_odlaska)}</span>
                    </div>
                  )}
                </div>

                {record.pauze && record.pauze.length > 0 && (
                  <div className="breaks-section">
                    <strong>Pauze ({record.pauze.length}):</strong>
                    <div className="breaks-list">
                      {record.pauze.map((pauza, idx) => (
                        <div key={idx} className="break-item">
                          <span>
                            {formatDateTime(pauza.pocetak)} - {pauza.kraj ? formatDateTime(pauza.kraj) : 'U toku'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="record-summary">
                  <span>Ukupno: {record.ukupno_vreme_sati}h</span>
                  <span>Pauze: {record.ukupno_pauza_sati}h</span>
                  <span>Efektivno: {record.efektivno_vreme_sati}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // LIST VIEW
  const renderListView = () => (
    <div className="attendance-list-view">
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Zaposleni</th>
            <th>Datum</th>
            <th>Dolazak</th>
            <th>Odlazak</th>
            <th>Pauze</th>
            <th>Ukupno</th>
            <th>Efektivno</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((group) => (
            group.records.map((record, index) => (
              <tr key={`${group.id}_${index}`}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar-sm">
                      {getInitials(group.user.ime, group.user.prezime)}
                    </div>
                    {group.user.ime} {group.user.prezime}
                  </div>
                </td>
                <td>{formatDate(record.timestamp_dolaska)}</td>
                <td>{formatDateTime(record.timestamp_dolaska)}</td>
                <td>
                  {record.timestamp_odlaska 
                    ? formatDateTime(record.timestamp_odlaska)
                    : 'Aktivan'
                  }
                </td>
                <td>
                  {record.pauze && record.pauze.length > 0 ? (
                    <details>
                      <summary>{record.pauze.length} pauze</summary>
                      <div className="breaks-popup">
                        {record.pauze.map((pauza, idx) => (
                          <div key={idx}>
                            {formatDateTime(pauza.pocetak)} - {pauza.kraj ? formatDateTime(pauza.kraj) : 'U toku'}
                          </div>
                        ))}
                      </div>
                    </details>
                  ) : (
                    '0'
                  )}
                </td>
                <td>{record.ukupno_vreme_sati}h</td>
                <td>{record.efektivno_vreme_sati}h</td>
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="attendance-view">
      <div className="view-header">
        <h2>📊 Evidencija Radnika</h2>
        
        <div className="view-controls">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'box' ? 'active' : ''}`}
              onClick={() => setViewMode('box')}
            >
              📦 Box View
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 List View
            </button>
          </div>
        </div>
      </div>

      {/* FILTERI */}
      <div className="filters-panel">
        <div className="filter-group">
          <label>Tip:</label>
          <select 
            value={filters.type}
            onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
          >
            <option value="all">Sve</option>
            <option value="arrivals">Dolasci</option>
            <option value="departures">Odlasci</option>
            <option value="breaks">Pauze</option>
          </select>
        </div>

        {user.role === 'admin' && (
          <div className="filter-group">
            <label>Zaposleni:</label>
            <select 
              value={filters.employee}
              onChange={(e) => setFilters(prev => ({...prev, employee: e.target.value}))}
            >
              <option value="all">Svi</option>
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.ime} {user.prezime}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-group">
          <label>Od:</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({...prev, dateFrom: e.target.value}))}
          />
        </div>

        <div className="filter-group">
          <label>Do:</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({...prev, dateTo: e.target.value}))}
          />
        </div>

        <button 
          className="btn btn-secondary"
          onClick={() => setFilters({
            type: 'all',
            employee: 'all',
            dateFrom: '',
            dateTo: ''
          })}
        >
          🔄 Reset
        </button>
      </div>

      {/* TOTAL STATS */}
      {filteredData.length > 0 && (
        <div className="total-stats">
          <div className="total-stat">
            <strong>Ukupno sati:</strong>
            <span>{filteredData.reduce((sum, group) => sum + group.totalHours, 0).toFixed(2)}h</span>
          </div>
          <div className="total-stat">
            <strong>Ukupno pauza:</strong>
            <span>{filteredData.reduce((sum, group) => sum + group.breakCount, 0)}</span>
          </div>
          <div className="total-stat">
            <strong>Ukupno zapisa:</strong>
            <span>{filteredData.length}</span>
          </div>
        </div>
      )}

      {/* PRIKAZ PODATAKA */}
      {filteredData.length === 0 ? (
        <div className="no-data">
          <p>Nema podataka za prikaz</p>
        </div>
      ) : viewMode === 'box' ? renderBoxView() : renderListView()}
    </div>
  );
};

export default AttendanceView;