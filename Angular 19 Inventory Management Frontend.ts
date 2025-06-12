/**
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
 * │   │       └── request.model.ts
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
 * └── main.ts
 */

// src/app/app.config.ts
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

// src/app/app.routes.ts
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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
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
<div class="login-container">
  <h2>Login</h2>
  <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>
  <div class="form-group">
    <label for="username">Username:</label>
    <input type="text" id="username" [(ngModel)]="username" required />
  </div>
  <div class="form-group">
    <label for="password">Password:</label>
    <input type="password" id="password" [(ngModel)]="password" required />
  </div>
  <button (click)="login()">Login</button>
</div>

// src/app/features/login/login.component.css
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}

.error {
  color: red;
  margin-bottom: 15px;
}

// src/app/features/dashboard/admin/admin-dashboard.component.ts
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
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
<div class="dashboard-container">
  <h2>Admin Dashboard</h2>
  <button (click)="logout()">Logout</button>
  <div class="nav-links">
    <a routerLink="/admin/items">Manage Items</a>
    <a routerLink="/admin/requests">Manage Requests</a>
  </div>
</div>

// src/app/features/dashboard/admin/admin-dashboard.component.css
.dashboard-container {
  padding: 20px;
  text-align: center;
}

.nav-links {
  margin-top: 20px;
}

.nav-links a {
  margin: 0 10px;
  padding: 10px;
  background: #007bff;
  color: white;
  text-decoration: none;
}

button {
  background: #dc3545;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
}

// src/app/features/dashboard/employee/employee-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RequestService } from '../../../core/services/request.service';
import { Request } from '../../../shared/models/request.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  requests: Request[] = [];
  username: string = '';

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
<div class="dashboard-container">
  <h2>Employee Dashboard</h2>
  <button (click)="logout()">Logout</button>
  <h3>Your Requests</h3>
  <button (click)="addNewRequest()">Add New Request</button>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let request of requests">
        <td>{{ request.itemName }}</td>
        <td>{{ request.status }}</td>
        <td>
          <button *ngIf="request.status === 'PENDING'" (click)="cancelRequest(request.id)">Cancel</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

// src/app/features/dashboard/employee/employee-dashboard.component.css
.dashboard-container {
  padding: 20px;
  text-align: center;
}

table {
  width: 80%;
  margin: 20px auto;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

button {
  background: #dc3545;
  color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
}

// src/app/features/dashboard/item-management/item-management.component.ts
import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../../core/services/item.service';
import { Item } from '../../../shared/models/item.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-management.component.html',
  styleUrls: ['./item-management.component.css']
})
export class ItemManagementComponent implements OnInit {
  items: Item[] = [];

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
<div class="management-container">
  <h2>Item Management</h2>
  <button (click)="addNewItem()">Add New Item</button>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Quantity</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let item of items">
        <td>{{ item.name }}</td>
        <td>{{ item.quantity }}</td>
        <td>
          <button (click)="editItem(item)">Edit</button>
          <button (click)="deleteItem(item.id)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

// src/app/features/dashboard/item-management/item-management.component.css
.management-container {
  padding: 20px;
  text-align: center;
}

table {
  width: 80%;
  margin: 20px auto;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

button {
  background: #007bff;
  color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  margin: 0 5px;
}

// src/app/features/dashboard/request-management/request-management.component.ts
import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../../core/services/request.service';
import { Request } from '../../../shared/models/request.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request-management.component.html',
  styleUrls: ['./request-management.component.css']
})
export class RequestManagementComponent implements OnInit {
  requests: Request[] = [];

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
<div class="management-container">
  <h2>Request Management</h2>
  <table>
    <thead>
      <tr>
        <th>Username</th>
        <th>Item</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let request of requests">
        <td>{{ request.username }}</td>
        <td>{{ request.itemName }}</td>
        <td>{{ request.status }}</td>
        <td>
          <button *ngIf="request.status === 'PENDING'" (click)="approveRequest(request)">Approve</button>
          <button *ngIf="request.status === 'PENDING'" (click)="rejectRequest(request)">Reject</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

// src/app/features/dashboard/request-management/request-management.component.css
.management-container {
  padding: 20px;
  text-align: center;
}

table {
  width: 80%;
  margin: 20px auto;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

button {
  background: #28a745;
  color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  margin: 0 5px;
}

button:nth-child(2) {
  background: #dc3545;
}

// src/styles.css
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

// src/index.html
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

// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));