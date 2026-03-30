export interface Route {
  path: string;
  name: string;
  component: string;
  icon?: string;
  isPublic?: boolean;
  showInNav?: boolean;
  requiresAuth?: boolean; // New property to control authentication requirement
}

export const routes: Route[] = [
  {
    path: '/',
    name: 'Home',
    component: 'LandingView',
    icon: 'Heart',
    isPublic: true,
    showInNav: true,
    requiresAuth: true, // Requires authentication after first visit
  },
  {
    path: '/auth',
    name: 'Boyfriend Access',
    component: 'AuthView',
    icon: 'Lock',
    isPublic: true,
    showInNav: false,
    requiresAuth: false, // Auth route doesn't require authentication
  },
  {
    path: '/boyfriend-dashboard',
    name: 'Boyfriend Dashboard',
    component: 'BoyFriendDashboardView',
    icon: 'Heart',
    isPublic: false,
    showInNav: false,
    requiresAuth: false, // Special boyfriend access (handled separately)
  },
  {
    path: '/love-letters',
    name: 'Love Letters',
    component: 'LoveLetterView',
    icon: 'Mail',
    isPublic: true,
    showInNav: true,
    requiresAuth: true,
  },
  {
    path: '/girlfriend-sad',
    name: 'When You\'re Sad',
    component: 'SadCategoryView',
    icon: 'Frown',
    isPublic: true,
    showInNav: false,
    requiresAuth: true,
  },
  {
    path: '/girlfriend-miss',
    name: 'When You Miss Me',
    component: 'MissCategoryView',
    icon: 'HeartHandshake',
    isPublic: true,
    showInNav: false,
    requiresAuth: true,
  },
  {
    path: '/memories',
    name: 'Our Memories',
    component: 'MemoriesView',
    icon: 'Camera',
    isPublic: true,
    showInNav: true,
    requiresAuth: true,
  },
  {
    path: '/music',
    name: 'Our Music Playlist',
    component: 'PlayListView',
    icon: 'Music',
    isPublic: true,
    showInNav: true,
    requiresAuth: true,
  },
  {
    path: '/girlfriend/madeforyou',
    name: 'Made for You',
    component: 'MadeForYouView',
    icon: 'Gift',
    isPublic: true,
    showInNav: true,
    requiresAuth: true,
  },
  {
    path: '/girlfriend/madeforyou/lyrics-art',
    name: 'Lyrics Art Fullscreen',
    component: 'LyricsArtFullscreenView',
    icon: 'Music',
    isPublic: true,
    showInNav: false,
    requiresAuth: true,
  },
  {
    path: '/girlfriend/madeforyou/ascii-art',
    name: 'ASCII Art Fullscreen',
    component: 'AsciiFullscreenView',
    icon: 'Image',
    isPublic: true,
    showInNav: false,
    requiresAuth: true,
  },
  {
    path: '/girlfriend/madeforyou/flower-garden',
    name: 'Animated Flower Garden',
    component: 'FlowerGardenView',
    icon: 'Flower',
    isPublic: true,
    showInNav: false,
    requiresAuth: true,
  },
  {
    path: '/games',
    name: 'Play with Me',
    component: 'ComingSoon',
    icon: 'Gamepad2',
    isPublic: true,
    showInNav: true,
    requiresAuth: true,
  },
  {
    path: '/goals',
    name: 'Future Goals',
    component: 'ComingSoon',
    icon: 'Target',
    isPublic: true,
    showInNav: true,
    requiresAuth: true,
  },
];

export const getRouteByPath = (path: string): Route | undefined => {
  return routes.find(route => route.path === path);
};

export const getRouteByName = (name: string): Route | undefined => {
  return routes.find(route => route.name === name);
};

export const getNavRoutes = (): Route[] => {
  return routes.filter(route => route.showInNav);
};

export const isValidRoute = (path: string): boolean => {
  return routes.some(route => route.path === path);
};
