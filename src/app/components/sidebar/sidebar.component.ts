import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'app/services/authservice.service';
import { CommonModule } from '@angular/common';
import { FormModule } from '@coreui/angular';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule,FormModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent  {
 
}


