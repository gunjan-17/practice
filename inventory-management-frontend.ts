/**
 * This file consolidates the entire Angular 19 frontend code for the Inventory Management System
 * with Angular Material. It includes TypeScript, HTML, CSS, and configuration files as comments or string literals.
 * After uploading to GitHub, you can split this file into the respective files based on the folder structure below.
 *
 * Folder Structure:
 * src/
 * ├── app/
 * │   ├── core/
 * │   │   ├── guards/
 * │   │   │   └── auth.guard.ts
 * │   │   ├── services/
 * │   │   │   ├── auth.service.ts
 * │   │   │   ├── item.service.ts
 * │   │   │   └── request.service.ts
 * │   ├── shared/
 * │   │   └── models/
 * │   │       ├── item.model.ts
 * │   │       ├── request.model.ts
 * │   ├── features/
 * │   │   ├── login/
 * │   │   │   ├── login.component.ts
 * │   │   │   ├── login.component.html
 * │   │   │   └── login.component.css
 * │   │   ├── dashboard/
 * │   │   │   ├── admin/
 * │   │   │   │   ├── admin-dashboard.component.ts
 * │   │   │   │   ├── admin-dashboard.component.html
 * │   │   │   │   └── admin-dashboard.component.css
 * │   │   │   ├── employee/
 * │   │   │   │   ├── employee-dashboard.component.ts
 * │   │   │   │   ├── employee-dashboard.component.html
 * │   │   │   │   └── employee-dashboard.component.css
 * │   │   │   ├── item-management/
 * │   │   │   │   ├── item-management.component.ts
 * │   │   │   │   ├── item-management.component.html
 * │   │   │   │   └── item-management.component.css
 * │   │   │   └── request-management/
 * │   │   │       ├── request-management.component.ts
 * │   │   │       ├── request-management.component.html
 * │   │   │       └── request-management.component.css
 * │   ├── app.component.ts
 * │   ├── app.component.html
 * │   ├── app.routes.ts
 * │   └── app.config.ts
 * ├── styles.css
 * ├── index.html
 * ├── main.ts
 * ├── package.json
 * ├── angular.json
 * ├── tsconfig.json
 * ├── tsconfig.app.json
 * └── tsconfig.spec.json
 *
 * Instructions:
 * 1. Copy this entire content into a file named `inventory-management-frontend.ts`.
 * 2. Upload the file to your GitHub repository.
 * 3. After downloading from GitHub, split the content into the respective files based on the paths indicated.
 * 4. Place the files in the folder structure shown above.
 * 5. Run `npm install` to install dependencies, then `ng serve` to start the application.
 */

// src/app/app.config.ts
export const appConfigContent = `
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient()
  ]
};
`;

// src/app/app.routes.ts
export const appRoutesContent = `
import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { AdminDashboardComponent } from './features/dashboard/admin/admin-dashboard.component';
import { EmployeeDashboardComponent } from './features/dashboard/employee/employee-dashboard.component';
import { ItemManagementComponent } from './features/dashboard/item-management/item-management.component';
import { RequestManagementComponent } from './features/dashboard/request-management/request-management.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { role: 'ADMIN' } },
  { path: 'employee/dashboard', component: EmployeeDashboardComponent, canActivate: [AuthGuard], data: { role: 'EMPLOYEE' } },
  { path: 'admin/items', component: ItemManagementComponent, canActivate: [AuthGuard], data: { role: 'ADMIN' } },
  { path: 'admin/requests', component: RequestManagementComponent, canActivate: [AuthGuard], data: { role: 'ADMIN' } },
];
`;

// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent { }

// src/app/app.component.html
export const appComponentHtmlContent = `
<router-outlet></router-outlet>
`;

// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data['role'];

  if (!authService.isUserLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const token = authService.getToken();
  const role = token.includes('ADMIN') ? 'ADMIN' : 'EMPLOYEE';
  if (role !== expectedRole) {
    router.navigate([role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard']);
    return false;
  }

  return true;
};

// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/v1';
  private username: string | null = null;
  private password: string | null = null;

  constructor(private http: HttpClient) {}

  authenticationService(username: string, password: string): Observable<any> {
    const headers = { 'authorization': this.createBasicAuthToken(username, password) };
    return this.http.get(`${this.baseUrl}/basicauth`, { headers });
  }

  createBasicAuthToken(username: string, password: string): string {
    return 'Basic ' + window.btoa(`${username}:${password}`);
  }

  registerSuccessfulLogin(username: string, password: string) {
    this.username = username;
    this.password = password;
    sessionStorage.setItem('token', this.createBasicAuthToken(username, password));
    sessionStorage.setItem('username', username);
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    this.username = null;
    this.password = null;
  }

  isUserLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }

  getToken(): string {
    return sessionStorage.getItem('token') || '';
  }

  getUsername(): string {
    return sessionStorage.getItem('username') || '';
  }
}

// src/app/core/services/item.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../../shared/models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.baseUrl}/items`, {
      headers: { 'Authorization': this.getToken() }
    });
  }

  addItem(item: Item): Observable<Item> {
    return this.http.post<Item>(`${this.baseUrl}/items`, item, {
      headers: { 'Authorization': this.getToken() }
    });
  }

  updateItem(item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.baseUrl}/items/${item.id}`, item, {
      headers: { 'Authorization': this.getToken() }
    });
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/items/${id}`, {
      headers: { 'Authorization': this.getToken() }
    });
  }

  private getToken(): string {
    return sessionStorage.getItem('token') || '';
  }
}

// src/app/core/services/request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Request } from '../../shared/models/request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  getRequests(): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.baseUrl}/requests`, {
      headers: { 'Authorization': this.getToken() }
    });
  }

  getUserRequests(username: string): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.baseUrl}/requests/user/${username}`, {
      headers: { 'Authorization': this.getToken() }
    });
  }

  addRequest(request: Request): Observable<Request> {
    return this.http.post<Request>(`${this.baseUrl}/requests`, request, {
      headers: { 'Authorization': this.getToken() }
    });
  }

  updateRequest(request: Request): Observable<Request> {
    return this.http.put<Request>(`${this.baseUrl}/requests/${request.id}`, request, {
      headers: { 'Authorization': this.getToken() }
    });
  }

  deleteRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/requests/${id}`, {
      headers: { 'Authorization': this.getToken() }
    });
  }

  private getToken(): string {
    return sessionStorage.getItem('token') || '';
  }
}

// src/app/shared/models/item.model.ts
export interface Item {
  id?: number;
  name: string;
  quantity: number;
}

// src/app/shared/models/request.model.ts
export interface Request {
  id?: number;
  username: string;
  itemName: string;
  status: string;
}

// src/app/features/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.authenticationService(this.username, this.password).subscribe({
      next: () => {
        this.authService.registerSuccessfulLogin(this.username, this.password);
        const token = this.authService.getToken();
        const role = token.includes('ADMIN') ? 'ADMIN' : 'EMPLOYEE';
        this.router.navigate([role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Invalid Credentials';
      }
    });
  }
}

// src/app/features/login/login.component.html
export const loginComponentHtmlContent = `
<mat-card class="login-card">
  <mat-card-header>
    <mat-card-title>Login</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>
    <form>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Username</mat-label>
        <input matInput [(ngModel)]="username" name="username" required />
      </mat-form-field>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Password</mat-label>
        <input matInput type="password" [(ngModel)]="password" name="password" required />
      </mat-form-field>
      <button mat-raised-button color="primary" (click)="login()">Login</button>
    </form>
  </mat-card-content>
</mat-card>
`;

// src/app/features/login/login.component.css
export const loginComponentCssContent = `
.login-card {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
}

.full-width {
  width: 100%;
  margin-bottom: 15px;
}

.error {
  color: red;
  text-align: center;
  margin-bottom: 15px;
}

button {
  width: 100%;
}
`;

// src/app/features/dashboard/admin/admin-dashboard.component.ts
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

// src/app/features/dashboard/admin/admin-dashboard.component.html
export const adminDashboardComponentHtmlContent = `
<mat-card class="dashboard-card">
  <mat-card-header>
    <mat-card-title>Admin Dashboard</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    <button mat-raised-button color="warn" (click)="logout()">Logout</button>
    <div class="nav-links">
      <a mat-raised-button color="primary" routerLink="/admin/items">Manage Items</a>
      <a mat-raised-button color="primary" routerLink="/admin/requests">Manage Requests</a>
    </div>
  </mat-card-content>
</mat-card>
`;

// src/app/features/dashboard/admin/admin-dashboard.component.css
export const adminDashboardComponentCssContent = `
.dashboard-card {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  text-align: center;
}

.nav-links {
  margin-top: 20px;
}

.nav-links a {
  margin: 0 10px;
}
`;

// src/app/features/dashboard/employee/employee-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RequestService } from '../../../core/services/request.service';
import { Request } from '../../../shared/models/request.model';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCardModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  requests: Request[] = [];
  username: string = '';
  displayedColumns: string[] = ['itemName', 'status', 'action'];

  constructor(
    private authService: AuthService,
    private requestService: RequestService,
    private router: Router
  ) {}

  ngOnInit() {
    this.username = this.authService.getUsername();
    this.loadRequests();
  }

  loadRequests() {
    this.requestService.getUserRequests(this.username).subscribe(data => {
      this.requests = data;
    });
  }

  addNewRequest() {
    const itemName = prompt('Enter item name:');
    if (itemName) {
      const request: Request = { itemName, status: 'PENDING', username: this.username };
      this.requestService.addRequest(request).subscribe(() => this.loadRequests());
    }
  }

  cancelRequest(id: number | undefined) {
    if (id !== undefined) {
      this.requestService.deleteRequest(id).subscribe(() => this.loadRequests());
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

// src/app/features/dashboard/employee/employee-dashboard.component.html
export const employeeDashboardComponentHtmlContent = `
<mat-card class="dashboard-card">
  <mat-card-header>
    <mat-card-title>Employee Dashboard</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    <button mat-raised-button color="warn" (click)="logout()">Logout</button>
    <h3>Your Requests</h3>
    <button mat-raised-button color="primary" (click)="addNewRequest()">Add New Request</button>
    <table mat-table [dataSource]="requests" class="mat-elevation-z8">
      <ng-container matColumnDef="itemName">
        <th mat-header-cell *matHeaderCellDef>Item</th>
        <td mat-cell *matCellDef="let request">{{ request.itemName }}</td>
      </ng-container>
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let request">{{ request.status }}</td>
      </ng-container>
      <ng-container matColumnDef="action">
        <th mat-header-cell *matHeaderCellDef>Action</th>
        <td mat-cell *matCellDef="let request">
          <button mat-raised-button color="warn" *ngIf="request.status === 'PENDING'" (click)="cancelRequest(request.id)">Cancel</button>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  </mat-card-content>
</mat-card>
`;

// src/app/features/dashboard/employee/employee-dashboard.component.css
export const employeeDashboardComponentCssContent = `
.dashboard-card {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

table {
  width: 100%;
  margin-top: 20px;
}

button {
  margin: 10px 0;
}
`;

// src/app/features/dashboard/item-management/item-management.component.ts
import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../../core/services/item.service';
import { Item } from '../../../shared/models/item.model';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-item-management',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCardModule],
  templateUrl: './item-management.component.html',
  styleUrls: ['./item-management.component.css']
})
export class ItemManagementComponent implements OnInit {
  items: Item[] = [];
  displayedColumns: string[] = ['name', 'quantity', 'actions'];

  constructor(private itemService: ItemService) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.itemService.getItems().subscribe(data => {
      this.items = data;
    });
  }

  addNewItem() {
    const name = prompt('Enter item name:');
    const quantityStr = prompt('Enter quantity:');
    const quantity = quantityStr ? parseInt(quantityStr) : 0;
    if (name && quantity) {
      const item: Item = { name, quantity };
      this.itemService.addItem(item).subscribe(() => this.loadItems());
    }
  }

  editItem(item: Item) {
    const quantityStr = prompt('Enter new quantity:', item.quantity.toString());
    const quantity = quantityStr ? parseInt(quantityStr) : item.quantity;
    if (quantityStr) {
      const updatedItem: Item = { ...item, quantity };
      this.itemService.updateItem(updatedItem).subscribe(() => this.loadItems());
    }
  }

  deleteItem(id: number | undefined) {
    if (id !== undefined) {
      this.itemService.deleteItem(id).subscribe(() => this.loadItems());
    }
  }
}

// src/app/features/dashboard/item-management/item-management.component.html
export const itemManagementComponentHtmlContent = `
<mat-card class="management-card">
  <mat-card-header>
    <mat-card-title>Item Management</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    <button mat-raised-button color="primary" (click)="addNewItem()">Add New Item</button>
    <table mat-table [dataSource]="items" class="mat-elevation-z8">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let item">{{ item.name }}</td>
      </ng-container>
      <ng-container matColumnDef="quantity">
        <th mat-header-cell *matHeaderCellDef>Quantity</th>
        <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
      </ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let item">
          <button mat-raised-button color="primary" (click)="editItem(item)">Edit</button>
          <button mat-raised-button color="warn" (click)="deleteItem(item.id)">Delete</button>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  </mat-card-content>
</mat-card>
`;

// src/app/features/dashboard/item-management/item-management.component.css
export const itemManagementComponentCssContent = `
.management-card {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

table {
  width: 100%;
  margin-top: 20px;
}

button {
  margin: 10px 0;
}

td button {
  margin: 0 5px;
}
`;

// src/app/features/dashboard/request-management/request-management.component.ts
import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../../core/services/request.service';
import { Request } from '../../../shared/models/request.model';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-request-management',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCardModule],
  templateUrl: './request-management.component.html',
  styleUrls: ['./request-management.component.css']
})
export class RequestManagementComponent implements OnInit {
  requests: Request[] = [];
  displayedColumns: string[] = ['username', 'itemName', 'status', 'actions'];

  constructor(private requestService: RequestService) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.requestService.getRequests().subscribe(data => {
      this.requests = data;
    });
  }

  approveRequest(request: Request) {
    const updatedRequest: Request = { ...request, status: 'APPROVED' };
    this.requestService.updateRequest(updatedRequest).subscribe(() => this.loadRequests());
  }

  rejectRequest(request: Request) {
    const updatedRequest: Request = { ...request, status: 'REJECTED' };
    this.requestService.updateRequest(updatedRequest).subscribe(() => this.loadRequests());
  }
}

// src/app/features/dashboard/request-management/request-management.component.html
export const requestManagementComponentHtmlContent = `
<mat-card class="management-card">
  <mat-card-header>
    <mat-card-title>Request Management</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    <table mat-table [dataSource]="requests" class="mat-elevation-z8">
      <ng-container matColumnDef="username">
        <th mat-header-cell *matHeaderCellDef>Username</th>
        <td mat-cell *matCellDef="let request">{{ request.username }}</td>
      </ng-container>
      <ng-container matColumnDef="itemName">
        <th mat-header-cell *matHeaderCellDef>Item</th>
        <td mat-cell *matCellDef="let request">{{ request.itemName }}</td>
      </ng-container>
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let request">{{ request.status }}</td>
      </ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let request">
          <button mat-raised-button color="primary" *ngIf="request.status === 'PENDING'" (click)="approveRequest(request)">Approve</button>
          <button mat-raised-button color="warn" *ngIf="request.status === 'PENDING'" (click)="rejectRequest(request)">Reject</button>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  </mat-card-content>
</mat-card>
`;

// src/app/features/dashboard/request-management/request-management.component.css
export const requestManagementComponentCssContent = `
.management-card {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

table {
  width: 100%;
  margin-top: 20px;
}

td button {
  margin: 0 5px;
}
`;

// src/styles.css
export const stylesCssContent = `
@import '@angular/material/prebuilt-themes/indigo-pink.css';

body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
}
`;

// src/index.html
export const indexHtmlContent = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Inventory Management</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
`;

// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

// package.json (JSON content as a string)
export const packageJsonContent = `
{
  "name": "inventory-management-frontend",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "^19.0.0",
    "@angular/cdk": "^19.0.0",
    "@angular/common": "^19.0.0",
    "@angular/compiler": "^19.0.0",
    "@angular/core": "^19.0.0",
    "@angular/forms": "^19.0.0",
    "@angular/material": "^19.0.0",
    "@angular/platform-browser": "^19.0.0",
    "@angular/platform-browser-dynamic": "^19.0.0",
    "@angular/router": "^19.0.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "^0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^19.0.0",
    "@angular/cli": "^19.0.0",
    "@angular/compiler-cli": "^19.0.0",
    "@types/jasmine": "~5.1.0",
    "@types/node": "^18.18.0",
    "jasmine-core": "~5.1.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "typescript": "~5.5.2"
  }
}
`;

// angular.json (JSON content as a string)
export const angularJsonContent = `
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "inventory-management-frontend": {
      "projectType": "application",
      "schematics": {},
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/inventory-management-frontend",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.css"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "2kb",
                  "maximumError": "4kb"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "buildOptimizer": false,
              "optimization": false,
              "vendorChunk": true,
              "extractLicenses": false,
              "sourceMap": true,
              "namedChunks": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "inventory-management-frontend:build:production"
            },
            "development": {
              "buildTarget": "inventory-management-frontend:build:development"
            }
          },
          "defaultConfiguration": "development"
        },
        "extract-i18n": {
          "builder": "@angular-devkit/build-angular:extract-i18n",
          "options": {
            "buildTarget": "inventory-management-frontend:build"
          }
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "polyfills": ["zone.js", "zone.js/testing"],
            "tsConfig": "tsconfig.spec.json",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.css"],
            "scripts": []
          }
        }
      }
    }
  },
  "cli": {
    "analytics": false
  }
}
`;

// tsconfig.json (JSON content as a string)
export const tsconfigJsonContent = `
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
`;

// tsconfig.app.json (JSON content as a string)
export const tsconfigAppJsonContent = `
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
`;

// tsconfig.spec.json (JSON content as a string)
export const tsconfigSpecJsonContent = `
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["jasmine"]
  },
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
}
`;