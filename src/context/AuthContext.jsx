import React, { createContext, useContext, useState, useCallback } from 'react';

const AdminContext = createContext({
  isAdmin: false,
  requestAdmin: () => {},
  showPasswordModal: false,
  setShowPasswordModal: () => {},
  pendingAction: null,
});

const ADMIN_PASSWORD = 'pass123';

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Call this when user tries to do an admin action
  // If already admin, run callback immediately
  // Otherwise, show password modal and store callback for later
  const requestAdmin = useCallback((callback) => {
    if (isAdmin) {
      if (callback) callback();
      return;
    }
    setPendingAction(() => callback);
    setShowPasswordModal(true);
  }, [isAdmin]);

  const verifyPassword = (password) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowPasswordModal(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ 
      isAdmin, 
      requestAdmin, 
      verifyPassword, 
      lockAdmin,
      showPasswordModal, 
      setShowPasswordModal 
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
