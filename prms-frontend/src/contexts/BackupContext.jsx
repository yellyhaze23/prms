import React, { createContext, useContext, useState, useEffect } from 'react';

const BackupContext = createContext();

export const useBackup = () => {
  const context = useContext(BackupContext);
  if (!context) {
    throw new Error('useBackup must be used within a BackupProvider');
  }
  return context;
};

export const BackupProvider = ({ children }) => {
  const [globalBackupState, setGlobalBackupState] = useState({
    isRunning: false,
    progress: 0,
    estimatedTime: null,
    canCancel: false,
    currentAction: null, // 'create', 'restore', 'delete'
    startTime: null,
    databaseSize: null
  });

  const [backupFiles, setBackupFiles] = useState([]);
  const [progressInterval, setProgressInterval] = useState(null);

  // Fetch backup files
  const fetchBackupFiles = async () => {
    try {
      const response = await fetch('http://localhost/prms/prms-backend/api/backup_restore.php?action=list');
      const data = await response.json();
      if (data.status === 'success') {
        setBackupFiles(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch backup files:', error);
    }
  };

  // Get database size
  const getDatabaseSize = async () => {
    try {
      const response = await fetch('http://localhost/prms/prms-backend/api/backup_restore.php?action=size');
      const data = await response.json();
      if (data.status === 'success') {
        return data.data;
      }
    } catch (error) {
      console.error('Could not get database size:', error);
    }
    return null;
  };

  // Estimate backup time
  const estimateBackupTime = (sizeInMB) => {
    if (!sizeInMB) return "1-3 minutes";
    
    const secondsPerMB = 3; // Conservative estimate
    const estimatedSeconds = Math.ceil(sizeInMB * secondsPerMB);
    
    if (estimatedSeconds < 60) {
      return `${estimatedSeconds} seconds`;
    } else {
      const minutes = Math.ceil(estimatedSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  // Start backup
  const startBackup = async () => {
    setGlobalBackupState(prev => ({
      ...prev,
      isRunning: true,
      progress: 0,
      currentAction: 'create',
      canCancel: true,
      startTime: new Date()
    }));

    // Get database size for estimation
    const dbSize = await getDatabaseSize();
    const estimatedTime = estimateBackupTime(dbSize);
    
    setGlobalBackupState(prev => ({
      ...prev,
      estimatedTime,
      databaseSize: dbSize
    }));

    // Start progress simulation
    const interval = setInterval(() => {
      setGlobalBackupState(prev => {
        if (prev.progress >= 90) return prev; // Don't go to 100% until actually done
        return {
          ...prev,
          progress: prev.progress + Math.random() * 15 // Random increment for realistic feel
        };
      });
    }, 1000);

    setProgressInterval(interval);

    try {
      const response = await fetch('http://localhost/prms/prms-backend/api/backup_restore.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=backup'
      });
      const data = await response.json();

      // Complete the progress
      setGlobalBackupState(prev => ({
        ...prev,
        progress: 100
      }));

      if (data.status === 'success') {
        // Refresh backup files list
        await fetchBackupFiles();
        
        // Show success notification
        if (window.showToast) {
          window.showToast('Backup created successfully', 'success');
        }
      } else {
        if (window.showToast) {
          window.showToast(data.message, 'error');
        }
      }
    } catch (error) {
      if (window.showToast) {
        window.showToast('Failed to create backup', 'error');
      }
    } finally {
      // Clean up
      if (progressInterval) {
        clearInterval(progressInterval);
        setProgressInterval(null);
      }
      
      setGlobalBackupState({
        isRunning: false,
        progress: 0,
        estimatedTime: null,
        canCancel: false,
        currentAction: null,
        startTime: null,
        databaseSize: null
      });
    }
  };

  // Cancel backup
  const cancelBackup = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    
    setGlobalBackupState({
      isRunning: false,
      progress: 0,
      estimatedTime: null,
      canCancel: false,
      currentAction: null,
      startTime: null,
      databaseSize: null
    });

    if (window.showToast) {
      window.showToast('Backup cancelled', 'info');
    }
  };

  // Restore backup
  const restoreBackup = async (filename) => {
    setGlobalBackupState(prev => ({
      ...prev,
      isRunning: true,
      currentAction: 'restore',
      canCancel: false
    }));

    try {
      const response = await fetch('http://localhost/prms/prms-backend/api/backup_restore.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=restore&file=${encodeURIComponent(filename)}`
      });
      const data = await response.json();

      if (data.status === 'success') {
        await fetchBackupFiles();
        if (window.showToast) {
          window.showToast('Database restored successfully', 'success');
        }
      } else {
        if (window.showToast) {
          window.showToast(data.message, 'error');
        }
      }
    } catch (error) {
      if (window.showToast) {
        window.showToast('Failed to restore database', 'error');
      }
    } finally {
      setGlobalBackupState(prev => ({
        ...prev,
        isRunning: false,
        currentAction: null
      }));
    }
  };

  // Delete backup
  const deleteBackup = async (filename) => {
    console.log('deleteBackup function called with filename:', filename);
    setGlobalBackupState(prev => ({
      ...prev,
      isRunning: true,
      currentAction: 'delete',
      canCancel: false
    }));

    try {
      console.log('Making API call to delete backup:', filename);
      const response = await fetch('http://localhost/prms/prms-backend/api/backup_restore.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=delete&file=${encodeURIComponent(filename)}`
      });
      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      console.log('Response status field:', data.status);
      console.log('Response message:', data.message);

      if (data.status === 'success') {
        console.log('Delete successful, refreshing backup files list');
        await fetchBackupFiles();
        if (window.showToast) {
          window.showToast('Backup file deleted successfully', 'success');
        }
      } else {
        console.log('Delete failed:', data.message);
        if (window.showToast) {
          window.showToast(data.message, 'error');
        }
      }
    } catch (error) {
      console.log('Delete error:', error);
      if (window.showToast) {
        window.showToast('Failed to delete backup file', 'error');
      }
    } finally {
      setGlobalBackupState(prev => ({
        ...prev,
        isRunning: false,
        currentAction: null
      }));
    }
  };

  // Download backup
  const downloadBackup = (filename) => {
    window.open(`http://localhost/prms/prms-backend/api/backup_restore.php?action=download&file=${encodeURIComponent(filename)}`, '_blank');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [progressInterval]);

  const value = {
    globalBackupState,
    backupFiles,
    fetchBackupFiles,
    startBackup,
    cancelBackup,
    restoreBackup,
    deleteBackup,
    downloadBackup,
    getDatabaseSize
  };

  return (
    <BackupContext.Provider value={value}>
      {children}
    </BackupContext.Provider>
  );
};
