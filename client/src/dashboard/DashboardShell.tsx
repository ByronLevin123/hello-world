import React, { useState } from 'react';
import { Role, ROLE_LABELS, ROLE_DESCRIPTIONS } from './types';
import { FrontOfficeView } from './views/FrontOfficeView';
import { MiddleOfficeView } from './views/MiddleOfficeView';
import { BackOfficeView } from './views/BackOfficeView';
import { ExecutiveView } from './views/ExecutiveView';
import { LoginForm } from './components/LoginForm';
import { clearToken, getStoredUser } from './api';

const ROLES: Role[] = ['branch', 'underwriter', 'compliance', 'executive'];

export function DashboardShell() {
  const stored = getStoredUser();
  const [user, setUser] = useState<{ username: string; role: string } | null>(stored);
  const [role, setRole] = useState<Role>((stored?.role as Role) || 'executive');

  if (!user) {
    return (
      <LoginForm onLogin={(u) => {
        setUser(u);
        setRole(u.role as Role);
      }} />
    );
  }

  function handleLogout() {
    clearToken();
    setUser(null);
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.logo}>UK Lending Platform</h1>
          <nav style={styles.roleSwitcher} aria-label="Dashboard view selector">
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                aria-current={role === r ? 'true' : undefined}
                style={{
                  ...styles.roleBtn,
                  background: role === r ? '#fff' : 'transparent',
                  color: role === r ? 'var(--color-primary)' : 'rgba(255,255,255,0.8)',
                  fontWeight: role === r ? 700 : 400,
                }}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </nav>
          <div style={styles.userInfo}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{user.username}</span>
            <button onClick={handleLogout} style={styles.logoutBtn} aria-label="Sign out">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div style={styles.roleBar}>
        <span style={styles.roleTitle}>{ROLE_LABELS[role]}</span>
        <span style={styles.roleDesc}>{ROLE_DESCRIPTIONS[role]}</span>
      </div>

      <main style={styles.main} aria-label={`${ROLE_LABELS[role]} dashboard`}>
        {role === 'branch' && <FrontOfficeView />}
        {role === 'underwriter' && <MiddleOfficeView />}
        {role === 'compliance' && <BackOfficeView />}
        {role === 'executive' && <ExecutiveView />}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', background: 'var(--color-bg)' },
  header: { background: 'var(--color-primary)', padding: '12px 0' },
  headerInner: {
    maxWidth: 1200, margin: '0 auto', padding: '0 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
  },
  logo: { color: '#fff', fontSize: 18, fontWeight: 700 },
  roleSwitcher: { display: 'flex', gap: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 3 },
  roleBtn: {
    border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13,
    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' as const,
    minHeight: 44, minWidth: 44,
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: 12 },
  logoutBtn: {
    background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
    padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
    minHeight: 44,
  },
  roleBar: {
    background: '#fff', borderBottom: '1px solid var(--color-border)',
    padding: '12px 20px', maxWidth: 1200, margin: '0 auto',
  },
  roleTitle: { fontWeight: 700, fontSize: 15, marginRight: 12 },
  roleDesc: { color: 'var(--color-text-light)', fontSize: 13 },
  main: { maxWidth: 1200, margin: '0 auto', padding: '20px' },
};
