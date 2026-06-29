import { useState, useEffect } from 'react';
import { DashboardSettings } from '@obs-chat/event-schema';

const STORAGE_KEY = 'obs-chat-dashboard-settings';

const DEFAULT_SETTINGS: DashboardSettings = {
  backgroundColor: "#1a1a1e",
  fontFamily: "Inter",
  fontSize: 16,
  fontWeight: 400,
  activeTheme: "glass",
  timestampMode: "off",
  emoteGlobalEnabled: true,
  emotePlatformToggles: { twitch: true, youtube: true, kick: true, tiktok: true, custom: true },
  viewMode: "unified"
};

let globalSettings = { ...DEFAULT_SETTINGS };
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    globalSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  }
} catch (err) {
  console.error('Failed to parse settings from localStorage', err);
}

const listeners = new Set<(s: DashboardSettings) => void>();

export function useSettings() {
  const [settings, setSettingsState] = useState<DashboardSettings>(globalSettings);

  useEffect(() => {
    listeners.add(setSettingsState);
    return () => { listeners.delete(setSettingsState); };
  }, []);

  const updateSettings = (newSettings: Partial<DashboardSettings>) => {
    globalSettings = { ...globalSettings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(globalSettings));
    } catch (err) {
      console.error('Failed to save settings to localStorage', err);
    }
    listeners.forEach(listener => listener(globalSettings));
  };

  return { settings, updateSettings };
}
