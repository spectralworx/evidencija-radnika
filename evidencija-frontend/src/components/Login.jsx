import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password
      });

      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔐 {t('appTitle')}</h1>
          <p>{t('loginDesc')}</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">{t('email')}</label>
            <input
              type="email"
              className="form-input"
              placeholder="office@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="message error" style={{marginBottom: '1rem'}}>
              {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '⏳ ' + t('loading') : '🔑 ' + t('loginBtn')}
          </button>
        </form>

        <div className="test-credentials">
          <h4>🧪 {t('testAccount')}</h4>
          <p><strong>Email:</strong> admin@company.com</p>
          <p><strong>Password:</strong> admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;