import React, { useState } from 'react';
import { Building, AlertTriangle, CheckCircle, Upload, BarChart, Activity, Shield, Settings, LogOut, Eye, EyeOff, RefreshCw, TrendingUp, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { uploadExcelFiles } from './api';

const TABS = [
  { id: 'upload', label: 'Upload Files', icon: Upload },
  { id: 'processing', label: 'Processing', icon: RefreshCw },
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'analytics', label: 'Advanced Analytics', icon: BarChart },
  { id: 'issues', label: 'Issues', icon: AlertTriangle },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'audit', label: 'Audit', icon: Shield },
  { id: 'cms', label: 'CMS', icon: Settings },
];

const DEMO_EMAIL = 'admin@gov.in';
const DEMO_PASSWORD = 'admin123';

const dummyPieData = [
  { name: 'Approved', value: 400, color: '#22c55e' },
  { name: 'Pending', value: 300, color: '#facc15' },
  { name: 'Rejected', value: 200, color: '#ef4444' },
];

const TabButton = ({ id, label, icon: Icon, badge, active, disabled, onClick }: any) => (
  <button
    onClick={() => !disabled && onClick(id)}
    disabled={disabled}
    className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
      active
        ? 'bg-white text-gray-800 shadow-lg'
        : disabled
        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
        : 'bg-white/20 text-white hover:bg-white/30'
    }`}
  >
    <Icon className="w-5 h-5 mr-2" />
    {label}
    {badge !== undefined && badge > 0 && (
      <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">{badge}</span>
    )}
  </button>
);

const ProductionDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<'viewer' | 'editor' | 'admin'>('admin');
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [criticalIssues, setCriticalIssues] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      loginForm.email.trim().toLowerCase() === DEMO_EMAIL &&
      loginForm.password === DEMO_PASSWORD
    ) {
      setIsAuthenticated(true);
      setLoginError('');
      setUserRole('admin');
    } else {
      setLoginError('Invalid credentials. Please use the demo credentials below.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ email: '', password: '' });
    setActiveTab('dashboard');
    setUserRole('viewer');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadMessage(null);
    try {
      const result = await uploadExcelFiles(files);
      if (result.success) {
        setUploadMessage('✅ Files uploaded and processed successfully!');
        setActiveTab('dashboard');
      } else {
        setUploadMessage(`❌ Upload failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      setUploadMessage(`❌ Upload error: ${error?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="backdrop-blur-md bg-white/20 border border-white/20 rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Government Dashboard Login</h1>
            <p className="text-white/80">Sign in to access the enterprise dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-white/60"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {loginError && <div className="text-red-400 text-sm text-center">{loginError}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>
          <div className="mt-4 p-3 bg-blue-900/30 rounded-lg text-center">
            <p className="text-blue-200 text-xs">Demo Credentials:</p>
            <p className="text-blue-100 text-xs">Email: <span className="font-mono">{DEMO_EMAIL}</span></p>
            <p className="text-blue-100 text-xs">Password: <span className="font-mono">{DEMO_PASSWORD}</span></p>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center mb-2">
          <Building className="w-10 h-10 text-cyan-200 mr-2" />
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
            Government Dashboard
          </h1>
          <Building className="w-10 h-10 text-cyan-200 ml-2" />
        </div>
        <p className="text-2xl text-cyan-200 font-semibold mb-4">Enterprise Application Management</p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleLogout}
            className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            title={showSensitiveData ? 'Hide sensitive data' : 'Show sensitive data'}
          >
            {showSensitiveData ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
          </button>
          <div className="text-right">
            <p className="text-white text-sm">{DEMO_EMAIL}</p>
            <p className="text-white/60 text-xs capitalize">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {TABS.map(tab => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            badge={tab.id === 'issues' ? criticalIssues.length : undefined}
            active={activeTab === tab.id}
            disabled={tab.id === 'upload' && userRole === 'viewer'}
            onClick={setActiveTab}
          />
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'dashboard' && (
          <div className="bg-white/20 rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-cyan-200 mb-6">Status Overview</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <ResponsiveContainer width={300} height={300}>
                <PieChart>
                  <Pie
                    data={dummyPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {dummyPieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-300"><CheckCircle /> Approved: 400</div>
                <div className="flex items-center gap-2 text-yellow-300"><AlertTriangle /> Pending: 300</div>
                <div className="flex items-center gap-2 text-red-400"><AlertTriangle /> Rejected: 200</div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'upload' && (
          <div className="bg-white/20 rounded-2xl shadow-xl p-8 text-center">
            <Upload className="w-24 h-24 text-cyan-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Upload Your Excel Files</h2>
            <p className="text-white/80 mb-6">Select up to 37 Excel files (max 10MB each) for real Excel processing and validation</p>
            <input
              type="file"
              multiple
              accept=".xlsx,.xls"
              className="hidden"
              id="fileInput"
              disabled={userRole === 'viewer' || uploading}
              onChange={handleFileUpload}
            />
            <label htmlFor="fileInput" className={`cursor-pointer ${userRole === 'viewer' || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="border-2 border-dashed border-white/30 rounded-xl p-12 mb-6 hover:border-white/50 transition-colors">
                <FileText className="w-16 h-16 text-white/60 mx-auto mb-4" />
                <p className="text-xl text-white font-semibold mb-2">
                  {userRole === 'viewer' ? 'View Only Access' : uploading ? 'Uploading...' : 'Click to select Excel files'}
                </p>
                <p className="text-white/60">
                  Real processing: applicationdetails.xlsx, applicationaction.xlsx, basedepartment.xlsx, district.xlsx, etc.
                </p>
              </div>
            </label>
            {uploading && <div className="text-cyan-200 font-semibold mb-2">Uploading and processing files...</div>}
            {uploadMessage && <div className="text-lg font-bold mb-2 text-white">{uploadMessage}</div>}
          </div>
        )}
        {activeTab === 'processing' && (
          <div className="bg-white/20 rounded-2xl shadow-xl p-8 text-center">
            <RefreshCw className="w-16 h-16 text-cyan-300 mx-auto mb-4 animate-spin" />
            <h2 className="text-3xl font-bold text-white mb-2">Processing Files...</h2>
            <p className="text-white/80 mb-4">Your files are being processed. Please wait.</p>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="bg-white/20 rounded-2xl shadow-xl p-8 text-center">
            <BarChart className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-cyan-200 mb-4">📊 Advanced Analytics & Insights</h2>
            <p className="text-cyan-100">Advanced analytics will be available after data upload.</p>
          </div>
        )}
        {activeTab === 'issues' && (
          <div className="bg-white/20 rounded-2xl shadow-xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-cyan-200 mb-4">Critical Issues</h2>
            <p className="text-white/80 mb-4">No issues detected. All systems normal.</p>
          </div>
        )}
        {activeTab === 'monitoring' && (
          <div className="bg-white/20 rounded-2xl shadow-xl p-8 text-center">
            <Activity className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">📈 System Monitoring</h2>
            <p className="text-green-100">All systems operational. Monitoring dashboard coming soon.</p>
          </div>
        )}
        {activeTab === 'audit' && (
          <div className="bg-white/20 rounded-2xl shadow-xl p-8 text-center">
            <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-cyan-200 mb-4">Audit Trail</h2>
            <p className="text-white/80 mb-4">Audit logs will appear here.</p>
          </div>
        )}
        {activeTab === 'cms' && (
          <div className="bg-white/20 rounded-2xl shadow-xl p-8 text-center">
            <Settings className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-cyan-200 mb-4">CMS Editor</h2>
            <p className="text-white/80 mb-4">Content Management System coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionDashboard;
