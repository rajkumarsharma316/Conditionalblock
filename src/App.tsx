import { useState, useEffect } from 'react';
import { Wallet, ShieldAlert, Clock, Code, Activity, ShieldCheck, ChevronRight, Menu, X } from 'lucide-react';
import './index.css';

// --- TYPES ---
declare global {
  interface Window {
    cardano?: {
      lace?: {
        enable: () => Promise<any>;
        isEnabled: () => Promise<boolean>;
      };
    };
  }
}

// --- COMPONENTS ---

const Header = ({ onConnect, isConnected, onNavigate, address }: { onConnect: () => void, isConnected: boolean, onNavigate: (page: string) => void, address: string }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          >
            <Wallet size={18} />
            {isConnected ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Connect Lace'}
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
            {isConnected ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Connect Lace'}
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

const Dashboard = ({ isConnected, onConnect }: { isConnected: boolean, onConnect: () => void }) => {
  const [contracts] = useState([
    { id: '0x8f...3a1', title: 'Freelance Design Work', amount: '2,500 tADA', status: 'Locked', condition: 'Multi-Sig (1/2)' },
    { id: '0x4a...9b2', title: 'Real Estate Deposit', amount: '15,000 tADA', status: 'Active', condition: 'Time-Lock (Dec 1, 2026)' },
    { id: '0x1c...7d4', title: 'Supply Chain Payment', amount: '8,200 tADA', status: 'Completed', condition: 'Oracle Delivery' },
  ]);

  if (!isConnected) {
    return (
      <div className="container animate-fade-in-up" style={{ padding: '60px 24px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '48px 32px' }}>
          <Wallet size={64} color="var(--accent-electric)" style={{ marginBottom: '24px', opacity: 0.8 }} />
          <h2 style={{ marginBottom: '16px' }}>Wallet Disconnected</h2>
          <p style={{ marginBottom: '32px' }}>You must connect your Lace wallet to view and manage your escrow contracts on the testnet.</p>
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
        <h2>Your Escrow <span className="text-gradient">Contracts</span></h2>
        <button className="btn-primary">+ Create Contract</button>
      </div>

      <div className="glass-panel table-container" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '20px 24px', fontWeight: 500 }}>Contract Title</th>
              <th style={{ padding: '20px 24px', fontWeight: 500 }}>Amount</th>
              <th style={{ padding: '20px 24px', fontWeight: 500 }}>Condition Type</th>
              <th style={{ padding: '20px 24px', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '20px 24px', fontWeight: 500 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c, i) => (
              <tr key={i} style={{ borderBottom: i === contracts.length - 1 ? 'none' : '1px solid var(--border-glass)' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {c.id}</div>
                </td>
                <td style={{ padding: '20px 24px', fontWeight: 600, color: 'var(--accent-electric)' }}>{c.amount}</td>
                <td style={{ padding: '20px 24px' }}>{c.condition}</td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem', 
                    background: c.status === 'Completed' ? 'rgba(46, 213, 115, 0.1)' : c.status === 'Active' ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255, 165, 2, 0.1)',
                    color: c.status === 'Completed' ? '#2ed573' : c.status === 'Active' ? 'var(--accent-electric)' : '#ffa502',
                    whiteSpace: 'nowrap'
                  }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>View</button>
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

  // Check if wallet was already enabled
  useEffect(() => {
    const checkConnection = async () => {
      if (window.cardano?.lace) {
        try {
          const isEnabled = await window.cardano.lace.isEnabled();
          if (isEnabled) {
            const api = await window.cardano.lace.enable();
            const usedAddresses = await api.getUsedAddresses();
            if (usedAddresses && usedAddresses.length > 0) {
              setAddress(usedAddresses[0]);
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
      // Basic mock disconnect logic, true dApps usually don't "disconnect" strictly from UI unless implemented specifically
      setIsConnected(false);
      setAddress('');
      return;
    }

    if (window.cardano && window.cardano.lace) {
      try {
        const api = await window.cardano.lace.enable();
        // Typically testnet is checked via api.getNetworkId()
        const usedAddresses = await api.getUsedAddresses();
        
        if (usedAddresses && usedAddresses.length > 0) {
          setAddress(usedAddresses[0]);
          setIsConnected(true);
        } else {
          alert("No addresses found in your wallet.");
        }
      } catch (err: any) {
        console.error(err);
        alert("Failed to connect wallet: " + (err.message || JSON.stringify(err)));
      }
    } else {
      alert("Lace wallet extension is not installed. Please install it to use this application.");
      window.open('https://www.lace.io/', '_blank');
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
        
        {currentPage === 'dashboard' && (
          <Dashboard isConnected={isConnected} onConnect={handleConnect} />
        )}
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
