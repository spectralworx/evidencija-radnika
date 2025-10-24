import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';

const VacationManagement = ({ user, vacationRequests, onVacationAction, allUsers = [] }) => {
  const [filters, setFilters] = useState({
    employee: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    request: null,
    action: null,
    reason: ''
  });
  const [viewMode, setViewMode] = useState('box'); // 'box' ili 'list'

  // Inline styles za list view
  const styles = {
    viewModeToggle: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      padding: '1.5rem',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e2e8f0'
    },
    toggleButtons: {
      display: 'flex',
      gap: '0.75rem'
    },
    toggleBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      border: '2px solid #cbd5e1',
      background: 'white',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontWeight: '500',
      color: '#475569',
      fontSize: '0.875rem'
    },
    toggleBtnActive: {
      border: '2px solid #4361ee',
      background: '#4361ee',
      color: 'white'
    },
    tableContainer: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
      border: '1px solid #e2e8f0'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.875rem',
      background: 'white'
    },
    tableHeader: {
      background: '#f8fafc',
      padding: '1rem',
      textAlign: 'left',
      fontWeight: '600',
      color: '#374151',
      borderBottom: '1px solid #e2e8f0',
      whiteSpace: 'nowrap'
    },
    tableCell: {
      padding: '1rem',
      borderBottom: '1px solid #e2e8f0',
      verticalAlign: 'middle',
      background: 'white'
    },
    userCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      minWidth: '200px'
    },
    userAvatarXs: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #4361ee, #7209b7)',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '0.875rem',
      flexShrink: '0'
    },
    userInfo: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: '0'
    },
    userName: {
      color: '#1e293b',
      fontSize: '0.875rem',
      fontWeight: '600',
      marginBottom: '0.25rem'
    },
    userEmail: {
      color: '#64748b',
      fontSize: '0.75rem'
    },
    dateCell: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      minWidth: '180px'
    },
    dateSeparator: {
      color: '#cbd5e1',
      fontSize: '0.75rem',
      textAlign: 'center',
      margin: '0.125rem 0'
    },
    submittedCell: {
      color: '#64748b',
      fontSize: '0.8rem',
      minWidth: '140px'
    },
    notesCell: {
      maxWidth: '250px',
      minWidth: '200px'
    },
    notePreview: {
      fontSize: '0.8rem',
      color: '#64748b',
      marginBottom: '0.5rem',
      lineHeight: '1.4'
    },
    tableActions: {
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'flex-start'
    },
    btnXs: {
      padding: '0.5rem 0.75rem',
      fontSize: '0.75rem',
      minWidth: 'auto',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.25rem',
      fontWeight: '500'
    },
    btnSuccess: {
      background: '#10b981',
      color: 'white'
    },
    btnDanger: {
      background: '#ef4444',
      color: 'white'
    },
    statusBubble: {
      padding: '0.375rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    statusPending: {
      background: '#fef3c7',
      color: '#92400e'
    },
    statusApproved: {
      background: '#d1fae5',
      color: '#065f46'
    },
    statusRejected: {
      background: '#fee2e2',
      color: '#991b1b'
    },
    rowPending: {
      borderLeft: '4px solid #f59e0b'
    },
    rowApproved: {
      borderLeft: '4px solid #10b981'
    },
    rowRejected: {
      borderLeft: '4px solid #ef4444'
    },
    noActions: {
      color: '#9ca3af',
      fontSize: '0.8rem',
      fontStyle: 'italic'
    }
  };

  // Helper funkcije za formatiranje datuma
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

  // Filtriranje zahteva
  const filteredRequests = vacationRequests.filter(request => {
    const employeeMatch = filters.employee === 'all' || request.user_id === filters.employee;
    const statusMatch = filters.status === 'all' || request.status === filters.status;
    
    let dateMatch = true;
    if (filters.dateFrom) {
      const startDate = new Date(request.pocetak);
      const filterFrom = new Date(filters.dateFrom);
      dateMatch = dateMatch && startDate >= filterFrom;
    }
    if (filters.dateTo) {
      const endDate = new Date(request.kraj);
      const filterTo = new Date(filters.dateTo);
      dateMatch = dateMatch && endDate <= filterTo;
    }
    
    return employeeMatch && statusMatch && dateMatch;
  });

  const handleAction = (requestId, action) => {
    const request = vacationRequests.find(r => r.id === requestId);
    setActionModal({
      isOpen: true,
      request,
      action,
      reason: ''
    });
  };

  const confirmAction = () => {
    const { request, action, reason } = actionModal;
    if (!request) return;

    onVacationAction(request.id, action, reason);
    setActionModal({ isOpen: false, request: null, action: null, reason: '' });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ceka': { style: { ...styles.statusBubble, ...styles.statusPending }, text: 'Na čekanju', icon: '⏳' },
      'odobreno': { style: { ...styles.statusBubble, ...styles.statusApproved }, text: 'Odobreno', icon: '✅' },
      'odbijeno': { style: { ...styles.statusBubble, ...styles.statusRejected }, text: 'Odbijeno', icon: '❌' }
    };
    const config = statusConfig[status] || statusConfig.ceka;
    return (
      <span style={config.style}>
        {config.icon} {config.text}
      </span>
    );
  };

  const getRowStyle = (status) => {
    const statusStyles = {
      'ceka': styles.rowPending,
      'odobreno': styles.rowApproved,
      'odbijeno': styles.rowRejected
    };
    return statusStyles[status] || {};
  };

  const getInitials = (name, surname) => {
    return (name?.charAt(0) + surname?.charAt(0)).toUpperCase();
  };

  // BOX VIEW - postojeći dizajn
  const renderBoxView = () => (
    <div className="vacation-requests-grid">
      {filteredRequests.length === 0 ? (
        <div className="no-data">
          <div className="no-data-icon">📭</div>
          <h3>Nema pronađenih zahteva</h3>
          <p>Promenite filtere da biste videli rezultate</p>
        </div>
      ) : (
        filteredRequests.map((request) => (
          <div key={request.id} className={`vacation-request-card status-${request.status}`}>
            <div className="request-header">
              <div className="user-avatar-sm">
                {getInitials(request.user.ime, request.user.prezime)}
              </div>
              <div className="user-info-card">
                <h4>{request.user.ime} {request.user.prezime}</h4>
                <p>{request.user.email}</p>
              </div>
              {getStatusBadge(request.status)}
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
                <strong>📝 Napomena zaposlenog:</strong>
                <p>{request.napomena_radnika}</p>
              </div>
            )}
            
            {request.napomena_admina && (
              <div className="admin-notes-card">
                <strong>💼 Napomena administratora:</strong>
                <p>{request.napomena_admina}</p>
              </div>
            )}
            
            {request.status === 'ceka' && user.role === 'admin' && (
              <div className="request-actions-card">
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => handleAction(request.id, 'odobreno')}
                >
                  ✅ Odobri
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleAction(request.id, 'odbijeno')}
                >
                  ❌ Odbij
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  // LIST VIEW - novi table dizajn sa inline stilovima
  const renderListView = () => (
    <div style={styles.tableContainer}>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Zaposleni</th>
              <th style={styles.tableHeader}>Period</th>
              <th style={styles.tableHeader}>Podnet</th>
              <th style={styles.tableHeader}>Status</th>
              <th style={styles.tableHeader}>Napomena</th>
              {user.role === 'admin' && <th style={styles.tableHeader}>Akcije</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={user.role === 'admin' ? 6 : 5} style={{ ...styles.tableCell, textAlign: 'center', padding: '3rem' }}>
                  <div className="no-data">
                    <div className="no-data-icon">📭</div>
                    <h3>Nema pronađenih zahteva</h3>
                    <p>Promenite filtere da biste videli rezultate</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr 
                  key={request.id} 
                  style={{
                    ...getRowStyle(request.status),
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <td style={styles.tableCell}>
                    <div style={styles.userCell}>
                      <div style={styles.userAvatarXs}>
                        {getInitials(request.user.ime, request.user.prezime)}
                      </div>
                      <div style={styles.userInfo}>
                        <strong style={styles.userName}>{request.user.ime} {request.user.prezime}</strong>
                        <span style={styles.userEmail}>{request.user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.dateCell}>
                      <div>{formatDate(request.pocetak)}</div>
                      <div style={styles.dateSeparator}>→</div>
                      <div>{formatDate(request.kraj)}</div>
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.submittedCell}>
                      {formatDateTime(request.created_at)}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    {getStatusBadge(request.status)}
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.notesCell}>
                      {request.napomena_radnika && (
                        <div style={styles.notePreview}>
                          <strong>Z:</strong> {request.napomena_radnika.substring(0, 50)}
                          {request.napomena_radnika.length > 50 && '...'}
                        </div>
                      )}
                      {request.napomena_admina && (
                        <div style={styles.notePreview}>
                          <strong>A:</strong> {request.napomena_admina.substring(0, 50)}
                          {request.napomena_admina.length > 50 && '...'}
                        </div>
                      )}
                    </div>
                  </td>
                  {user.role === 'admin' && (
                    <td style={styles.tableCell}>
                      {request.status === 'ceka' ? (
                        <div style={styles.tableActions}>
                          <button 
                            style={{ ...styles.btnXs, ...styles.btnSuccess }}
                            onClick={() => handleAction(request.id, 'odobreno')}
                            title="Odobri zahtev"
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-1px)';
                              e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            ✅ Odobri
                          </button>
                          <button 
                            style={{ ...styles.btnXs, ...styles.btnDanger }}
                            onClick={() => handleAction(request.id, 'odbijeno')}
                            title="Odbij zahtev"
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-1px)';
                              e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            ❌ Odbij
                          </button>
                        </div>
                      ) : (
                        <span style={styles.noActions}>/</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
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

      {/* View Mode Toggle sa inline stilovima */}
      <div style={styles.viewModeToggle}>
        <div style={styles.toggleButtons}>
          <button 
            style={viewMode === 'box' ? { ...styles.toggleBtn, ...styles.toggleBtnActive } : styles.toggleBtn}
            onClick={() => setViewMode('box')}
          >
            <span>📦</span>
            Box View
          </button>
          <button 
            style={viewMode === 'list' ? { ...styles.toggleBtn, ...styles.toggleBtnActive } : styles.toggleBtn}
            onClick={() => setViewMode('list')}
          >
            <span>📋</span>
            List View
          </button>
        </div>
        <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>
          Prikazano: {filteredRequests.length} zahteva
        </div>
      </div>

      {/* Filteri (ostaje isti) */}
      <div className="filters-container">
        <div className="filters-grid">
          {user.role === 'admin' && (
            <div className="form-group">
              <label className="form-label">Zaposleni</label>
              <select 
                value={filters.employee}
                onChange={(e) => setFilters(prev => ({...prev, employee: e.target.value}))}
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
          )}
          
          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
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
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({...prev, dateFrom: e.target.value}))}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Do datuma</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({...prev, dateTo: e.target.value}))}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="filter-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setFilters({
              employee: 'all',
              status: 'all',
              dateFrom: '',
              dateTo: ''
            })}
          >
            🔄 Resetuj Filtere
          </button>
        </div>
      </div>

      {/* Prikaz prema izabranom modu */}
      {viewMode === 'box' ? renderBoxView() : renderListView()}

      {/* Action Modal (ostaje isti) */}
      {actionModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal action-modal">
            <div className="modal-header">
              <h3>
                {actionModal.action === 'odobreno' ? '✅ Odobri Zahtev' : '❌ Odbij Zahtev'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => setActionModal({ isOpen: false, request: null, action: null, reason: '' })}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="request-preview">
                <div className="user-avatar-sm">
                  {getInitials(actionModal.request.user.ime, actionModal.request.user.prezime)}
                </div>
                <div className="preview-info">
                  <strong>{actionModal.request.user.ime} {actionModal.request.user.prezime}</strong>
                  <div className="preview-dates">
                    {formatDate(actionModal.request.pocetak)} - {formatDate(actionModal.request.kraj)}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  {actionModal.action === 'odobreno' ? 'Napomena (opciono)' : 'Razlog odbijanja (obavezno)'}
                </label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder={
                    actionModal.action === 'odobreno' 
                      ? "Unesite napomenu za zaposlenog..." 
                      : "Objasnite razlog odbijanja zahteva..."
                  }
                  value={actionModal.reason}
                  onChange={(e) => setActionModal(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                />
                {actionModal.action === 'odbijeno' && !actionModal.reason.trim() && (
                  <div className="error-message">Razlog odbijanja je obavezan</div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setActionModal({ isOpen: false, request: null, action: null, reason: '' })}
              >
                Otkaži
              </button>
              <button 
                className={`btn ${
                  actionModal.action === 'odobreno' ? 'btn-success' : 'btn-danger'
                }`}
                onClick={confirmAction}
                disabled={
                  actionModal.action === 'odbijeno' && 
                  !actionModal.reason.trim()
                }
              >
                {actionModal.action === 'odobreno' ? '✅ Odobri' : '❌ Odbij'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacationManagement;