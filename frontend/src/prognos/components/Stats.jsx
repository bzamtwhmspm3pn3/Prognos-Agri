import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function Stats({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="stats-grid">
      {items.map((item, index) => (
        <div key={index} className="stat-card">
          {item.icon && (
            <div
              className="stat-icon"
              style={{
                background: `${item.color || 'var(--primary)'}15`,
                color: item.color || 'var(--primary)'
              }}
            >
              {item.icon}
            </div>
          )}
          <div>
            <div className="stat-value" style={{ color: item.color || 'var(--primary)' }}>
              {item.value}
            </div>
            <div className="stat-label">{item.label}</div>
            {item.change !== undefined && (
              <div className={`stat-change ${item.change >= 0 ? 'positive' : 'negative'}`}>
                {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {' '}{Math.abs(item.change)}% {item.change >= 0 ? 'aumento' : 'queda'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
