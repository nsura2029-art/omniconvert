// Types for the mega-menu — mirrors mega_menu_data.json.
// Every tool is a real <a> tag with href, so all 65+ links are in the
// initial HTML for SEO crawlability.

export type BadgeType = 'hot' | 'new' | 'free' | '';

export interface MegaMenuTool {
  label: string;
  url: string;
  source: string;
  target: string;
  badge: BadgeType;
  meta: string;
}

export interface MegaMenuCategory {
  id: string;
  name: string;
  icon: string;        // emoji
  description: string;
  format_count: number;
  top_tools: MegaMenuTool[];
  related_categories: string[];
}

export interface MegaMenuData {
  categories: MegaMenuCategory[];
}

export interface MegaMenuProps {
  data: MegaMenuData;
  onNavigate?: (path: string) => void;
}