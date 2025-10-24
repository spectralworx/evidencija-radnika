import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const UserFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingUser,
  allUsers = []
}) => {
  const [formData, setFormData] = useState({
    ime: '',
    prezime: '',
    email: '',
    telefon: '',
    mesto_rada: '',
    role: 'radnik',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editingUser changes
  useEffect(() => {
    if (isOpen) {
      if (editingUser) {
        setFormData({
          ime: editingUser.ime || '',
          prezime: editingUser.prezime || '',
          email: editingUser.email || '',
          telefon: editingUser.telefon || '',
          mesto_rada: editingUser.mesto_rada || '',
          role: editingUser.role || 'radnik',
          password: ''
        });
      } else {
        setFormData({
          ime: '',
          prezime: '',
          email: '',
          telefon: '',
          mesto_rada: '',
          role: 'radnik',
          password: ''
        });
      }
      setErrors({});
    }
  }, [editingUser, isOpen]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ime.trim()) newErrors.ime = 'Ime je obavezno';
    if (!formData.prezime.trim()) newErrors.prezime = 'Prezime je obavezno';
    if (!formData.email.trim()) {
      newErrors.email = 'Email je obavezan';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email nije validan';
    }
    if (!formData.mesto_rada.trim()) newErrors.mesto_rada = 'Mesto rada je obavezno';
    
    // Provera da li email već postoji (samo za nove korisnike)
    if (!editingUser) {
      const emailExists = allUsers.some(user => 
        user.email.toLowerCase() === formData.email.toLowerCase()
      );
      if (emailExists) {
        newErrors.email = 'Korisnik sa ovim email-om već postoji';
      }
    }

    if (!editingUser && !formData.password) {
      newErrors.password = 'Lozinka je obavezna za nove korisnike';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Lozinka mora imati najmanje 6 karaktera';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Greška pri čuvanju korisnika:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay user-modal-overlay">
      <div className="modal user-modal">
        <div className="modal-header">
          <h2>{editingUser ? '✏️ Izmeni Korisnika' : '👥 Dodaj Novog Korisnika'}</h2>
          <button 
            className="modal-close"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Ime</label>
              <input
                type="text"
                className={`form-input ${errors.ime ? 'error' : ''}`}
                value={formData.ime}
                onChange={(e) => handleInputChange('ime', e.target.value)}
                placeholder="Unesite ime"
                disabled={isSubmitting}
              />
              {errors.ime && <span className="error-message">{errors.ime}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Prezime</label>
              <input
                type="text"
                className={`form-input ${errors.prezime ? 'error' : ''}`}
                value={formData.prezime}
                onChange={(e) => handleInputChange('prezime', e.target.value)}
                placeholder="Unesite prezime"
                disabled={isSubmitting}
              />
              {errors.prezime && <span className="error-message">{errors.prezime}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Email</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="office@company.com"
                disabled={isSubmitting}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Lozinka {!editingUser && <span className="required">*</span>}
              </label>
              <input
                type="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={editingUser ? "Ostavite prazno da zadržite postojeću" : "Unesite lozinku"}
                disabled={isSubmitting}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
              {editingUser && (
                <div className="form-hint">Ostavite prazno da zadržite postojeću lozinku</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Telefon</label>
              <input
                type="tel"
                className="form-input"
                value={formData.telefon}
                onChange={(e) => handleInputChange('telefon', e.target.value)}
                placeholder="+381 60 123 4567"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Mesto rada</label>
              <input
                type="text"
                className={`form-input ${errors.mesto_rada ? 'error' : ''}`}
                value={formData.mesto_rada}
                onChange={(e) => handleInputChange('mesto_rada', e.target.value)}
                placeholder="Unesite mesto rada"
                disabled={isSubmitting}
              />
              {errors.mesto_rada && <span className="error-message">{errors.mesto_rada}</span>}
            </div>

            <div className="form-group full-width">
              <label className="form-label required">Uloga</label>
              <div className="role-selector">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="radnik"
                    checked={formData.role === 'radnik'}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    disabled={isSubmitting}
                  />
                  <span className="role-card">
                    <span className="role-icon">👷</span>
                    <span className="role-info">
                      <strong>Zaposleni</strong>
                      <span>Osnovni korisnički nalog</span>
                    </span>
                  </span>
                </label>
                
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    disabled={isSubmitting}
                  />
                  <span className="role-card">
                    <span className="role-icon">👑</span>
                    <span className="role-info">
                      <strong>Administrator</strong>
                      <span>Puni pristup sistemu</span>
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Otkaži
          </button>
          <button 
            type="submit"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner-btn"></span>
                Čuvanje...
              </>
            ) : (
              <>
                {editingUser ? '💾 Ažuriraj' : '👥 Kreiraj'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;