import { Injectable, signal } from '@angular/core';

export type PastoralTheme = 'pa' | 'pj';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = signal<PastoralTheme>('pa');

  public theme = this.currentTheme.asReadonly();

  constructor() {
    this.loadTheme();
  }

  setTheme(theme: PastoralTheme): void {
    this.currentTheme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pastoral-theme', theme);
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('pastoral-theme') as PastoralTheme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }
}
