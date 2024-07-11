import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterModule, MatDividerModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit, OnDestroy {
  currentUrl: string = this.router.url;

  private urlSubscription: Subscription;

  constructor(private router: Router, private headerSercive: HeaderService) {}

  ngOnInit(): void {
    this.urlSubscription = this.headerSercive.urlChanged.subscribe(
      (url: string) => (this.currentUrl = url)
    );
  }
  ngOnDestroy(): void {
    this.urlSubscription.unsubscribe();
  }
}
