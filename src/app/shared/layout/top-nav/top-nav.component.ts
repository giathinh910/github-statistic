import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'fe-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent {
  isAuth: Observable<boolean> = this.authService.isAuthenticated$;

  constructor(private authService: AuthService) {
  }

  logout() {
    this.authService.logout();
  }
}
