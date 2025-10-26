import React from 'react';

const Sidebar = ({ isOpen, onClose, activeView, setActiveView, user, onLogout, t, getInitials }) => {
  const handleNavigation = (view) => {
    setActiveView(view);
    onClose();
  };

  const baseNavItems = [
    { id: 'main', icon: '🏠', label: t('dashboard') },
    { id: 'history', icon: '📊', label: t('history') },
    { id: 'vacation', icon: '🌴', label: t('vacationRequest') },
  ];

  // Admin opcije koje se prikazuju samo adminima
  const adminNavItems = [
    { id: 'all-attendance', icon: '👥', label: 'Sva Evidencija' },
    { id: 'user-management', icon: '👨‍💼', label: 'Upravljanje Korisnicima' },
    { id: 'vacation-management', icon: '📋', label: 'Upravljanje Odsustvima' },
    { id: 'qr-management', icon: '🔷', label: 'QR Kodovi' },
  ];

  const settingsNavItem = { id: 'settings', icon: '⚙️', label: t('settings') };

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay active" onClick={onClose}></div>
      )}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span>🏢 {t('appTitle')}</span>
          </div>
          <button 
            className="sidebar-close" 
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-profile">
            <div className="user-avatar-sidebar">
              {getInitials(user.ime, user.prezime)}
            </div>
            <div className="user-info-sidebar">
              <h3>{user.ime} {user.prezime}</h3>
              <p>
                <span className={`status-badge ${user.role === 'admin' ? 'status-active' : 'status-completed'}`}>
                  {user.role === 'admin' ? '👑 Administrator' : '👷 Zaposleni'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* Osnovne opcije za sve korisnike */}
          {baseNavItems.map((item) => (
            <button 
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => handleNavigation(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}

          {/* ADMIN SEKCIJA - samo za admine */}
          {user.role === 'admin' && (
            <>
              <div className="nav-divider"></div>
              <div className="nav-section-header">
                <span className="nav-section-title">Admin Tools</span>
              </div>
              {adminNavItems.map((item) => (
                <button 
                  key={item.id}
                  className={`nav-item ${activeView === item.id ? 'active' : ''} admin-item`}
                  onClick={() => handleNavigation(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  <span className="admin-badge">ADMIN</span>
                </button>
              ))}
            </>
          )}

          {/* Podešavanja - za sve korisnike */}
          <div className="nav-divider"></div>
          <button 
            className={`nav-item ${activeView === settingsNavItem.id ? 'active' : ''}`}
            onClick={() => handleNavigation(settingsNavItem.id)}
          >
            <span className="nav-icon">{settingsNavItem.icon}</span>
            <span className="nav-label">{settingsNavItem.label}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="btn btn-error btn-block"
            onClick={onLogout}
          >
            🚪 {t('logout')}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;