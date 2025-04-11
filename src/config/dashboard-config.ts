export interface DashboardSection {
  id: string;
  title: string;
  contentType: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
}

export const defaultSections: DashboardSection[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    contentType: 'UserWelcome',
    width: 12,
    height: 2,
    x: 0,
    y: 0
  },
  {
    id: 'ratings',
    title: 'My Ratings',
    contentType: 'RatingsSection',
    width: 6,
    height: 4,
    x: 0,
    y: 2
  },
  {
    id: 'goals',
    title: 'My Goals',
    contentType: 'GoalsSection',
    width: 6,
    height: 4,
    x: 6,
    y: 2
  },
  {
    id: 'wishlist',
    title: 'Wishlist',
    contentType: 'WishlistSection',
    width: 6,
    height: 4,
    x: 0,
    y: 6
  },
  {
    id: 'stats',
    title: 'My Stats',
    contentType: 'StatsSection',
    width: 6,
    height: 4,
    x: 6,
    y: 6
  }
];
