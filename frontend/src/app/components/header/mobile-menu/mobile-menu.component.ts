import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subscription } from 'rxjs';
import { HeaderService } from '../../../services/header.service';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [NgClass, RouterModule, FontAwesomeModule],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.css',
})
export class MobileMenuComponent implements OnDestroy, OnInit {
  @ViewChild('mobileDiv') mobileDiv: ElementRef<HTMLDivElement>;
  @Input() menuItems: { name: string; url: string }[];

  currentUrl: string = this.router.url;
  isMobile: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private headerService: HeaderService, private router: Router) {}

  ngOnInit(): void {
    this.subscription = this.headerService.mobileChanged.subscribe(
      (isMobile: boolean): void => {
        this.isMobile = isMobile;
      }
    );

    this.headerService.urlChanged.subscribe((newTitle: string): void => {
      this.currentUrl = newTitle;
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleMobileClose(): void {
    this.headerService.setMobile(!this.isMobile);
  }
  handleHamClick(checkbox: HTMLInputElement): void {
    this.headerService.setMobile(checkbox.checked);
  }
}
