import React from 'react';
import { SparklesIcon, MoonIcon, SunIcon, Volume2Icon, VolumeXIcon, SearchIcon, RotateCcwIcon } from './Icons';
import { sounds } from '../utils/sound';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  completedCount: number;
  totalCount: number;
  onResetSampleData: () => void;
}

const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  searchQuery,
  setSearchQuery,
  soundEnabled,
  setSoundEnabled,
  completedCount,
  totalCount,
  onResetSampleData,
}) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
    if (next) sounds.playPop();
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-logo">
          <div className="logo-icon">
            <SparklesIcon size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">FlowCraft</span>
            <span className="brand-badge">Daily Studio</span>
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="search-bar-wrapper">
          <SearchIcon size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks or press '/' to filter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
          <span className="search-kbd-hint">/</span>
        </div>
      </div>

      <div className="header-right">
        {totalCount > 0 && (
          <div className="header-progress-chip" title={`${completedCount} of ${totalCount} completed`}>
            <div className="progress-info">
              <span className="progress-fraction">{completedCount}/{totalCount}</span>
              <span className="progress-percent">{percentage}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}

        <button
          className="icon-action-btn"
          title={soundEnabled ? 'Sound feedback on (click to mute)' : 'Sound feedback muted'}
          onClick={toggleSound}
        >
          {soundEnabled ? <Volume2Icon size={18} /> : <VolumeXIcon size={18} />}
        </button>

        <button
          className="icon-action-btn"
          title={darkMode ? 'Switch to Warm Light theme' : 'Switch to Midnight Dark theme'}
          onClick={() => {
            setDarkMode((prev) => !prev);
            sounds.playPop();
          }}
        >
          {darkMode ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>

        <button
          className="demo-data-btn"
          title="Restore sample tasks to test the full experience"
          onClick={() => {
            if (window.confirm('Reset board to curated sample tasks? (Your custom tasks will be refreshed)')) {
              onResetSampleData();
              sounds.playPop();
            }
          }}
        >
          <RotateCcwIcon size={14} />
          <span>Samples</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

