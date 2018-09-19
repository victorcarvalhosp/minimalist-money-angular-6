import {Routes} from '@angular/router';

import {LandingPageComponent} from './pages/landing-page/landing-page.component';
import {LoginComponent} from './pages/login/login.component';
import {RegisterComponent} from './pages/register/register.component';
import {HomeComponent} from './pages/home/home.component';
import {AuthGuard} from './guards/auth.guard';
import {TransactionsComponent} from './pages/home/transactions/transactions.component';
import {DashboardComponent} from './pages/home/dashboard/dashboard.component';
import {SettingsComponent} from './pages/home/settings/settings.component';
import {CreateTransactionComponent} from './pages/home/transactions/create-transaction/create-transaction.component';

export const appRoutes: Routes = [
  {path: '', component: LandingPageComponent, pathMatch: 'full' },
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard], children: [
    {path: 'transactions', component: TransactionsComponent, children: [
        {path: 'new', component: CreateTransactionComponent}
      ]},
    {path: 'dashboard', component: DashboardComponent},
    {path: 'settings', component: SettingsComponent},
  ]},
]



