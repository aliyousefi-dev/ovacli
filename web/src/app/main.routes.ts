import { Routes } from '@angular/router';
import { GraphPage } from './pages/graph/graph.page';
import { GlobalPage } from './pages/global/global.page';
import { HistoryPage } from './pages/history/history.page';
import { ProfilePage } from './pages/profile/profile.page';
import { WatchPage } from './pages/watch/watch.page';
import { UploadPage } from './pages/upload/upload.page';
import { ProfileSettingsPage } from './pages/profile-settings/profile.page';
import { SavedPage } from './pages/saved/saved.page';
import { SearchPage } from './pages/search/search.page';
import { PlaylistsPage } from './pages/playlists/playlists.page';
import { MaterialsPage } from './pages/materials/materials.page';
import { VersionHistoryPage } from './pages/version-history/version-history.page';
import { PlaylistContentPage } from './pages/playlists-content/playlist-content.page';
import { StatsPage } from './pages/stats/stats.page';
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
    data: { reuse: true },
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
    path: 'search',
    component: SearchPage,
    data: { reuse: true },
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
    path: 'playlists/:playlistId',
    component: PlaylistContentPage,
  },
];
