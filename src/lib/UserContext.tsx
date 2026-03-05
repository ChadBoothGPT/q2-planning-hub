'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  currentUser: string;
  setCurrentUser: (name: string) => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: 'Chad',
  setCurrentUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState('Chad');

  useEffect(() => {
    const saved = localStorage.getItem('q2-planning-user');
    if (saved) setCurrentUserState(saved);
  }, []);

  function setCurrentUser(name: string) {
    setCurrentUserState(name);
    localStorage.setItem('q2-planning-user', name);
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
