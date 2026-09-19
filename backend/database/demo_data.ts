export interface OrganizationSeed {
  id: number;
  name: string;
  type: string;
  contact_email: string;
  location: string;
}

export interface ResourceCategorySeed {
  id: number;
  name: string;
  description: string;
}

export interface ResourceSeed {
  id: number;
  organization_id: number;
  description: string;
  category: string;
  subcategory: string;
  quantity: number;
  condition: string;
  status: 'AVAILABLE' | 'MATCHED' | 'TRANSFERRED' | 'RESERVED';
  created_at: string;
}

export interface RequestSeed {
  id: number;
  organization_id: number;
  description: string;
  category: string;
  subcategory: string;
  quantity: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  deadline: string;
  status: 'PENDING' | 'MATCHED' | 'FULFILLED' | 'CANCELLED';
  created_at: string;
}

export interface TransferSeed {
  id: number;
  resource_id: number;
  request_id: number;
  quantity: number;
  status: 'COMPLETED' | 'IN_TRANSIT' | 'SCHEDULED';
  transfer_date: string;
  notes: string;
}

export interface MatchSeed {
  id: number;
  resource_id: number;
  request_id: number;
  match_score: number;
  reason: string;
  status: 'RECOMMENDED' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
}

export const SEED_ORGANIZATIONS: OrganizationSeed[] = [
  { id: 1, name: "City Youth Community Center", type: "Community Foundation", contact_email: "contact@cityyouth.org", location: "Downtown District" },
  { id: 2, name: "Sunrise Public Elementary School", type: "Public Education", contact_email: "admin@sunriseschool.edu", location: "Eastside Ward" },
  { id: 3, name: "Hope Harvest Relief Network", type: "Disaster & Emergency Aid", contact_email: "dispatch@hopeharvest.org", location: "Metro South" },
  { id: 4, name: "Green Future Tech Recyclers", type: "Eco Non-Profit", contact_email: "donations@greenfuture.org", location: "Tech Corridor North" },
  { id: 5, name: "Oak Valley Literacy Project", type: "Charity Education", contact_email: "books@oakvalleylit.org", location: "West Valley" },
  { id: 6, name: "St. Jude Family Shelter", type: "Social Services", contact_email: "care@stjudefamily.org", location: "Harbor Quarter" }
];

export const SEED_CATEGORIES: ResourceCategorySeed[] = [
  { id: 1, name: "Furniture", description: "Office, classroom, and community chairs, tables, desks, and shelving" },
  { id: 2, name: "Educational Supplies", description: "Notebooks, textbooks, pens, backpacks, art and science kits" },
  { id: 3, name: "Technology & Electronics", description: "Computers, laptops, monitors, projectors, and networking gear" },
  { id: 4, name: "Books & Media", description: "Reading books, encyclopedias, children's literature, manuals" },
  { id: 5, name: "Medical & Hygiene", description: "First aid kits, sanitizers, blankets, hygiene kits" }
];

export const SEED_RESOURCES: ResourceSeed[] = [
  {
    id: 1,
    organization_id: 4,
    description: "50 unused wooden chairs in sturdy condition with ergonomic back support",
    category: "Furniture",
    subcategory: "Chair",
    quantity: 50,
    condition: "Unused",
    status: "AVAILABLE",
    created_at: "2026-08-10 09:30:00"
  },
  {
    id: 2,
    organization_id: 3,
    description: "100 spiral-bound ruled notebooks suitable for middle school students",
    category: "Educational Supplies",
    subcategory: "Notebook",
    quantity: 100,
    condition: "Good",
    status: "AVAILABLE",
    created_at: "2026-08-14 11:15:00"
  },
  {
    id: 3,
    organization_id: 4,
    description: "25 refurbished desktop computers with Intel i5, 16GB RAM and monitors",
    category: "Technology & Electronics",
    subcategory: "Computer",
    quantity: 25,
    condition: "Good",
    status: "AVAILABLE",
    created_at: "2026-08-18 14:00:00"
  },
  {
    id: 4,
    organization_id: 6,
    description: "40 heavy-duty waterproof school bags with reflective safety straps",
    category: "Educational Supplies",
    subcategory: "School Bag",
    quantity: 40,
    condition: "Unused",
    status: "AVAILABLE",
    created_at: "2026-08-20 16:45:00"
  },
  {
    id: 5,
    organization_id: 1,
    description: "30 modular wooden conference and study tables (seats 4 each)",
    category: "Furniture",
    subcategory: "Table",
    quantity: 30,
    condition: "Like New",
    status: "AVAILABLE",
    created_at: "2026-08-22 10:00:00"
  },
  {
    id: 6,
    organization_id: 5,
    description: "200 illustrated children's fiction and educational science books",
    category: "Books & Media",
    subcategory: "Book",
    quantity: 200,
    condition: "Good",
    status: "AVAILABLE",
    created_at: "2026-08-25 13:20:00"
  },
  {
    id: 7,
    organization_id: 4,
    description: "15 LCD computer monitors 24-inch with HDMI/DisplayPort cables",
    category: "Technology & Electronics",
    subcategory: "Monitor",
    quantity: 15,
    condition: "Like New",
    status: "TRANSFERRED",
    created_at: "2026-08-01 08:30:00"
  },
  {
    id: 8,
    organization_id: 3,
    description: "60 student desk sets with integrated book baskets",
    category: "Furniture",
    subcategory: "Desk",
    quantity: 60,
    condition: "Good",
    status: "TRANSFERRED",
    created_at: "2026-07-28 10:00:00"
  }
];

export const SEED_REQUESTS: RequestSeed[] = [
  {
    id: 1,
    organization_id: 1,
    description: "Need 40 chairs for our newly expanded community hall seating and youth workshops",
    category: "Furniture",
    subcategory: "Chair",
    quantity: 40,
    urgency: "HIGH",
    deadline: "2026-09-30",
    status: "PENDING",
    created_at: "2026-08-28 09:00:00"
  },
  {
    id: 2,
    organization_id: 2,
    description: "Requesting 80 notebooks and writing pads for incoming elementary grade students",
    category: "Educational Supplies",
    subcategory: "Notebook",
    quantity: 80,
    urgency: "HIGH",
    deadline: "2026-09-25",
    status: "PENDING",
    created_at: "2026-08-29 11:30:00"
  },
  {
    id: 3,
    organization_id: 5,
    description: "Urgent need for 20 computers to equip our public digital literacy learning lab",
    category: "Technology & Electronics",
    subcategory: "Computer",
    quantity: 20,
    urgency: "HIGH",
    deadline: "2026-09-28",
    status: "PENDING",
    created_at: "2026-08-30 15:10:00"
  },
  {
    id: 4,
    organization_id: 2,
    description: "Seeking 35 durable school backpacks for low-income students before semester starts",
    category: "Educational Supplies",
    subcategory: "School Bag",
    quantity: 35,
    urgency: "MEDIUM",
    deadline: "2026-10-05",
    status: "PENDING",
    created_at: "2026-08-31 10:20:00"
  },
  {
    id: 5,
    organization_id: 6,
    description: "Need 15 sturdy tables for our communal dining and evening homework room",
    category: "Furniture",
    subcategory: "Table",
    quantity: 15,
    urgency: "MEDIUM",
    deadline: "2026-10-15",
    status: "PENDING",
    created_at: "2026-09-01 14:00:00"
  },
  {
    id: 6,
    organization_id: 5,
    description: "Seeking 150 reading books for rural library pop-up initiative",
    category: "Books & Media",
    subcategory: "Book",
    quantity: 150,
    urgency: "LOW",
    deadline: "2026-10-30",
    status: "PENDING",
    created_at: "2026-09-02 16:40:00"
  },
  {
    id: 7,
    organization_id: 3,
    description: "Fulfilled request for 15 monitors for emergency response command center",
    category: "Technology & Electronics",
    subcategory: "Monitor",
    quantity: 15,
    urgency: "HIGH",
    deadline: "2026-08-15",
    status: "FULFILLED",
    created_at: "2026-07-29 08:00:00"
  },
  {
    id: 8,
    organization_id: 2,
    description: "Fulfilled request for 60 student desks for upgraded classrooms",
    category: "Furniture",
    subcategory: "Desk",
    quantity: 60,
    urgency: "HIGH",
    deadline: "2026-08-10",
    status: "FULFILLED",
    created_at: "2026-07-25 09:30:00"
  }
];

export const SEED_TRANSFERS: TransferSeed[] = [
  {
    id: 1,
    resource_id: 7,
    request_id: 7,
    quantity: 15,
    status: "COMPLETED",
    transfer_date: "2026-08-12 14:30:00",
    notes: "Successfully transferred 15 LCD monitors to Emergency Response Command Center"
  },
  {
    id: 2,
    resource_id: 8,
    request_id: 8,
    quantity: 60,
    status: "COMPLETED",
    transfer_date: "2026-08-08 11:00:00",
    notes: "Transferred 60 student desk sets to Sunrise Public Elementary School"
  }
];

export const SEED_MATCHES: MatchSeed[] = [
  {
    id: 1,
    resource_id: 1,
    request_id: 1,
    match_score: 94,
    reason: "Category and subcategory match exactly (Furniture > Chair), available quantity of 50 exceeds requested 40, and conditions match community hall usage.",
    status: "RECOMMENDED",
    created_at: "2026-08-28 10:00:00"
  },
  {
    id: 2,
    resource_id: 2,
    request_id: 2,
    match_score: 91,
    reason: "Direct educational supplies category match, requested 80 notebooks is comfortably fulfilled by 100 available units in good condition.",
    status: "RECOMMENDED",
    created_at: "2026-08-29 12:00:00"
  },
  {
    id: 3,
    resource_id: 3,
    request_id: 3,
    match_score: 96,
    reason: "High-priority digital literacy request matches refurbished computers with complete specifications and matching quantity requirements.",
    status: "RECOMMENDED",
    created_at: "2026-08-30 16:00:00"
  }
];
