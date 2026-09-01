export type PageStatus = "Published" | "Draft";

export type PageType = "home" | "page" | "people";

export interface CmsPage {
  id: number;
  title: string;
  slug: string;
  author: string;
  status: PageStatus;
  seoScore: number;
  rating: "Excellent" | "Good" | "Needs Work";
  updated: string;
  updatedBy: string;
  type: PageType;
}

export const cmsPages: CmsPage[] = [
  {
    id: 1,
    title: "Home",
    slug: "/",
    author: "Admin User",
    status: "Published",
    seoScore: 92,
    rating: "Excellent",
    updated: "Today, 10:45 AM",
    updatedBy: "Admin User",
    type: "home",
  },
  {
    id: 2,
    title: "About Us",
    slug: "/about-us",
    author: "Admin User",
    status: "Published",
    seoScore: 88,
    rating: "Good",
    updated: "Yesterday, 04:30 PM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 3,
    title: "Our Services",
    slug: "/our-services",
    author: "Admin User",
    status: "Published",
    seoScore: 90,
    rating: "Excellent",
    updated: "28 May 2026, 11:20 AM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 4,
    title: "How We Help",
    slug: "/how-we-help",
    author: "Seva Team",
    status: "Published",
    seoScore: 85,
    rating: "Good",
    updated: "28 May 2026, 09:15 AM",
    updatedBy: "Seva Team",
    type: "people",
  },
  {
    id: 5,
    title: "Who We Help",
    slug: "/who-we-help",
    author: "Admin User",
    status: "Published",
    seoScore: 87,
    rating: "Good",
    updated: "27 May 2026, 06:40 PM",
    updatedBy: "Admin User",
    type: "people",
  },
  {
    id: 6,
    title: "How Moksha Sewa Works",
    slug: "/how-sewa-works",
    author: "Admin User",
    status: "Published",
    seoScore: 89,
    rating: "Good",
    updated: "27 May 2026, 02:10 PM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 7,
    title: "Request Sewa Help",
    slug: "/request-sewa-help",
    author: "Seva Team",
    status: "Published",
    seoScore: 84,
    rating: "Good",
    updated: "26 May 2026, 05:25 PM",
    updatedBy: "Admin Team",
    type: "people",
  },
  {
    id: 8,
    title: "Sewa & Support",
    slug: "/sewa-support",
    author: "Seva Team",
    status: "Published",
    seoScore: 86,
    rating: "Good",
    updated: "26 May 2026, 10:30 AM",
    updatedBy: "Seva Team",
    type: "page",
  },
  {
    id: 9,
    title: "Our Work",
    slug: "/our-work",
    author: "Admin User",
    status: "Published",
    seoScore: 83,
    rating: "Good",
    updated: "25 May 2026, 04:45 PM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 10,
    title: "Join Us",
    slug: "/join-us",
    author: "Admin User",
    status: "Draft",
    seoScore: 72,
    rating: "Needs Work",
    updated: "24 May 2026, 01:30 PM",
    updatedBy: "Admin User",
    type: "people",
  },
];
