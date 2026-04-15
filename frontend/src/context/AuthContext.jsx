import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('ss_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(res => setUser(res.data.data.user))
      .catch(() => localStorage.removeItem('ss_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('ss_token', res.data.token);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    localStorage.setItem('ss_token', res.data.token);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const logout = () => {
    localStorage.removeItem('ss_token');
    setUser(null);
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
