import React, { ReactNode } from 'react';

export type AppId = 'calculator' | 'todo' | 'timer' | 'snake' | 'settings' | 'notepad' | 'paint' | 'terminal';

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface AppConfig {
  id: AppId;
  name: string;
  icon: ReactNode;
  component: React.ComponentType<any>;
  defaultSize?: { width: number; height: number };
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ThemeContextType {
  wallpaper: string;
  setWallpaper: (url: string) => void;
  taskbarColor: string;
  setTaskbarColor: (color: string) => void;
}