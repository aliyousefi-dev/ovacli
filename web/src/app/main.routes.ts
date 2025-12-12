import { Routes } from '@angular/router';
import { GraphPage } from './pages/graph/graph.page';
import { AuthGuard } from '../services/ova-backend-service/middleware/auth.guard';
import { GlobalPage } from './pages/global/global.page';
import { HistoryPage } from './pages/history/history.page';
import { ProfilePage } from './pages/profile/profile.page';
import { WatchPage } from './pages/watch/watch.page';
import { CreateSpacePage } from './pages/create-space/create-space.page';
import { CreateTeamSpacePage } from './pages/create-team-space/create-team-space.page';
import { JoinTeamSpacePage } from './pages/join-team-space/join-team-space.page';
import { UploadPage } from './pages/upload/upload.page';
import { ProfileSettingsPage } from './pages/profile-settings/profile.page';
import { SettingsPage } from './pages/settings/settings.page';
import { SavedPage } from './pages/saved/saved.page';
import { AppearanceSettingsComponent } from './pages/settings/panels/appearance-settings/appearance-settings.component';
import { SecuritySettingsComponent } from './pages/settings/panels/security-settings/security-settings.component';
import { AddonsSettingsComponent } from './pages/settings/panels/addons-settings/addons-settings.component';
import { GeneralSettingsComponent } from './pages/settings/panels/general-settings/general-settings.component';
import { SearchPage } from './pages/search/search.page';
import { PlaylistsPage } from './pages/playlists/playlists.page';
import { MaterialsPage } from './pages/materials/materials.page';
import { VersionHistoryPage } from './pages/version-history/version-history.page';
import { PlaylistContentPage } from './pages/playlists-content/playlist-content.page';
import { StatsPage } from './pages/stats/stats.page';
import { AccountManagerPage } from './pages/account-manager/account-manager.page';
import { TestPage } from './pages/test/test.page';

export const MainRoutes: Routes = [
  {
    path: '',
    redirectTo: '/global',
    pathMatch: 'full',
  },
  {
    path: 'global',
    component: GlobalPage,
    data: { reuse: true },
  },
  {
    path: 'test',
    component: TestPage,
  },
  {
    path: 'graph',
    component: GraphPage,
  },
  {
    path: 'stats',
    component: StatsPage,
  },
  {
    path: 'admin/account-manager',
    component: AccountManagerPage,
  },
  {
    path: 'history',
    component: HistoryPage,
    data: { reuse: true },
  },
  {
    path: 'profile',
    component: ProfilePage,
  },
  {
    path: 'watch/:videoId',
    component: WatchPage,
  },
  {
    path: 'create-space',
    component: CreateSpacePage,
  },
  {
    path: 'create-team-space',
    component: CreateTeamSpacePage,
  },
  {
    path: 'join-team-space',
    component: JoinTeamSpacePage,
  },
  {
    path: 'upload',
    component: UploadPage,
  },
  {
    path: 'profile-settings',
    component: ProfileSettingsPage,
  },
  {
    path: 'saved',
    component: SavedPage,
  },
  {
    path: 'settings',
    component: SettingsPage,
    children: [
      { path: 'appearance', component: AppearanceSettingsComponent },
      { path: 'security', component: SecuritySettingsComponent },
      { path: 'addons', component: AddonsSettingsComponent },
      { path: 'general', component: GeneralSettingsComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }, // default
    ],
  },
  {
    path: 'search',
    component: SearchPage,
  },
  {
    path: 'playlists',
    component: PlaylistsPage,
  },
  {
    path: 'materials',
    component: MaterialsPage,
  },
  {
    path: 'version-history/:videoId',
    component: VersionHistoryPage,
  },
  {
    path: 'playlists/:title',
    component: PlaylistContentPage,
  },
];
