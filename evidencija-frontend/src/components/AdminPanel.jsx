import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const AdminPanel = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [allUsers, setAllUsers] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [vacationRequests, setVacationRequests] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [reason, setReason] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [vacationFilters, setVacationFilters] = useState({
    user: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const [vacationActionModal, setVacationActionModal] = useState({
    isOpen: false,
    request: null,
    action: null,
    reason: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadAllUsers(),
        loadStatistics(),
        loadAttendanceHistory(),
        loadVacationRequests()
      ]);
    } catch (error) {
      console.error('Greška pri učitavanju podataka:', error);
    }
  };

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

  const loadStatistics = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/admin/statistics`);
      if (response.data.success) {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Greška pri učitavanju statistika:', error);
    }
  };

  const loadAttendanceHistory = async () => {
    try {
      const params = selectedUser !== 'all' ? { user_id: selectedUser } : {};
      const response = await axios.get(`${config.API_BASE_URL}/attendance-history/all`, { params });
      if (response.data.success) {
        setAttendanceHistory(response.data.history);
      }
    } catch (error) {
      console.error('Greška pri učitavanju istorije:', error);
    }
  };

  const loadVacationRequests = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/vacation-requests/all`);
      if (response.data.success) {
        setVacationRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Greška pri učitavanju zahteva:', error);
    }
  };

  const filteredVacationRequests = vacationRequests.filter(request => {
    const userMatch = vacationFilters.user === 'all' || request.user_id === vacationFilters.user;
    const statusMatch = vacationFilters.status === 'all' || request.status === vacationFilters.status;
    
    let dateMatch = true;
    if (vacationFilters.dateFrom) {
      const startDate = new Date(request.pocetak);
      const filterFrom = new Date(vacationFilters.dateFrom);
      dateMatch = dateMatch && startDate >= filterFrom;
    }
    if (vacationFilters.dateTo) {
      const endDate = new Date(request.kraj);
      const filterTo = new Date(vacationFilters.dateTo);
      dateMatch = dateMatch && endDate <= filterTo;
    }
    
    return userMatch && statusMatch && dateMatch;
  });

  const handleVacationAction = (requestId, action) => {
    const request = vacationRequests.find(r => r.id === requestId);
    setVacationActionModal({
      isOpen: true,
      request,
      action,
      reason: ''
    });
  };

  const confirmVacationAction = async () => {
    const { request, action, reason } = vacationActionModal;
    
    if (!request) return;

    try {
      await axios.put(`${config.API_BASE_URL}/vacation-request/${request.id}`, {
        status: action,
        napomena_admina: reason || ''
      });
      
      await loadVacationRequests();
      await loadStatistics();
      
      setVacationActionModal({
        isOpen: false,
        request: null,
        action: null,
        reason: ''
      });
    } catch (error) {
      console.error('Greška pri ažuriranju zahteva:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name, surname) => {
    return (name.charAt(0) + surname.charAt(0)).toUpperCase();
  };

  // Dashboard Tab
  const renderDashboard = () => (
    <div className="admin-dashboard">
      <h2>📊 {t('adminDashboard')}</h2>
      
      {statistics && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{statistics.total_users}</div>
            <div className="stat-label">{t('totalUsers')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{statistics.total_admins}</div>
            <div className="stat-label">{t('admins')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{statistics.total_workers}</div>
            <div className="stat-label">{t('workers')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{statistics.total_attendance}</div>
            <div className="stat-label">{t('totalAttendance')}</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-number">{statistics.pending_vacation_requests}</div>
            <div className="stat-label">{t('pendingRequests')}</div>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <h3>🚀 {t('quickActions')}</h3>
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={() => setActiveTab('attendance')}>
            👥 {t('viewAttendance')}
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('vacations')}>
            🌴 {t('manageVacations')}
          </button>
          <button className="btn btn-success" onClick={() => navigate('/qr')}>
            🔷 QR Kodovi
          </button>
        </div>
      </div>

      <div className="recent-section">
        <h3>📈 Nedavna Aktivnost</h3>
        <div className="recent-grid">
          <div className="recent-card">
            <h4>👥 Poslednji Dolasci</h4>
            <div className="recent-list">
              {attendanceHistory.slice(0, 5).map((record, index) => (
                <div key={index} className="recent-item">
                  <span className="user-name">{record.user.ime} {record.user.prezime}</span>
                  <span className="time">{formatDateTime(record.timestamp_dolaska)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="recent-card">
            <h4>🌴 Zahtevi na Čekanju</h4>
            <div className="recent-list">
              {vacationRequests.filter(r => r.status === 'ceka').slice(0, 5).map((request, index) => (
                <div key={index} className="recent-item">
                  <span className="user-name">{request.user.ime} {request.user.prezime}</span>
                  <span className="date">{formatDate(request.pocetak)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Attendance Tab
  const renderAttendance = () => (
    <div className="attendance-management">
      <div className="section-header">
        <h2>👥 {t('attendanceManagement')}</h2>
        <div className="filters">
          <select 
            value={selectedUser} 
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setTimeout(loadAttendanceHistory, 100);
            }}
            className="form-input"
          >
            <option value="all">{t('allUsers')}</option>
            {allUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.ime} {user.prezime} ({user.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="attendance-list">
        {attendanceHistory.length === 0 ? (
          <p className="no-data">Nema podataka o dolascima</p>
        ) : (
          attendanceHistory.map((record, index) => (
            <div key={index} className="attendance-record">
              <div className="record-header">
                <div className="user-info">
                  <strong>{record.user.ime} {record.user.prezime}</strong>
                  <span className="user-details">
                    {record.user.email} • {record.user.mesto_rada}
                  </span>
                </div>
                <span className={`status ${record.timestamp_odlaska ? 'completed' : 'active'}`}>
                  {record.timestamp_odlaska ? '✅ Završeno' : '🟢 Aktivan'}
                </span>
              </div>
              
              <div className="record-details">
                <div className="time-info">
                  <span>⬇️ {t('arrival')}: {formatDateTime(record.timestamp_dolaska)}</span>
                  {record.timestamp_odlaska && (
                    <span>⬆️ {t('departure')}: {formatDateTime(record.timestamp_odlaska)}</span>
                  )}
                </div>
                
                <div className="time-stats">
                  <span>⏱️ {t('totalTime')}: {record.ukupno_vreme_sati}h</span>
                  <span>⏸️ {t('breakTime')}: {record.ukupno_pauza_sati}h</span>
                  <span>✅ {t('effectiveTime')}: {record.efektivno_vreme_sati}h</span>
                </div>
              </div>

              {record.pauze && record.pauze.length > 0 && (
                <div className="breaks-section">
                  <details>
                    <summary>{t('breaks')}: {record.pauze.length}</summary>
                    <div className="breaks-list">
                      {record.pauze.map((pauza, idx) => (
                        <div key={idx} className="break-item">
                          ⏸️ {formatDateTime(pauza.pocetak)} - {pauza.kraj ? formatDateTime(pauza.kraj) : t('inProgress')}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Vacations Tab
  const renderVacations = () => (
    <div className="vacation-management">
      <div className="section-header">
        <h2>🌴 Upravljanje Odsustvima</h2>
        <div className="vacation-stats">
          <div className="stat-badge pending">
            Na čekanju: {vacationRequests.filter(r => r.status === 'ceka').length}
          </div>
          <div className="stat-badge approved">
            Odobreno: {vacationRequests.filter(r => r.status === 'odobreno').length}
          </div>
          <div className="stat-badge rejected">
            Odbijeno: {vacationRequests.filter(r => r.status === 'odbijeno').length}
          </div>
        </div>
      </div>

      <div className="filters-container">
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Zaposleni</label>
            <select 
              value={vacationFilters.user}
              onChange={(e) => setVacationFilters(prev => ({...prev, user: e.target.value}))}
              className="form-input"
            >
              <option value="all">Svi zaposleni</option>
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.ime} {user.prezime}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              value={vacationFilters.status}
              onChange={(e) => setVacationFilters(prev => ({...prev, status: e.target.value}))}
              className="form-input"
            >
              <option value="all">Svi statusi</option>
              <option value="ceka">Na čekanju</option>
              <option value="odobreno">Odobreno</option>
              <option value="odbijeno">Odbijeno</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Od datuma</label>
            <input
              type="date"
              value={vacationFilters.dateFrom}
              onChange={(e) => setVacationFilters(prev => ({...prev, dateFrom: e.target.value}))}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Do datuma</label>
            <input
              type="date"
              value={vacationFilters.dateTo}
              onChange={(e) => setVacationFilters(prev => ({...prev, dateTo: e.target.value}))}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="filter-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setVacationFilters({
              user: 'all',
              status: 'all',
              dateFrom: '',
              dateTo: ''
            })}
          >
            🔄 Resetuj filtere
          </button>
          <span className="filter-count">
            Pronađeno: {filteredVacationRequests.length} zahteva
          </span>
        </div>
      </div>

      <div className="vacation-requests-grid">
        {filteredVacationRequests.length === 0 ? (
          <div className="no-data">
            <div className="no-data-icon">📭</div>
            <h3>Nema pronađenih zahteva</h3>
            <p>Promenite filtere da biste videli rezultate</p>
          </div>
        ) : (
          filteredVacationRequests.map((request) => (
            <div key={request.id} className={`vacation-request-card status-${request.status}`}>
              <div className="request-header">
                <div className="user-avatar-sm">
                  {getInitials(request.user.ime, request.user.prezime)}
                </div>
                <div className="user-info-card">
                  <h4>{request.user.ime} {request.user.prezime}</h4>
                  <p>{request.user.email}</p>
                </div>
                <div className={`status-bubble ${request.status}`}>
                  {request.status === 'ceka' ? '⏳ Na čekanju' : 
                   request.status === 'odobreno' ? '✅ Odobreno' : '❌ Odbijeno'}
                </div>
              </div>
              
              <div className="request-dates">
                <div className="date-range">
                  <span className="date-icon">📅</span>
                  {formatDate(request.pocetak)} - {formatDate(request.kraj)}
                </div>
                <div className="submitted-date">
                  Podneto: {formatDateTime(request.created_at)}
                </div>
              </div>
              
              {request.napomena_radnika && (
                <div className="employee-notes-card">
                  <strong>Napomena zaposlenog:</strong>
                  <p>{request.napomena_radnika}</p>
                </div>
              )}
              
              {request.napomena_admina && (
                <div className="admin-notes-card">
                  <strong>Napomena administratora:</strong>
                  <p>{request.napomena_admina}</p>
                </div>
              )}
              
              {request.status === 'ceka' && (
                <div className="request-actions-card">
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => handleVacationAction(request.id, 'odobreno')}
                  >
                    ✅ Odobri
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleVacationAction(request.id, 'odbijeno')}
                  >
                    ❌ Odbij
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {vacationActionModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal action-modal">
            <div className="modal-header">
              <h3>
                {vacationActionModal.action === 'odobreno' ? '✅ Odobri zahtev' : '❌ Odbij zahtev'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => setVacationActionModal({ isOpen: false, request: null, action: null, reason: '' })}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="request-preview">
                <div className="user-avatar-sm">
                  {getInitials(
                    vacationActionModal.request.user.ime, 
                    vacationActionModal.request.user.prezime
                  )}
                </div>
                <div className="preview-info">
                  <strong>{vacationActionModal.request.user.ime} {vacationActionModal.request.user.prezime}</strong>
                  <div className="preview-dates">
                    {formatDate(vacationActionModal.request.pocetak)} - {formatDate(vacationActionModal.request.kraj)}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  {vacationActionModal.action === 'odobreno' ? 'Napomena (opciono)' : 'Razlog odbijanja (obavezno)'}
                </label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder={
                    vacationActionModal.action === 'odobreno' 
                      ? "Unesite napomenu za zaposlenog..." 
                      : "Objasnite razlog odbijanja zahteva..."
                  }
                  value={vacationActionModal.reason}
                  onChange={(e) => setVacationActionModal(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                />
                {vacationActionModal.action === 'odbijeno' && !vacationActionModal.reason.trim() && (
                  <div className="error-message">Razlog odbijanja je obavezan</div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setVacationActionModal({ isOpen: false, request: null, action: null, reason: '' })}
              >
                Otkaži
              </button>
              <button 
                className={`btn ${
                  vacationActionModal.action === 'odobreno' ? 'btn-success' : 'btn-danger'
                }`}
                onClick={confirmVacationAction}
                disabled={
                  vacationActionModal.action === 'odbijeno' && 
                  !vacationActionModal.reason.trim()
                }
              >
                {vacationActionModal.action === 'odobreno' ? '✅ Odobri' : '❌ Odbij'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <div className="admin-header-left">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            ← Nazad na Dashboard
          </button>
          <h1>👑 Admin Panel</h1>
        </div>
        
        <div className="admin-header-right">
          <div className="admin-user-info">
            <span>{user.ime} {user.prezime}</span>
            <span className="user-role">Administrator</span>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>
            🚪 Odjava
          </button>
        </div>
      </header>

      <nav className="admin-nav">
        <button 
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`nav-tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          👥 Evidencija
        </button>
        <button 
          className={`nav-tab ${activeTab === 'vacations' ? 'active' : ''}`}
          onClick={() => setActiveTab('vacations')}
        >
          🌴 Odsustva
        </button>
      </nav>

      <main className="admin-main">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'attendance' && renderAttendance()}
        {activeTab === 'vacations' && renderVacations()}
      </main>
    </div>
  );
};

export default AdminPanel;