import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AdvancedAttendance = ({ user, formatDate, formatDateTime }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0
  });

  // Filter state
  const [filters, setFilters] = useState({
    employee: 'all',
    workplace: 'all',
    dateFrom: '',
    dateTo: '',
    month: '',
    minHours: '',
    maxHours: '',
    hasBreaks: 'all',
    status: 'all'
  });

  // Učitavanje podataka
  useEffect(() => {
    loadAllUsers();
    loadAttendanceData();
  }, [pagination.page, pagination.limit]);

  // Filtriranje kada se promene filteri
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
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_BASE_URL}/attendance-history/all`);
      if (response.data.success) {
        setAttendanceData(response.data.history);
        setPagination(prev => ({ ...prev, total: response.data.history.length }));
      }
    } catch (error) {
      console.error('Greška pri učitavanju podataka:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendanceData];

    // Filter po zaposlenom
    if (filters.employee !== 'all') {
      filtered = filtered.filter(record => record.user_id === filters.employee);
    }

    // Filter po mestu rada
    if (filters.workplace !== 'all') {
      filtered = filtered.filter(record => record.user.mesto_rada === filters.workplace);
    }

    // Filter po datumu od
    if (filters.dateFrom) {
      filtered = filtered.filter(record => 
        new Date(record.timestamp_dolaska) >= new Date(filters.dateFrom)
      );
    }

    // Filter po datumu do
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(record => 
        new Date(record.timestamp_dolaska) <= endDate
      );
    }

    // Filter po mesecu
    if (filters.month) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.timestamp_dolaska);
        return recordDate.getMonth() === parseInt(filters.month) && 
               recordDate.getFullYear() === new Date().getFullYear();
      });
    }

    // Filter po minimalnim satima
    if (filters.minHours) {
      filtered = filtered.filter(record => 
        parseFloat(record.ukupno_vreme_sati) >= parseFloat(filters.minHours)
      );
    }

    // Filter po maksimalnim satima
    if (filters.maxHours) {
      filtered = filtered.filter(record => 
        parseFloat(record.ukupno_vreme_sati) <= parseFloat(filters.maxHours)
      );
    }

    // Filter po pauzama
    if (filters.hasBreaks !== 'all') {
      if (filters.hasBreaks === 'yes') {
        filtered = filtered.filter(record => 
          record.pauze && record.pauze.length > 0
        );
      } else {
        filtered = filtered.filter(record => 
          !record.pauze || record.pauze.length === 0
        );
      }
    }

    // Filter po statusu
    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        filtered = filtered.filter(record => !record.timestamp_odlaska);
      } else {
        filtered = filtered.filter(record => !!record.timestamp_odlaska);
      }
    }

    // Paginacija
    const startIndex = (pagination.page - 1) * pagination.limit;
    const paginatedData = filtered.slice(startIndex, startIndex + pagination.limit);
    
    setFilteredData(paginatedData);
    setPagination(prev => ({ ...prev, total: filtered.length }));
  };

  const resetFilters = () => {
    setFilters({
      employee: 'all',
      workplace: 'all',
      dateFrom: '',
      dateTo: '',
      month: '',
      minHours: '',
      maxHours: '',
      hasBreaks: 'all',
      status: 'all'
    });
  };

  const getUniqueWorkplaces = () => {
    return [...new Set(attendanceData.map(record => record.user.mesto_rada).filter(Boolean))];
  };

  const calculateStats = () => {
    const total = filteredData.length;
    const totalHours = filteredData.reduce((sum, record) => 
      sum + parseFloat(record.ukupno_vreme_sati || 0), 0
    ).toFixed(2);
    const totalBreaks = filteredData.reduce((sum, record) => 
      sum + (record.pauze ? record.pauze.length : 0), 0
    );
    const activeRecords = filteredData.filter(record => !record.timestamp_odlaska).length;

    return { total, totalHours, totalBreaks, activeRecords };
  };

  const stats = calculateStats();

  const getInitials = (name, surname) => {
    return (name?.charAt(0) + surname?.charAt(0)).toUpperCase();
  };

  const exportToCSV = () => {
    const headers = ['Datum', 'Zaposleni', 'Mesto Rada', 'Dolazak', 'Odlazak', 'Ukupno Sati', 'Pauze', 'Status'];
    const csvData = filteredData.map(record => [
      formatDate(record.timestamp_dolaska),
      `${record.user.ime} ${record.user.prezime}`,
      record.user.mesto_rada,
      formatDateTime(record.timestamp_dolaska),
      record.timestamp_odlaska ? formatDateTime(record.timestamp_odlaska) : 'Aktivan',
      record.ukupno_vreme_sati,
      record.pauze ? record.pauze.length : 0,
      record.timestamp_odlaska ? 'Završeno' : 'Aktivan'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evidencija-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'all' && value !== ''
  ).length;

  return (
    <div className="advanced-attendance">
      {/* HEADER SA STATISTIKAMA */}
      <div className="attendance-header">
        <div className="header-main">
          <div className="header-title-section">
            <h2>📊 Sva Evidencija Dolazaka</h2>
            <p className="header-subtitle">Upravljajte i analizirajte sve evidencije dolazaka</p>
          </div>
          <div className="header-actions">
            <button 
              className={`btn btn-secondary ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              🔍 Filteri {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            <button className="btn btn-secondary" onClick={resetFilters}>
              🔄 Resetuj
            </button>
            <button className="btn btn-primary" onClick={exportToCSV}>
              📥 Export
            </button>
          </div>
        </div>
        
        <div className="stats-overview">
          <div className="stat-item">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Ukupno zapisa</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.totalHours}h</div>
            <div className="stat-label">Ukupno sati</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.totalBreaks}</div>
            <div className="stat-label">Ukupno pauza</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.activeRecords}</div>
            <div className="stat-label">Aktivnih</div>
          </div>
        </div>
      </div>

      {/* KOMPAKTNI FILTERI */}
      {showFilters && (
        <div className="filters-panel-compact">
          <div className="filters-header">
            <h4>🔍 Filteri Pretrage</h4>
            <button 
              className="btn btn-sm btn-ghost"
              onClick={() => setShowFilters(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="filters-grid-compact">
            {/* Prvi red filtera */}
            <div className="filter-row">
              <div className="filter-group-compact">
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

              <div className="filter-group-compact">
                <label className="filter-label">Mesto rada</label>
                <select 
                  value={filters.workplace}
                  onChange={(e) => setFilters(prev => ({...prev, workplace: e.target.value}))}
                  className="filter-select"
                >
                  <option value="all">Sva mesta</option>
                  {getUniqueWorkplaces().map(place => (
                    <option key={place} value={place}>{place}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group-compact">
                <label className="filter-label">Status</label>
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                  className="filter-select"
                >
                  <option value="all">Svi statusi</option>
                  <option value="active">Aktivni</option>
                  <option value="completed">Završeni</option>
                </select>
              </div>
            </div>

            {/* Drugi red filtera */}
            <div className="filter-row">
              <div className="filter-group-compact">
                <label className="filter-label">Datum od</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({...prev, dateFrom: e.target.value}))}
                  className="filter-input"
                />
              </div>

              <div className="filter-group-compact">
                <label className="filter-label">Datum do</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({...prev, dateTo: e.target.value}))}
                  className="filter-input"
                />
              </div>

              <div className="filter-group-compact">
                <label className="filter-label">Mesec</label>
                <select 
                  value={filters.month}
                  onChange={(e) => setFilters(prev => ({...prev, month: e.target.value}))}
                  className="filter-select"
                >
                  <option value="">Svi meseci</option>
                  <option value="0">Januar</option>
                  <option value="1">Februar</option>
                  <option value="2">Mart</option>
                  <option value="3">April</option>
                  <option value="4">Maj</option>
                  <option value="5">Jun</option>
                  <option value="6">Jul</option>
                  <option value="7">Avgust</option>
                  <option value="8">Septembar</option>
                  <option value="9">Oktobar</option>
                  <option value="10">Novembar</option>
                  <option value="11">Decembar</option>
                </select>
              </div>
            </div>

            {/* Treći red filtera */}
            <div className="filter-row">
              <div className="filter-group-compact">
                <label className="filter-label">Min sati</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="0"
                  value={filters.minHours}
                  onChange={(e) => setFilters(prev => ({...prev, minHours: e.target.value}))}
                  className="filter-input"
                />
              </div>

              <div className="filter-group-compact">
                <label className="filter-label">Max sati</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="24"
                  value={filters.maxHours}
                  onChange={(e) => setFilters(prev => ({...prev, maxHours: e.target.value}))}
                  className="filter-input"
                />
              </div>

              <div className="filter-group-compact">
                <label className="filter-label">Pauze</label>
                <select 
                  value={filters.hasBreaks}
                  onChange={(e) => setFilters(prev => ({...prev, hasBreaks: e.target.value}))}
                  className="filter-select"
                >
                  <option value="all">Svi zapisi</option>
                  <option value="yes">Sa pauzama</option>
                  <option value="no">Bez pauza</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REZULTATI */}
      <div className="results-section">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Učitavam podatke...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Nema pronađenih rezultata</h3>
            <p>Promenite filtere da biste videli evidencije</p>
          </div>
        ) : (
          <>
            <div className="results-header">
              <span className="results-count">
                Prikazano: {filteredData.length} od {pagination.total} zapisa
              </span>
              <div className="pagination-controls">
                <button 
                  className="btn btn-sm btn-secondary"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  ← Prethodna
                </button>
                <span className="page-info">
                  Strana {pagination.page} od {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <button 
                  className="btn btn-sm btn-secondary"
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Sledeća →
                </button>
              </div>
            </div>

            <div className="attendance-grid">
              {filteredData.map((record, index) => (
                <div key={index} className="attendance-card">
                  <div className="card-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        {getInitials(record.user.ime, record.user.prezime)}
                      </div>
                      <div className="user-details">
                        <h4>{record.user.ime} {record.user.prezime}</h4>
                        <p>{record.user.mesto_rada} • {record.user.email}</p>
                      </div>
                    </div>
                    <div className={`status-badge ${record.timestamp_odlaska ? 'completed' : 'active'}`}>
                      {record.timestamp_odlaska ? '✅ Završeno' : '🟢 Aktivan'}
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="time-info">
                      <div className="time-row">
                        <span className="time-label">📅 Datum:</span>
                        <span className="time-value">{formatDate(record.timestamp_dolaska)}</span>
                      </div>
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
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedAttendance;