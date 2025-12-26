import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private router = inject(Router);

  isChildRoute = signal(false);

  ngOnInit(): void {
    this.checkRoute();
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkRoute();
    });
  }

  checkRoute(): void {
    const url = this.router.url;
    this.isChildRoute.set(url !== '/admin' && url.startsWith('/admin/'));
  }
}
