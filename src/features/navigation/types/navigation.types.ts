export interface NavigationItem {
  id: number;
  title: string;
  href: string;
  children: NavigationItem[];
}