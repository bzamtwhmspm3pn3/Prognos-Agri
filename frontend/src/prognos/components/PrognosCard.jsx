import React from 'react';

export default function PrognosCard({
  children,
  title,
  subtitle,
  icon,
  action,
  className = '',
  hover = true,
  padding = true
}) {
  return (
    <div
      className={`prognos-card ${className}`}
      style={{
        cursor: hover ? 'default' : 'default',
        padding: padding ? undefined : 0
      }}
    >
      {(title || action) && (
        <div className="prognos-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {icon && (
              <span style={{ color: 'var(--primary)', display: 'flex' }}>{icon}</span>
            )}
            <div>
              <h3 className="prognos-card-title">{title}</h3>
              {subtitle && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
