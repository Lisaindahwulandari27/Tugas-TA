
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('Loaded user from localStorage:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = (userData: User) => {
    console.log('Logging in user:', userData);
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
