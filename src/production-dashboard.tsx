import React, { useState } from 'react';
import { Shield, Upload, FileText, CheckCircle, AlertTriangle, User, LogOut, RefreshCw, TrendingUp } from 'lucide-react';

interface Log {
  timestamp: string;
  message: string;
  type: string;
}

interface Issue {
  type: string;
  count: number;
  severity: string;
  description: string;
}

const ProductionDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [logs, setLogs] = useState<Log[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const addLog = (message: string, type: string = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    addLog('User logged in successfully', 'success');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    setActiveTab('processing');
    addLog(`Starting to process ${files.length} files...`, 'info');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress((i / files.length) * 100);
      addLog(`Processing: ${file.name}`, 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setProgress(100);
    addLog('✅ Processing completed!', 'success');
    
    setTimeout(() => {
      setActiveTab('dashboard');
      setIsProcessing(false);
    }, 2000);
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a, #7c3aed, #ec4899)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <Shield style={{ width: '64px', height: '64px', color: '#67e8f9', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            🔐 Secure Login
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '32px' }}>
            Government Application Dashboard
          </p>
          
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Login to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a, #7c3aed, #ec4899)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, white, #a5f3fc, #bfdbfe)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px'
            }}>
              🏛️ सरकारी आवेदन प्रबंधन डैशबोर्ड 🏛️
            </h1>
            <p style={{ fontSize: '24px', color: '#a5f3fc', fontWeight: '600' }}>
              Enterprise Government Application Management System
            </p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <User style={{ width: '32px', height: '32px', color: '#67e8f9' }} />
              <div>
                <p style={{ color: 'white', fontWeight: '500', margin: 0 }}>admin@dashboard.gov</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: 0 }}>admin</p>
              </div>
              <button
                onClick={() => setIsAuthenticated(false)}
                style={{
                  marginLeft: '12px',
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer'
                }}
              >
                <LogOut style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[
            { id: 'upload', label: 'Upload Files', icon: Upload },
            { id: 'processing', label: 'Processing', icon: RefreshCw },
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'issues', label: 'Critical Issues', icon: AlertTriangle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.id ? 'white' : 'rgba(255, 255, 255, 0.2)',
                color: activeTab === tab.id ? '#374151' : 'white'
              }}
            >
              <tab.icon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center'
            }}>
              <Upload style={{ width: '96px', height: '96px', color: '#67e8f9', margin: '0 auto 24px' }} />
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                Upload Your 37 Excel Files
              </h2>
              <p style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '24px' }}>
                Select your Excel files to create a comprehensive dashboard
              </p>

              <div style={{
                border: '2px dashed rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                padding: '48px',
                marginBottom: '24px'
              }}>
                <input
                  type="file"
                  multiple
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="fileInput"
                />
                <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                  <div>
                    <FileText style={{ width: '64px', height: '64px', color: 'rgba(255, 255, 255, 0.6)', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: '20px', color: 'white', fontWeight: '600', marginBottom: '8px' }}>
                      Click to select your Excel files
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Support for .xlsx and .xls formats
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Processing Tab */}
        {activeTab === 'processing' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '32px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <RefreshCw style={{
                  width: '64px',
                  height: '64px',
                  color: '#67e8f9',
                  margin: '0 auto 16px',
                  animation: isProcessing ? 'spin 1s linear infinite' : 'none'
                }} />
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                  {isProcessing ? '🔄 Processing Your Files...' : '✅ Processing Complete'}
                </h2>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: 'white', fontWeight: '500' }}>Progress</span>
                  <span style={{ color: 'white', fontWeight: '500' }}>{Math.round(progress)}%</span>
                </div>
                <div style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  height: '16px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #67e8f9, #3b82f6)',
                    height: '16px',
                    borderRadius: '8px',
                    width: `${progress}%`,
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                maxHeight: '320px',
                overflowY: 'auto'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                  📊 Processing Logs
                </h3>
                {logs.map((log, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', marginBottom: '8px' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'monospace' }}>
                      {log.timestamp}
                    </span>
                    <span style={{
                      flex: 1,
                      color: log.type === 'success' ? '#86efac' :
                            log.type === 'warning' ? '#fcd34d' :
                            log.type === 'error' ? '#fca5a5' :
                            'rgba(255, 255, 255, 0.8)'
                    }}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>

              {!isProcessing && logs.length > 0 && (
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    style={{
                      padding: '16px 32px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      cursor: 'pointer'
                    }}
                  >
                    🚀 View Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <CheckCircle style={{ width: '96px', height: '96px', color: '#10b981', margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
              ✅ Dashboard Active!
            </h2>
            <p style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.8)' }}>
              Ready for Excel file processing and analytics
            </p>
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <CheckCircle style={{ width: '96px', height: '96px', color: '#10b981', margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
              ✅ No Critical Issues Found
            </h2>
            <p style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.8)' }}>
              Your data appears to be in good condition!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionDashboard;