import React from 'react';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon || '📭'}</div>
      <h3>{title || 'Nenhum dado encontrado'}</h3>
      <p>{description || 'Comece adicionando novos registos.'}</p>
      {action && action}
    </div>
  );
}
