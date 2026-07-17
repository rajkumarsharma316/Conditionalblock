import { useState, useEffect } from 'react';
import { Wallet, ShieldAlert, Clock, Code, Activity, ShieldCheck, ChevronRight, Menu, X, Loader } from 'lucide-react';
import { createLaceWalletContext, getShieldedAddress, type WalletContext } from './services/walletService';
import { initializeProviders, deployEscrowContract, getEscrowState, releaseEscrowFunds, type EscrowProviders, type EscrowState } from './services/midnight';
import './index.css';

// --- COMPONENTS ---

const Header = ({ onConnect, isConnected, onNavigate, address }: { onConnect: () => void, isConnected: boolean, onNavigate: (page: string) => void, address: string }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header style={{ padding: '20px 0', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-glass)', background: 'rgba(10, 14, 23, 0.8)' }}>
      <div className="container flex-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => onNavigate('home')}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-electric)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert color="#0a0e17" size={24} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>Asset<span style={{ color: 'var(--accent-electric)' }}>Block</span></h2>
        </div>
        
        {/* Desktop Nav */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1rem' }} onClick={() => onNavigate('home')}>Home</button>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1rem' }} onClick={() => onNavigate('dashboard')}>Dashboard</button>
          <button 
            className={isConnected ? "btn-secondary" : "btn-primary"} 
            onClick={onConnect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Wallet size={18} />
            {isConnected 
              ? (isHovered ? 'Disconnect' : `${address.substring(0, 6)}...${address.substring(address.length - 4)}`) 
              : 'Connect Lace'}
          </button>
        </nav>

        {/* Mobile Nav Toggle */}
        <button className="mobile-nav-toggle" onClick={toggleMenu} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'none' }}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-darker)', padding: '24px', borderBottom: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1.1rem', textAlign: 'left' }} onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}>Home</button>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1.1rem', textAlign: 'left' }} onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}>Dashboard</button>
          <button 
            className={isConnected ? "btn-secondary" : "btn-primary"} 
            onClick={() => { onConnect(); setMobileMenuOpen(false); }}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Wallet size={18} />
            {isConnected ? 'Disconnect' : 'Connect Lace'}
          </button>
        </div>
      )}
    </header>
  );
}

const Hero = ({ onLaunch }: { onLaunch: () => void }) => (
  <section style={{ padding: '100px 0', textAlign: 'center', position: 'relative' }}>
    <div className="bg-glow-top"></div>
    <div className="container animate-fade-in-up">
      <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: 'rgba(0, 210, 255, 0.1)', border: '1px solid rgba(0, 210, 255, 0.2)', color: 'var(--accent-electric)', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 600 }}>
        Powered by Midnight Blockchain
      </div>
      <h1 className="hero-title" style={{ maxWidth: '800px', margin: '0 auto 24px', lineHeight: 1.1 }}>
        Programmable Escrow, <br/>
        <span className="text-gradient">Secured by Conditions.</span>
      </h1>
      <p style={{ maxWidth: '600px', margin: '0 auto 40px', fontSize: '1.1rem' }}>
        Create, manage, and execute decentralized escrow contracts. Set time-locks, multi-sig approvals, or external data oracles to release your funds.
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={onLaunch} style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
          Launch App <ChevronRight size={20} />
        </button>
        <button className="btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
          View Documentation
        </button>
      </div>
    </div>
  </section>
);

const Features = () => {
  const features = [
    { icon: <Clock size={32} color="var(--accent-electric)" />, title: 'Time-Locked Escrow', desc: 'Funds are securely locked until a predefined timestamp is reached on the Midnight chain.' },
    { icon: <ShieldCheck size={32} color="var(--accent-electric)" />, title: 'Multi-Sig Approvals', desc: 'Require multiple parties to sign off before any assets can be moved or released.' },
    { icon: <Activity size={32} color="var(--accent-electric)" />, title: 'Oracle Integration', desc: 'Trigger fund releases based on real-world data feeds via decentralized oracles.' },
    { icon: <Code size={32} color="var(--accent-electric)" />, title: 'Zero-Knowledge Privacy', desc: 'Leverage Midnight\'s ZK tech to keep your contract conditions completely private.' },
  ];

  return (
    <section style={{ padding: '60px 0', position: 'relative' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2>Unlocking the Future of <span className="text-gradient">Decentralized Trust</span></h2>
          <p>AssetBlock utilizes the low fees and high speed of Midnight blockchain.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {features.map((f, i) => (
            <div key={i} className="glass-panel feature-card" style={{ transition: 'transform 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ marginBottom: '20px', background: 'rgba(0, 210, 255, 0.1)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{f.title}</h3>
              <p style={{ fontSize: '0.95rem', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-glow-bottom"></div>
    </section>
  );
};

const Dashboard = ({ isConnected, onConnect, walletCtx, address }: { isConnected: boolean, onConnect: () => void, walletCtx: WalletContext | null, address: string }) => {
  const [contracts, setContracts] = useState<{address: string, state: EscrowState}[]>([]);
  const [providers, setProviders] = useState<EscrowProviders | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Deploy Form State
  const [showDeploy, setShowDeploy] = useState(false);
  const [deployBeneficiary, setDeployBeneficiary] = useState('');
  const [deployAmount, setDeployAmount] = useState('100');

  // Load Form State
  const [showLoad, setShowLoad] = useState(false);
  const [loadAddress, setLoadAddress] = useState('');

  useEffect(() => {
    if (walletCtx && !providers) {
      initializeProviders(walletCtx).then(p => setProviders(p)).catch(console.error);
    }
  }, [walletCtx, providers]);

  const handleDeploy = async () => {
    if (!providers) return;
    try {
      setIsLoading(true);
      const amountBigInt = BigInt(deployAmount);
      const contract = await deployEscrowContract(providers, deployBeneficiary, amountBigInt);
      const state = await getEscrowState(providers, contract.deployTxData.public.contractAddress);
      setContracts(prev => [...prev, { address: contract.deployTxData.public.contractAddress, state }]);
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
      setContracts(prev => [...prev, { address: loadAddress, state }]);
      setShowLoad(false);
    } catch (e: any) {
      console.error("Load failed error object:", e);
      alert("Load failed: " + (e.message || (typeof e === 'object' ? JSON.stringify(e) : String(e))));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelease = async (address: string) => {
    if (!providers) return;
    try {
      setIsLoading(true);
      // Wait we need the contract instance... 
      // Actually, we can just load the deployed contract instance
      const { findDeployedContract } = await import('@midnight-ntwrk/midnight-js-contracts');
      const { CompiledContract } = await import('@midnight-ntwrk/midnight-js-protocol/compact-js');
      const { Contract } = await import('./compiled/escrow/contract/index.js');
      
      const escrowCompiledContract = CompiledContract.make('escrow', Contract).pipe(
          CompiledContract.withVacantWitnesses
      );
      
      const deployed = await findDeployedContract(providers, {
          contractAddress: address,
          compiledContract: escrowCompiledContract as any,
          privateStateId: 'escrowPrivateState',
          initialPrivateState: {},
      });
      await releaseEscrowFunds(deployed);
      
      // Refresh state
      const newState = await getEscrowState(providers, address);
      setContracts(prev => prev.map(c => c.address === address ? { ...c, state: newState } : c));
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
      <div className="container animate-fade-in-up" style={{ padding: '60px 24px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '48px 32px' }}>
          <Wallet size={64} color="var(--accent-electric)" style={{ marginBottom: '24px', opacity: 0.8 }} />
          <h2 style={{ marginBottom: '16px' }}>Wallet Disconnected</h2>
          <p style={{ marginBottom: '32px' }}>You must connect your Lace wallet to view and manage your escrow contracts on the devnet.</p>
          <button className="btn-primary" onClick={onConnect} style={{ width: '100%' }}>
            Connect Lace Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in-up" style={{ padding: '40px 24px', minHeight: '70vh' }}>
      <div className="flex-between dashboard-header" style={{ marginBottom: '32px' }}>
        <div>
          <h2>Your Escrow <span className="text-gradient">Contracts</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            Connected Shielded Key: <span style={{ color: 'var(--accent-electric)', userSelect: 'all', cursor: 'pointer' }} title="Click to select all">{address}</span>
          </p>
        </div>
        <div>
          <button className="btn-secondary" onClick={() => setShowLoad(true)} style={{ marginRight: '12px' }}>Load Contract</button>
          <button className="btn-primary" onClick={() => setShowDeploy(true)}>+ Create Contract</button>
        </div>
      </div>
      
      {isLoading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
            <Loader size={48} className="animate-spin" color="var(--accent-electric)" style={{ marginBottom: '16px' }} />
            <h3>Processing transaction...</h3>
            <p>Please approve the request in Lace.</p>
          </div>
        </div>
      )}

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

      <div className="glass-panel table-container" style={{ padding: '0', overflowX: 'auto' }}>
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
            {contracts.map((c, i) => (
              <tr key={i} style={{ borderBottom: i === contracts.length - 1 ? 'none' : '1px solid var(--border-glass)' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: 600 }}>{c.address.substring(0, 10)}...{c.address.substring(c.address.length - 6)}</div>
                </td>
                <td style={{ padding: '20px 24px', fontWeight: 600, color: 'var(--accent-electric)' }}>{c.state.amount.toString()}</td>
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
      </div>
    </div>
  );
};

// --- APP ---

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [walletContext, setWalletContext] = useState<WalletContext | null>(null);

  // Check if wallet was already enabled
  useEffect(() => {
    const checkConnection = async () => {
      if (window.midnight) {
        try {
          const keys = Object.keys(window.midnight);
          if (keys.length > 0) {
            const wallet = (window.midnight as any)[keys[0]];
            let api;
            if (typeof wallet.connect === 'function') {
              api = await wallet.connect('undeployed');
            } else {
              const isEnabled = typeof wallet.isEnabled === 'function' ? await wallet.isEnabled() : false;
              if (isEnabled && typeof wallet.enable === 'function') {
                api = await wallet.enable();
              }
            }
            if (api) {
              const walletCtx = await createLaceWalletContext(api);
              setWalletContext(walletCtx);
              const shieldedAddress = await getShieldedAddress(walletCtx);
              setAddress(shieldedAddress);
              setIsConnected(true);
            }
          }
        } catch (e) {
          console.error("Error checking lace connection", e);
        }
      }
    };
    checkConnection();
  }, []);

  const handleConnect = async () => {
    if (isConnected) {
      setIsConnected(false);
      setAddress('');
      return;
    }

    if (window.midnight) {
      try {
        const keys = Object.keys(window.midnight);
        if (keys.length === 0) {
          throw new Error("No wallet keys found in window.midnight");
        }
        
        const firstKey = keys[0];
        const wallet = (window.midnight as any)[firstKey];
        
        let api;
        if (typeof wallet.connect === 'function') {
          api = await wallet.connect('undeployed');
        } else if (typeof wallet.enable === 'function') {
          api = await wallet.enable();
        } else {
          throw new Error("The injected wallet object does not have a connect or enable function.");
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
        if (err.message && err.message.includes('reject')) {
           alert("Connection rejected by user.");
        } else {
           alert("Failed to connect: " + (err.message || JSON.stringify(err)));
        }
      }
    } else {
      alert("Lace Midnight Preview wallet extension is not installed or did not inject properly. Please refresh the page or reinstall the extension.");
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <Header onConnect={handleConnect} isConnected={isConnected} onNavigate={handleNavigate} address={address} />
      
      <main>
        {currentPage === 'home' && (
          <>
            <Hero onLaunch={() => handleNavigate('dashboard')} />
            <Features />
          </>
        )}
        
        {currentPage === 'dashboard' && <Dashboard isConnected={isConnected} onConnect={handleConnect} walletCtx={walletContext} address={address} />}
      </main>

      <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border-glass)', marginTop: '80px', textAlign: 'center' }}>
        <div className="container flex-between footer-content" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ color: 'var(--text-muted)' }}>
            &copy; 2026 AssetBlock on Midnight. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Terms</span>
            <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Privacy</span>
            <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Twitter</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
