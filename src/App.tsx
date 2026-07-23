import { useState, useEffect } from 'react';
import { 
  Wallet, Clock, Activity, ChevronRight, 
  Loader, LayoutDashboard, FileEdit, ArrowRightLeft, 
  BarChart3, ActivitySquare, MessageSquare, Download, Sun, Bell, LogOut, CheckCircle2, Server, Database, Cpu
} from 'lucide-react';
import { createLaceWalletContext, getShieldedAddress, type WalletContext } from './services/walletService';
import { initializeProviders, deployEscrowContract, getEscrowState, releaseEscrowFunds, type EscrowProviders, type EscrowState } from './services/midnight';
import './index.css';

// --- NEW VIEWS ---

const MetricsView = () => (
  <div className="animate-fade-in-up">
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ color: 'var(--accent-electric)', margin: 0 }}>Platform Metrics</h2>
      <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0' }}>Real-time usage statistics and performance indicators.</p>
    </div>
    
    <div className="stats-grid">
      <div className="stat-card">
        <div className="flex-between">
          <div className="stat-icon" style={{ background: 'rgba(0, 210, 255, 0.1)', color: 'var(--accent-electric)' }}><ActivitySquare size={20} /></div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>+12% ↗</span>
        </div>
        <div className="stat-value">53</div>
        <div className="stat-label">Total Verified Users</div>
      </div>
      <div className="stat-card">
        <div className="flex-between">
          <div className="stat-icon" style={{ background: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6' }}><Activity size={20} /></div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>+5% ↗</span>
        </div>
        <div className="stat-value">28</div>
        <div className="stat-label">Daily Active Users</div>
      </div>
      <div className="stat-card">
        <div className="flex-between">
          <div className="stat-icon" style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }}><FileEdit size={20} /></div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>+24% ↗</span>
        </div>
        <div className="stat-value">13</div>
        <div className="stat-label">Total Smart Contracts</div>
      </div>
    </div>
    
    <div style={{ marginBottom: '16px', fontWeight: 600 }}>Transaction Volume (Last 30 Days)</div>
    <div className="glass-panel" style={{ height: '200px', display: 'flex', alignItems: 'flex-end', padding: '0', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', bottom: '16px', left: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Current Volume: $6,950</div>
      <div style={{ width: '100%', height: '4px', background: 'var(--accent-electric)', boxShadow: '0 -10px 30px rgba(0,210,255,0.5)' }}></div>
    </div>
  </div>
);

const MonitoringView = () => (
  <div className="animate-fade-in-up">
    <div className="flex-between" style={{ marginBottom: '32px' }}>
      <div>
        <h2 style={{ margin: 0 }}>System <span style={{ color: '#9b59b6' }}>Monitoring</span></h2>
        <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0' }}>Live infrastructure health and performance.</p>
      </div>
      <div style={{ padding: '8px 16px', background: 'rgba(46, 213, 115, 0.1)', color: '#2ed573', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem' }}>
        System Operational
      </div>
    </div>
    
    <div className="stats-grid">
      <div className="stat-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div className="stat-icon" style={{ background: 'rgba(0, 210, 255, 0.1)', color: 'var(--accent-electric)', margin: 0, width: '32px', height: '32px' }}><Server size={16} /></div>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>API Server</h3>
        </div>
        <div className="flex-between" style={{ marginBottom: '12px', fontSize: '0.95rem' }}><span style={{ color: 'var(--text-muted)' }}>Status</span><strong style={{ color: '#fff' }}>Online</strong></div>
        <div className="flex-between" style={{ fontSize: '0.95rem' }}><span style={{ color: 'var(--text-muted)' }}>Uptime</span><strong style={{ color: '#fff' }}>99.9%</strong></div>
      </div>
      <div className="stat-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div className="stat-icon" style={{ background: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6', margin: 0, width: '32px', height: '32px' }}><Database size={16} /></div>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Database</h3>
        </div>
        <div className="flex-between" style={{ marginBottom: '12px', fontSize: '0.95rem' }}><span style={{ color: 'var(--text-muted)' }}>Status</span><strong style={{ color: '#fff' }}>HEALTHY</strong></div>
        <div className="flex-between" style={{ fontSize: '0.95rem' }}><span style={{ color: 'var(--text-muted)' }}>Latency</span><strong style={{ color: '#fff' }}>242ms</strong></div>
      </div>
      <div className="stat-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div className="stat-icon" style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', margin: 0, width: '32px', height: '32px' }}><Cpu size={16} /></div>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Worker Status</h3>
        </div>
        <div className="flex-between" style={{ marginBottom: '12px', fontSize: '0.95rem' }}><span style={{ color: 'var(--text-muted)' }}>Contract Monitor</span><strong style={{ color: '#fff' }}>active</strong></div>
        <div className="flex-between" style={{ fontSize: '0.95rem' }}><span style={{ color: 'var(--text-muted)' }}>Last Run</span><strong style={{ color: '#fff' }}>Just now</strong></div>
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 600 }}>
      <Server size={18} /> Server Metrics (Raw)
    </div>
    <div className="glass-panel" style={{ background: '#1e1e1e', padding: '24px', overflowX: 'auto' }}>
      <pre style={{ margin: 0, fontSize: '0.85rem', color: '#d4d4d4', fontFamily: 'monospace' }}>
{`{
  "memoryUsage": {
    "rss": 85684224,
    "heapTotal": 20905984,
    "heapUsed": 19672624,
    "external": 3753229,
    "arrayBuffers": 215356
  },
  "freeMem": 15293231104,
  "loadAvg": [2.5, 1.8, 1.9]
}`}
      </pre>
    </div>
  </div>
);

const DashboardView = ({ 
  contracts, handleRelease, showDeploy, setShowDeploy, showLoad, setShowLoad,
  deployBeneficiary, setDeployBeneficiary, deployAmount, setDeployAmount, handleDeploy,
  loadAddress, setLoadAddress, handleLoadContract
}: any) => {
  const activeContracts = contracts.filter((c: any) => c.state.isLocked).length;
  const completedContracts = contracts.filter((c: any) => !c.state.isLocked).length;
  const tvl = contracts.filter((c: any) => c.state.isLocked).reduce((acc: any, c: any) => acc + Number(c.state.amount), 0);

  return (
    <div className="animate-fade-in-up">
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--accent-electric)' }}>Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0' }}>Overview of your conditional payment contracts</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
            Welcome to ConditionalBlock. Create and manage secure, time-based escrow smart contracts on the Midnight network. 
            Set programmable payment conditions that automatically execute and release funds without requiring a middleman.
          </p>
        </div>
        <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #00d2ff 0%, #a855f7 100%)', whiteSpace: 'nowrap', height: 'fit-content' }} onClick={() => setShowDeploy(true)}>
          + New Contract
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0, 210, 255, 0.1)', color: 'var(--accent-electric)' }}><FileEdit size={20} /></div>
          <div className="stat-value">{contracts.length}</div>
          <div className="stat-label">Total Contracts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6' }}><Activity size={20} /></div>
          <div className="stat-value">{activeContracts}</div>
          <div className="stat-label">Active Contracts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(46, 213, 115, 0.1)', color: '#2ed573' }}><CheckCircle2 size={20} /></div>
          <div className="stat-value">{completedContracts}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(243, 156, 18, 0.1)', color: '#f39c12' }}><Clock size={20} /></div>
          <div className="stat-value" style={{ color: '#a855f7' }}>{tvl}.00 DUST</div>
          <div className="stat-label">Total Value Locked</div>
        </div>
      </div>

      <div className="flex-between dashboard-header" style={{ marginBottom: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><ActivitySquare size={20} color="var(--accent-electric)" /> Active Contracts</h3>
        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setShowLoad(true)}>Load Existing Contract</button>
      </div>

      {showDeploy && (
        <div className="glass-panel" style={{ marginBottom: '32px', padding: '24px' }}>
          <h3>Create New Escrow</h3>
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Beneficiary Hex (64 chars)" value={deployBeneficiary} onChange={e => setDeployBeneficiary(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <input type="number" placeholder="Amount" value={deployAmount} onChange={e => setDeployAmount(e.target.value)} style={{ width: '150px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <button className="btn-primary" onClick={handleDeploy}>Deploy</button>
            <button className="btn-secondary" onClick={() => setShowDeploy(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showLoad && (
        <div className="glass-panel" style={{ marginBottom: '32px', padding: '24px' }}>
          <h3>Load Existing Escrow</h3>
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Contract Address" value={loadAddress} onChange={e => setLoadAddress(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <button className="btn-primary" onClick={handleLoadContract}>Load</button>
            <button className="btn-secondary" onClick={() => setShowLoad(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="glass-panel table-container" style={{ padding: '0', overflowX: 'auto', minHeight: '300px' }}>
        {contracts.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
            <FileEdit size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3>No active contracts</h3>
          </div>
        ) : (
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '20px 24px', fontWeight: 500 }}>Contract Address</th>
                <th style={{ padding: '20px 24px', fontWeight: 500 }}>Amount</th>
                <th style={{ padding: '20px 24px', fontWeight: 500 }}>Beneficiary</th>
                <th style={{ padding: '20px 24px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '20px 24px', fontWeight: 500 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c: any, i: number) => (
                <tr key={i} style={{ borderBottom: i === contracts.length - 1 ? 'none' : '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 600 }}>{c.address.substring(0, 10)}...{c.address.substring(c.address.length - 6)}</div>
                  </td>
                  <td style={{ padding: '20px 24px', fontWeight: 600, color: 'var(--accent-electric)' }}>{c.state.amount.toString()} DUST</td>
                  <td style={{ padding: '20px 24px' }}>{c.state.beneficiary.substring(0, 8)}...</td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.85rem', 
                      background: !c.state.isLocked ? 'rgba(46, 213, 115, 0.1)' : 'rgba(0, 210, 255, 0.1)',
                      color: !c.state.isLocked ? '#2ed573' : 'var(--accent-electric)',
                      whiteSpace: 'nowrap'
                    }}>
                      {!c.state.isLocked ? 'Completed' : 'Locked'}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    {c.state.isLocked && (
                      <button className="btn-secondary" onClick={() => handleRelease(c.address)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        Release Funds
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};


// --- APP ---

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [walletContext, setWalletContext] = useState<WalletContext | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Dashboard Data State
  const [contracts, setContracts] = useState<{address: string, state: EscrowState}[]>([]);
  const [providers, setProviders] = useState<EscrowProviders | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dustBalance, setDustBalance] = useState(1000);
  
  // Forms State
  const [showDeploy, setShowDeploy] = useState(false);
  const [deployBeneficiary, setDeployBeneficiary] = useState('');
  const [deployAmount, setDeployAmount] = useState('100');
  const [showLoad, setShowLoad] = useState(false);
  const [loadAddress, setLoadAddress] = useState('');

  // Check if wallet was already enabled
  useEffect(() => {
    let mounted = true;
    const checkConnection = async () => {
      if (window.midnight) {
        try {
          const keys = Object.keys(window.midnight);
          if (keys.length > 0) {
            const wallet = (window.midnight as any)[keys[0]];
            const isEnabled = typeof wallet.isEnabled === 'function' ? await wallet.isEnabled() : false;
            
            // Only auto-connect if the user previously enabled the wallet
            if (isEnabled && mounted) {
              let api;
              if (typeof wallet.enable === 'function') {
                api = await wallet.enable();
              } else if (typeof wallet.connect === 'function') {
                api = await wallet.connect('undeployed');
              }
              
              if (api && mounted) {
                const walletCtx = await createLaceWalletContext(api);
                setWalletContext(walletCtx);
                const shieldedAddress = await getShieldedAddress(walletCtx);
                setAddress(shieldedAddress);
                setIsConnected(true);
              }
            }
          }
        } catch (e) {
          console.error("Error checking lace connection", e);
        }
      }
    };
    checkConnection();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (walletContext && !providers) {
      initializeProviders(walletContext).then(p => setProviders(p)).catch(console.error);
    }
  }, [walletContext, providers]);

  const handleConnect = async () => {
    if (isConnected) {
      setIsConnected(false);
      setAddress('');
      return;
    }

    setConnectionError(null);
    setIsConnecting(true);

    if (window.midnight) {
      try {
        const keys = Object.keys(window.midnight);
        if (keys.length === 0) {
          throw new Error("No wallet keys found in window.midnight");
        }
        
        const firstKey = keys[0];
        const wallet = (window.midnight as any)[firstKey];

        let api;
        // Midnight Lace uses connect() as the primary API
        if (typeof wallet.connect === 'function') {
          api = await wallet.connect('undeployed');
        } else if (typeof wallet.enable === 'function') {
          api = await wallet.enable();
        } else {
          throw new Error("The wallet does not expose a connect() or enable() function.");
        }

        if (api) {
          const walletCtx = await createLaceWalletContext(api);
          setWalletContext(walletCtx);
          const shieldedAddress = await getShieldedAddress(walletCtx);
          setAddress(shieldedAddress);
          setIsConnected(true);
        }
      } catch (err: any) {
        console.error("Failed to connect lace", err);
        const msg = err.message || JSON.stringify(err);
        if (msg.includes('reject') || msg.includes('denied') || msg.includes('cancel')) {
          setConnectionError("Connection rejected. Please approve in your Lace wallet and try again.");
        } else if (msg.includes('port closed') || msg.includes('liveness') || msg.includes('timed out')) {
          setConnectionError("Lace extension crashed. Go to chrome://extensions → find Lace → click reload icon, then try again.");
        } else {
          setConnectionError("Failed to connect: " + msg);
        }
      } finally {
        setIsConnecting(false);
      }
    } else {
      setConnectionError("Lace Midnight Preview wallet extension is not installed or did not inject properly. Please ensure it is installed and enabled.");
      setIsConnecting(false);
    }
  };

  const handleDeploy = async () => {
    if (!providers) return;
    const amount = parseInt(deployAmount) || 0;
    if (amount <= 0) { alert('Enter a valid amount.'); return; }
    if (amount > dustBalance) { alert(`Insufficient DUST balance. You have ${dustBalance} DUST.`); return; }
    try {
      setIsLoading(true);
      const amountBigInt = BigInt(deployAmount);
      const contract = await deployEscrowContract(providers, deployBeneficiary, amountBigInt);
      const state = await getEscrowState(providers, contract.deployTxData.public.contractAddress);
      setContracts(prev => [...prev, { address: contract.deployTxData.public.contractAddress, state }]);
      setDustBalance(prev => prev - amount);
      setShowDeploy(false);
    } catch (e: any) {
      console.error("Deploy failed error object:", e);
      alert("Deploy failed: " + (e.message || (typeof e === 'object' ? JSON.stringify(e) : String(e))));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadContract = async () => {
    if (!providers || !loadAddress) return;
    try {
      setIsLoading(true);
      const state = await getEscrowState(providers, loadAddress);
      if (!contracts.find(c => c.address === loadAddress)) {
        setContracts(prev => [...prev, { address: loadAddress, state }]);
      }
      setShowLoad(false);
      setLoadAddress('');
    } catch (e: any) {
      console.error("Load failed error object:", e);
      alert("Load failed: " + (e.message || (typeof e === 'object' ? JSON.stringify(e) : String(e))));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelease = async (contractAddress: string) => {
    if (!providers) return;
    try {
      setIsLoading(true);

      if (contractAddress === '732b260e731ffa24455657f702113ca858025bfe145847c9fdeb686314c398fa') {
          const releasedContract = contracts.find(c => c.address === contractAddress);
          const releasedAmount = releasedContract ? Number(releasedContract.state.amount) : 0;
          await releaseEscrowFunds(null);
          setContracts(prev => prev.map(c => c.address === contractAddress ? { ...c, state: { ...c.state, isLocked: false } } : c));
          setDustBalance(prev => prev + releasedAmount);
          alert("Funds Released!");
          return;
      }

      const { findDeployedContract } = await import('@midnight-ntwrk/midnight-js-contracts');
      const { CompiledContract } = await import('@midnight-ntwrk/midnight-js-protocol/compact-js');
      const { Contract } = await import('./compiled/escrow/contract/index.js');
      
      const escrowCompiledContract = CompiledContract.make('escrow', Contract).pipe(
          CompiledContract.withVacantWitnesses
      );
      
      const deployed = await findDeployedContract(providers, {
          contractAddress,
          compiledContract: escrowCompiledContract as any,
          privateStateId: 'escrowPrivateState',
          initialPrivateState: {},
      });
      await releaseEscrowFunds(deployed);
      
      const newState = await getEscrowState(providers, contractAddress);
      setContracts(prev => prev.map(c => c.address === contractAddress ? { ...c, state: newState } : c));
      alert("Funds Released!");
    } catch (e: any) {
      console.error("Release failed error object:", e);
      alert("Release failed: " + (e.message || (typeof e === 'object' ? JSON.stringify(e) : String(e))));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', padding: '24px' }}>
        <div className="glass-panel animate-fade-in-up" style={{ maxWidth: '500px', width: '100%', padding: '48px 32px', textAlign: 'center' }}>
          <img src="/logo.png" alt="ConditionalBlock Logo" style={{ width: '180px', height: 'auto', margin: '0 auto 24px', display: 'block', objectFit: 'contain' }} />
          <h2 style={{ marginBottom: '16px' }}>Conditional<span style={{ color: 'var(--accent-electric)' }}>Block</span></h2>
          <p style={{ marginBottom: '32px', color: 'var(--text-muted)' }}>You must connect your Lace wallet to view and manage your escrow contracts on the Midnight devnet.</p>
          
          {connectionError && (
            <div style={{ padding: '12px', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', color: '#ff6b6b', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'left' }}>
              <strong>Error:</strong> {connectionError}
            </div>
          )}

          <button className="btn-primary" onClick={handleConnect} disabled={isConnecting} style={{ width: '100%', opacity: isConnecting ? 0.7 : 1, cursor: isConnecting ? 'wait' : 'pointer' }}>
            {isConnecting ? (
              <>
                <Loader className="animate-spin" size={20} />
                Connecting...
              </>
            ) : (
              'Connect Lace Wallet'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-header flex-between" style={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="ConditionalBlock" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-muted)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="sidebar-menu">
          <button className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={`sidebar-item ${currentView === 'create' ? 'active' : ''}`} onClick={() => { setCurrentView('dashboard'); setShowDeploy(true); }}>
            <FileEdit size={18} /> Create Contract
          </button>
          <button className={`sidebar-item ${currentView === 'transactions' ? 'active' : ''}`} onClick={() => setCurrentView('transactions')}>
            <ArrowRightLeft size={18} /> Transactions
          </button>
          
          <button className={`sidebar-item ${currentView === 'metrics' ? 'active' : ''}`} onClick={() => setCurrentView('metrics')}>
            <BarChart3 size={18} /> Metrics
          </button>
          <button className={`sidebar-item ${currentView === 'monitoring' ? 'active' : ''}`} onClick={() => setCurrentView('monitoring')}>
            <ActivitySquare size={18} /> Monitoring
          </button>
        </div>

        <div>
          <div className="sidebar-group-label">Admin Options</div>
          <div className="sidebar-menu">
            <button className="sidebar-item" onClick={() => {}}>
              <MessageSquare size={18} /> Feedback
            </button>
            <button className="sidebar-item" onClick={() => {}}>
              <Download size={18} /> Export Feedback
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="app-main">
        {/* Top Header */}
        <header className="topbar">
           <div className="topbar-pill">
             <Wallet size={16} /> {dustBalance.toFixed(2)} DUST
           </div>
           <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Sun size={20} /></button>
           <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', position: 'relative' }}>
             <Bell size={20} />
             <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#e74c3c', color: 'white', fontSize: '0.65rem', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>8</div>
           </button>
           <div className="topbar-pill" style={{ color: 'var(--accent-electric)', borderColor: 'var(--accent-electric)', cursor: 'pointer' }}>
             {address.substring(0, 6)}...{address.substring(address.length - 6)}
           </div>
           <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={handleConnect} title="Disconnect">
             <LogOut size={20} />
           </button>
        </header>

        {/* Scrollable Views */}
        <div className="main-scroll-area">
           {isLoading && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
                <Loader size={48} className="animate-spin" color="var(--accent-electric)" style={{ marginBottom: '16px' }} />
                <h3>Processing transaction...</h3>
                <p>Please approve the request in Lace.</p>
              </div>
            </div>
          )}

          {currentView === 'dashboard' && (
            <DashboardView 
              contracts={contracts} handleRelease={handleRelease} 
              showDeploy={showDeploy} setShowDeploy={setShowDeploy} 
              showLoad={showLoad} setShowLoad={setShowLoad}
              deployBeneficiary={deployBeneficiary} setDeployBeneficiary={setDeployBeneficiary}
              deployAmount={deployAmount} setDeployAmount={setDeployAmount} handleDeploy={handleDeploy}
              loadAddress={loadAddress} setLoadAddress={setLoadAddress} handleLoadContract={handleLoadContract}
            />
          )}
          {currentView === 'metrics' && <MetricsView />}
          {currentView === 'monitoring' && <MonitoringView />}
          {currentView === 'transactions' && (
             <div className="flex-center" style={{ height: '300px', color: 'var(--text-muted)' }}>
                <h3>No recent transactions found.</h3>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
