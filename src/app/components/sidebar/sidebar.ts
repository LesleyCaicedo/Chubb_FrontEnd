import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from "@angular/router";

@Component({
  selector: 'app-sidebar',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
   isAseguradosOpen = true;

  closeDrawerOnMobile() {
    // Cierra el drawer en móviles después de hacer click
    const drawerToggle = document.getElementById('my-drawer') as HTMLInputElement;
    if (drawerToggle && window.innerWidth < 1024) {
      drawerToggle.checked = false;
    }
  }
}
