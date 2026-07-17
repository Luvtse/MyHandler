// lib/keyboard-navigation.ts

import { logger } from './logger';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  category: string;
  action: () => void;
}

export interface KeyboardNavigationConfig {
  enabled: boolean;
  focusOutlineColor: string;
  tabIndexStart: number;
}

const isFormInput = (el: EventTarget | null): el is HTMLElement => {
  const tagName = (el as HTMLElement)?.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
};

// Helper: check if element or ancestor disables shortcuts
const hasNoShortcuts = (el: Element | null): boolean => {
  return !!el?.closest('[data-no-shortcuts]');
};

class KeyboardNavigationService {
  private static instance: KeyboardNavigationService;
  private shortcuts: Map<string, KeyboardShortcut>;
  private config: KeyboardNavigationConfig;
  private focusableElements: HTMLElement[] = [];
  private currentFocusIndex = -1;

  private constructor() {
    this.shortcuts = new Map();
    this.config = {
      enabled: true,
      focusOutlineColor: '#2563eb',
      tabIndexStart: 1,
    };
    this.setupEventListeners();
    this.setupDefaultShortcuts();
    this.updateFocusableElements(); // initial scan
  }

  public static getInstance(): KeyboardNavigationService {
    if (!KeyboardNavigationService.instance) {
      KeyboardNavigationService.instance = new KeyboardNavigationService();
    }
    return KeyboardNavigationService.instance;
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this), true); // capture phase
    document.addEventListener('focusin', this.handleFocusIn.bind(this));

    // Observe only relevant containers if possible; fallback to body
    const target = document.getElementById('app') || document.body;
    const observer = new MutationObserver(() => {
      // Debounce if needed in large apps
      this.updateFocusableElements();
    });
    observer.observe(target, { childList: true, subtree: true });
  }

  private setupDefaultShortcuts(): void {
    this.registerShortcut({
      key: '/',
      ctrl: true,
      description: 'Focus search',
      category: 'Navigation',
      action: () => {
        const searchInput = document.querySelector('[role="search"] input') as HTMLElement | null;
        searchInput?.focus();
      },
    });

    this.registerShortcut({
      key: 'Escape',
      description: 'Close modal/popup',
      category: 'General',
      action: () => {
        const closeButton = document.querySelector('[data-close-modal]') as HTMLElement | null;
        closeButton?.click();
      },
    });

    this.registerShortcut({
      key: 'h',
      ctrl: true,
      description: 'Toggle keyboard shortcuts help',
      category: 'Help',
      action: () => this.toggleShortcutsHelp(),
    });
  }

  private updateFocusableElements(): void {
    this.focusableElements = Array.from(
      document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !hasNoShortcuts(el)) as HTMLElement[];

    this.focusableElements.sort((a, b) => {
      const aIndex = parseInt(a.getAttribute('tabindex') || '0', 10);
      const bIndex = parseInt(b.getAttribute('tabindex') || '0', 10);
      return aIndex - bIndex;
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.config.enabled) return;

    const target = event.target as HTMLElement;
    if (hasNoShortcuts(target)) return;

    const shortcutKey = this.getShortcutKey(event);
    const shortcut = this.shortcuts.get(shortcutKey);

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
      logger.info('Keyboard shortcut used', 'keyboard', {
        shortcut: shortcutKey,
        category: shortcut.category,
      });
      return;
    }

    // Do NOT override Tab navigation → let browser handle it
    // This improves a11y and avoids bugs
  }

  private handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    this.currentFocusIndex = this.focusableElements.indexOf(target);
  }

  private getShortcutKey(event: KeyboardEvent): string {
    const parts = [];
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    parts.push(event.key.toLowerCase());
    return parts.join('+');
  }

  public registerShortcut(shortcut: KeyboardShortcut): void {
    const key = this.normalizeShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  public unregisterShortcut(shortcut: KeyboardShortcut): void {
    const key = this.normalizeShortcutKey(shortcut);
    this.shortcuts.delete(key);
  }

  private normalizeShortcutKey(shortcut: Partial<KeyboardShortcut>): string {
    const parts = [];
    if (shortcut.ctrl) parts.push('ctrl');
    if (shortcut.alt) parts.push('alt');
    if (shortcut.shift) parts.push('shift');
    parts.push(shortcut.key?.toLowerCase() || '');
    return parts.join('+');
  }

  public getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  public getShortcutsByCategory(): Record<string, KeyboardShortcut[]> {
    const categories: Record<string, KeyboardShortcut[]> = {};
    this.shortcuts.forEach((shortcut) => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = [];
      }
      categories[shortcut.category].push(shortcut);
    });
    return categories;
  }

  private toggleShortcutsHelp(): void {
    document.dispatchEvent(new CustomEvent('toggleKeyboardShortcuts'));
  }

  public setConfig(config: Partial<KeyboardNavigationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): KeyboardNavigationConfig {
    return { ...this.config };
  }

  public enable(): void {
    this.config.enabled = true;
  }

  public disable(): void {
    this.config.enabled = false;
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }
}

export const keyboardNavigation = KeyboardNavigationService.getInstance();