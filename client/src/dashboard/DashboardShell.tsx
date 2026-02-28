import React, { useState } from 'react';
import { Role, ROLE_LABELS, ROLE_DESCRIPTIONS } from './types';
import { FrontOfficeView } from './views/FrontOfficeView';
import { MiddleOfficeView } from './views/MiddleOfficeView';
import { BackOfficeView } from './views/BackOfficeView';
import { ExecutiveView } from './views/ExecutiveView';

const ROLES: Role[] = ['branch', 'underwriter', 'compliance', 'executive'];

export function DashboardShell() {
  const [role, setRole] = useState<Role>('executive');

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.logo}>UK Lending Platform</h1>
          <div style={styles.roleSwitcher}>
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
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
          </div>
        </div>
      </header>

      <div style={styles.roleBar}>
        <span style={styles.roleTitle}>{ROLE_LABELS[role]}</span>
        <span style={styles.roleDesc}>{ROLE_DESCRIPTIONS[role]}</span>
      </div>

      <main style={styles.main}>
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
  },
  roleBar: {
    background: '#fff', borderBottom: '1px solid var(--color-border)',
    padding: '12px 20px', maxWidth: 1200, margin: '0 auto',
  },
  roleTitle: { fontWeight: 700, fontSize: 15, marginRight: 12 },
  roleDesc: { color: 'var(--color-text-light)', fontSize: 13 },
  main: { maxWidth: 1200, margin: '0 auto', padding: '20px' },
};
