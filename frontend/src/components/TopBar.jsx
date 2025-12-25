import React from 'react';
import { IconLogout } from '@tabler/icons-react';

const TopBar = ({ username, onLogout }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="logo-mark">U</div>
        <div className="logo-text">
          <div className="logo-title">UAV Swarm Console</div>
          <div className="logo-subtitle">Swarm coordination & routing</div>
        </div>
        <span className="tag">Sandbox</span>
      </div>
      <div className="topbar-right">
        <span className="tag">v1.0 · React</span>
        <div className="user-pill">
          <div className="user-avatar">{username ? username[0].toUpperCase() : 'U'}</div>
          <div className="user-name">{username || 'user'}</div>
          <button className="logout-btn" onClick={onLogout}>
            <IconLogout size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
