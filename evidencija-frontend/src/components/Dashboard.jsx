import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import QRScanner from './QRScanner';
import Sidebar from './Sidebar';
import UserFormModal from './UserFormModal';
import VacationManagement from './VacationManagement';
import AdvancedAttendance from './AdvancedAttendance';
import AttendanceView from './AttendanceView';
import axios from 'axios';
import config from '../config';

// Komponenta za zahteve za slobodne dane
const VacationRequests = ({ vacationRequests, onVacationRequest, user, t, formatDate, formatDateTime }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    pocetak: '',
    kraj: '',
    napomena_radnika: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onVacationRequest(formData);
    setShowForm(false);
    setFormData({ pocetak: '', kraj: '', napomena_radnika: '' });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ceka': { class: 'status-pending', text: t('pending') },
      'odobreno': { class: 'status-approved', text: t('approved') },
      'odbijeno': { class: 'status-rejected', text: t('rejected') }
    };
    const config = statusConfig[status] || statusConfig.ceka;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="vacation-view">
      <div className="section-header">
        <h3 className="section-title">🌴 {t('vacationRequests')}</h3>
        <div className="section-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '❌ ' + t('cancel') : '➕ ' + t('newRequest')}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="card-body">
            <h4 className="mb-4">📝 {t('newVacationRequest')}</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('startDate')}</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={formData.pocetak}
                    onChange={(e) => setFormData({...formData, pocetak: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('endDate')}</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={formData.kraj}
                    onChange={(e) => setFormData({...formData, kraj: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('notes')}</label>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder={t('vacationNotes')}
                  value={formData.napomena_radnika}
                  onChange={(e) => setFormData({...formData, napomena_radnika: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                📨 {t('submitRequest')}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="data-section">
        <div className="data-list">
          {vacationRequests.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-muted">{t('noVacationRequests')}</p>
            </div>
          ) : (
            vacationRequests.map((request, index) => (
              <div key={index} className="data-item">
                <div className="data-header">
                  <div>
                    <h4 className="mb-2">
                      {formatDate(new Date(request.pocetak))} - {formatDate(new Date(request.kraj))}
                    </h4>
                    <div className="data-meta">
                      <span className="meta-item">
                        📅 {t('submitted')}: {formatDateTime(request.created_at)}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                
                {request.napomena_radnika && (
                  <div className="data-content">
                    <p><strong>{t('employeeNotes')}:</strong> {request.napomena_radnika}</p>
                  </div>
                )}
                
                {request.napomena_admina && (
                  <div className="data-content">
                    <p><strong>{t('adminNotes')}:</strong> {request.napomena_admina}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Komponenta za podešavanja
const SettingsView = ({ user, t, i18n }) => (
  <div className="settings-view">
    <div className="card mb-6">
      <div className="card-header">
        <h3 className="section-title">⚙️ {t('settings')}</h3>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label className="form-label">{t('languageSetting')}</label>
          <div className="d-flex gap-3">
            <button 
              className={`btn ${i18n.language === 'sr' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                i18n.changeLanguage('sr');
                localStorage.setItem('preferredLanguage', 'sr');
              }}
            >
              🇷🇸 Srpski
            </button>
            <button 
              className={`btn ${i18n.language === 'en' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                i18n.changeLanguage('en');
                localStorage.setItem('preferredLanguage', 'en');
              }}
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      </div>
    </div>

    <div className="card">
      <div className="card-header">
        <h3 className="section-title">👤 {t('profileInfo')}</h3>
      </div>
      <div className="card-body">
        <div className="data-list">
          <div className="data-item">
            <strong>{t('name')}:</strong> {user.ime} {user.prezime}
          </div>
          <div className="data-item">
            <strong>{t('email')}:</strong> {user.email}
          </div>
          <div className="data-item">
            <strong>{t('role')}:</strong> {user.role === 'admin' ? 'Administrator' : 'Zaposleni'}
          </div>
          <div className="data-item">
            <strong>{t('workplace')}:</strong> {user.mesto_rada}
          </div>
          <div className="data-item">
            <strong>{t('phone')}:</strong> {user.telefon || 'Nije postavljeno'}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = ({ user, setUser }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [scanType, setScanType] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('main');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [activeAttendance, setActiveAttendance] = useState(null);
  const [activeBreak, setActiveBreak] = useState(null);
  const [vacationRequests, setVacationRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      await loadActiveAttendance();
      await loadAttendanceHistory();
      await loadVacationRequests();
      if (user.role === 'admin') {
        await loadAllUsers();
      }
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

  const loadActiveAttendance = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/attendance-history/${user.id}`);
      if (response.data.success && response.data.history.length > 0) {
        const active = response.data.history.find(record => !record.timestamp_odlaska);
        setActiveAttendance(active || null);
        
        if (active && active.pauze) {
          const activeBreak = active.pauze.find(p => !p.kraj);
          setActiveBreak(activeBreak || null);
        }
      }
    } catch (error) {
      console.error('Greška pri učitavanju aktivnog dolaska:', error);
    }
  };

  const loadAttendanceHistory = async () => {
    try {
      let url = `${config.API_BASE_URL}/attendance-history/${user.id}`;
      if (user.role === 'admin' && activeView === 'all-attendance') {
        url = `${config.API_BASE_URL}/attendance-history/all`;
      }
      
      const response = await axios.get(url);
      if (response.data.success) {
        setAttendanceHistory(response.data.history);
      }
    } catch (error) {
      console.error('Greška pri učitavanju istorije:', error);
    }
  };

  const loadVacationRequests = async () => {
    try {
      let url = `${config.API_BASE_URL}/vacation-requests/${user.id}`;
      if (user.role === 'admin' && activeView === 'vacation-management') {
        url = `${config.API_BASE_URL}/vacation-requests/all`;
      }
      
      const response = await axios.get(url);
      if (response.data.success) {
        setVacationRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Greška pri učitavanju zahteva:', error);
    }
  };

  const handleScanResult = async (qrCode) => {
    setShowScanner(false);
    setMessage(t('checkingQr'));
    setMessageType('info');

    try {
      const validationResponse = await axios.post(`${config.API_BASE_URL}/validate-qr`, {
        qrCode: qrCode
      });

      if (!validationResponse.data.valid) {
        setMessage(t('invalidQr'));
        setMessageType('error');
        return;
      }

      switch (scanType) {
        case 'dolazak':
          if (activeAttendance) {
            setMessage(t('alreadyCheckedIn'));
            setMessageType('warning');
          } else {
            await axios.post(`${config.API_BASE_URL}/check-in`, { user_id: user.id });
            setMessage(t('checkInSuccess'));
            setMessageType('success');
            await loadActiveAttendance();
            await loadAttendanceHistory();
          }
          break;
        
        case 'odlazak':
          if (!activeAttendance) {
            setMessage(t('noActiveAttendance'));
            setMessageType('warning');
          } else {
            await axios.post(`${config.API_BASE_URL}/check-out`, { user_id: user.id });
            setMessage(t('checkOutSuccess'));
            setMessageType('success');
            await loadActiveAttendance();
            await loadAttendanceHistory();
          }
          break;
        
        case 'pauza':
          if (!activeAttendance) {
            setMessage(t('noActiveAttendance'));
            setMessageType('warning');
          } else if (activeBreak) {
            await axios.post(`${config.API_BASE_URL}/end-break`, { user_id: user.id });
            setMessage(t('breakEnded'));
            setMessageType('success');
            setActiveBreak(null);
            await loadAttendanceHistory();
          } else {
            await axios.post(`${config.API_BASE_URL}/start-break`, { user_id: user.id });
            setMessage(t('breakStarted'));
            setMessageType('success');
            setActiveBreak({ pocetak: new Date().toISOString() });
            await loadAttendanceHistory();
          }
          break;
        
        default:
          setMessage(t('unknownAction'));
          setMessageType('error');
          return;
      }

      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      setMessage(t('error') + ': ' + (error.response?.data?.error || error.message));
      setMessageType('error');
    }
  };

  const handleScanAction = (type) => {
    setScanType(type);
    setShowScanner(true);
    setMessage('');
    setSidebarOpen(false);
  };

  const handleVacationRequest = async (requestData) => {
    try {
      await axios.post(`${config.API_BASE_URL}/vacation-request`, {
        user_id: user.id,
        ...requestData
      });
      setMessage(t('vacationRequestSent'));
      setMessageType('success');
      await loadVacationRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(t('error') + ': ' + error.response?.data?.error);
      setMessageType('error');
    }
  };

  const handleVacationAction = async (requestId, status, napomena) => {
    try {
      await axios.put(`${config.API_BASE_URL}/vacation-request/${requestId}`, {
        status: status,
        napomena_admina: napomena || ''
      });
      await loadVacationRequests();
      setMessage(`Zahtev ${status === 'odobreno' ? 'odobren' : 'odbijen'}!`);
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Greška pri ažuriranju zahteva:', error);
      setMessage('Greška pri ažuriranju zahteva');
      setMessageType('error');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) {
      try {
        alert(`Brisanje korisnika ID: ${userId} - Funkcionalnost u pripremi`);
      } catch (error) {
        console.error('Greška pri brisanju korisnika:', error);
      }
    }
  };

  const handleSaveUser = async (formData) => {
    try {
      if (editingUser) {
        alert(`Ažuriranje korisnika: ${formData.ime} ${formData.prezime}`);
      } else {
        const response = await axios.post(`${config.API_BASE_URL}/create-user`, formData);
        if (response.data.success) {
          setAllUsers(prev => [...prev, response.data.user]);
          setShowUserModal(false);
          setMessage('Korisnik uspešno kreiran!');
          setMessageType('success');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    } catch (error) {
      console.error('Greška pri čuvanju korisnika:', error);
      setMessage('Došlo je do greške: ' + (error.response?.data?.error || error.message));
      setMessageType('error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const formatTimeWithSeconds = (date) => {
    return date.toLocaleTimeString('sr-RS', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
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

  const getInitials = (name, surname) => {
    return (name.charAt(0) + surname.charAt(0)).toUpperCase();
  };

  // Render glavnog view-a
  const renderMainView = () => (
    <div className="main-view">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>{t('welcome')}, {user.ime}! 👋</h1>
          <p className="text-lead">
            {formatDate(currentTime)} • {formatTimeWithSeconds(currentTime)}
          </p>
        </div>
      </div>

      {/* Status Info */}
      {activeAttendance && (
        <div className="card mb-6">
          <div className="card-body">
            <div className="d-flex align-center gap-4">
              <div className="status-badge status-active">🎯 Aktivan</div>
              <div className="flex-1">
                <p className="mb-1">
                  <strong>{t('checkedInSince')}:</strong> {formatDateTime(activeAttendance.timestamp_dolaska)}
                </p>
                {activeBreak && (
                  <p className="mb-0">
                    <strong>{t('onBreakSince')}:</strong> {formatDateTime(activeBreak.pocetak)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div className={`message message-${messageType} mb-6`}>
          {message}
        </div>
      )}

      {/* Action Grid */}
      <div className="dashboard-grid">
        <div 
          className={`action-card ${activeAttendance ? 'disabled' : ''}`}
          onClick={() => !activeAttendance && handleScanAction('dolazak')}
        >
          <div className="action-icon">📅</div>
          <h3>{t('checkIn')}</h3>
          <p>{t('checkInDesc')}</p>
          {activeAttendance && <div className="disabled-overlay">✓ {t('alreadyCheckedIn')}</div>}
        </div>

        <div 
          className={`action-card ${!activeAttendance ? 'disabled' : ''}`}
          onClick={() => activeAttendance && handleScanAction('pauza')}
        >
          <div className="action-icon">⏸️</div>
          <h3>{activeBreak ? t('endBreak') : t('break')}</h3>
          <p>{activeBreak ? t('endBreakDesc') : t('breakDesc')}</p>
          {!activeAttendance && <div className="disabled-overlay">{t('checkInFirst')}</div>}
        </div>

        <div 
          className={`action-card ${!activeAttendance ? 'disabled' : ''}`}
          onClick={() => activeAttendance && handleScanAction('odlazak')}
        >
          <div className="action-icon">🏠</div>
          <h3>{t('checkOut')}</h3>
          <p>{t('checkOutDesc')}</p>
          {!activeAttendance && <div className="disabled-overlay">{t('checkInFirst')}</div>}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid mb-8">
        <div className="stat-card">
          <div className="stat-number">{attendanceHistory.length}</div>
          <div className="stat-label">{t('totalAttendance')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {vacationRequests.filter(r => r.status === 'pending').length}
          </div>
          <div className="stat-label">{t('pendingRequests')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {attendanceHistory.filter(r => !r.timestamp_odlaska).length}
          </div>
          <div className="stat-label">Aktivni danas</div>
        </div>
      </div>
    </div>
  );

  // Render istorije dolazaka
  const renderHistoryView = () => (
    <div className="data-section">
      <div className="section-header">
        <h3 className="section-title">📊 {t('attendanceHistory')}</h3>
      </div>
      <div className="data-list">
        {attendanceHistory.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-muted">{t('noHistory')}</p>
          </div>
        ) : (
          attendanceHistory.map((record, index) => (
            <div key={index} className="data-item">
              <div className="data-header">
                <div>
                  <h4 className="mb-2">{formatDate(new Date(record.timestamp_dolaska))}</h4>
                  <div className="data-meta">
                    <span className="meta-item">
                      ⬇️ {t('arrival')}: {formatDateTime(record.timestamp_dolaska)}
                    </span>
                    {record.timestamp_odlaska && (
                      <span className="meta-item">
                        ⬆️ {t('departure')}: {formatDateTime(record.timestamp_odlaska)}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`status-badge ${record.timestamp_odlaska ? 'status-completed' : 'status-active'}`}>
                  {record.timestamp_odlaska ? t('completed') : t('active')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render zahteva za slobodne dane
  const renderVacationView = () => (
    <VacationRequests 
      vacationRequests={vacationRequests}
      onVacationRequest={handleVacationRequest}
      user={user}
      t={t}
      formatDate={formatDate}
      formatDateTime={formatDateTime}
    />
  );

  // Render podešavanja
  const renderSettingsView = () => (
    <SettingsView 
      user={user}
      t={t}
      i18n={i18n}
    />
  );

  // Render upravljanje korisnicima (admin only)
  const renderUserManagement = () => (
    <div className="data-section">
      <div className="section-header">
        <h3 className="section-title">👨‍💼 Upravljanje Korisnicima</h3>
        <div className="section-actions">
          <button className="btn btn-primary" onClick={() => {
            setEditingUser(null);
            setShowUserModal(true);
          }}>
            ➕ Dodaj Korisnika
          </button>
        </div>
      </div>

      <div className="data-list">
        {allUsers.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-muted">Učitavam korisnike...</p>
          </div>
        ) : (
          allUsers.map((user) => (
            <div key={user.id} className="data-item">
              <div className="data-header">
                <div>
                  <h4 className="mb-2">{user.ime} {user.prezime}</h4>
                  <div className="data-meta">
                    <span className="meta-item">📧 {user.email}</span>
                    <span className="meta-item">🏢 {user.mesto_rada}</span>
                    <span className="meta-item">📞 {user.telefon || 'Nije postavljeno'}</span>
                  </div>
                </div>
                <span className={`status-badge ${user.role === 'admin' ? 'status-active' : 'status-completed'}`}>
                  {user.role === 'admin' ? 'Administrator' : 'Zaposleni'}
                </span>
              </div>
              <div className="data-content">
                <div className="d-flex gap-2">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEditUser(user)}>
                    ✏️ Izmeni
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user.id)}>
                    🗑️ Obriši
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Modal */}
      <UserFormModal 
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        editingUser={editingUser}
        allUsers={allUsers}
      />
    </div>
  );

  // Render upravljanje odsustvima (admin only)
  const renderVacationManagement = () => (
    <VacationManagement 
      user={user}
      vacationRequests={vacationRequests}
      onVacationAction={handleVacationAction}
      allUsers={allUsers}
    />
  );

  // Render QR management (admin only)
  const renderQrManagement = () => (
    <div className="data-section">
      <div className="section-header">
        <h3 className="section-title">🔷 Upravljanje QR Kodovima</h3>
        <div className="section-actions">
          <button className="btn btn-primary" onClick={() => navigate('/qr')}>
            🔄 Idi na QR Stranicu
          </button>
        </div>
      </div>
      <div className="text-center p-6">
        <p className="text-muted">QR kodovi se automatski generišu u 08:00 i 15:00 sati</p>
        <button className="btn btn-secondary mt-4" onClick={() => navigate('/qr')}>
          👉 Pogledaj QR Kodove
        </button>
      </div>
    </div>
  );

  if (showScanner) {
    return (
      <QRScanner 
        onResult={handleScanResult}
        onCancel={() => setShowScanner(false)}
        scanType={scanType}
        t={t}
      />
    );
  }

  return (
    <div className="app-layout">
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        onLogout={handleLogout}
        t={t}
        getInitials={getInitials}
      />

      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <header className="header">
          <div className="header-content">
            <div className="header-left">
              <button 
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <span className="hamburger">☰</span>
              </button>
              <div className="header-title-section">
                <h1 className="header-title">{t('appTitle')}</h1>
                <div className="header-subtitle">
                  {formatDate(currentTime)}
                </div>
              </div>
            </div>

            <div className="header-right">
              <div className="time-display">
                <div className="current-time">
                  <span className="time-icon">🕒</span>
                  {formatTimeWithSeconds(currentTime)}
                </div>
                <div className="date-display">
                  {formatDate(currentTime)}
                </div>
              </div>
              
              <div className="user-menu">
                <div className="user-avatar">
                  {getInitials(user.ime, user.prezime)}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.ime} {user.prezime}</span>
                  <span className="user-role">
                    {user.role === 'admin' ? '👑 Administrator' : '👷 Zaposleni'}
                  </span>
                </div>
              </div>
              
              <button 
                className="btn btn-ghost logout-btn"
                onClick={handleLogout}
                aria-label="Logout"
                title="Odjava"
              >
                <span className="logout-icon">🚪</span>
                <span className="logout-text">{t('logout')}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="main-area">
          {activeView === 'main' && renderMainView()}
          {activeView === 'history' && renderHistoryView()}
          {activeView === 'vacation' && renderVacationView()}
          {activeView === 'settings' && renderSettingsView()}
          {activeView === 'all-attendance' && user.role === 'admin' && (
            <AttendanceView 
              user={user}
              formatDate={formatDate}
              formatDateTime={formatDateTime}
            />
          )}
          {activeView === 'user-management' && user.role === 'admin' && renderUserManagement()}
          {activeView === 'vacation-management' && user.role === 'admin' && renderVacationManagement()}
          {activeView === 'qr-management' && user.role === 'admin' && renderQrManagement()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;