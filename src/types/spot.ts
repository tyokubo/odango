export type Spot = {
  id: string;
  name: string;
  area: string;
  mood: string;
  category: string;
  description: string;
  budget_min: number;
  budget_max: number;
  google_maps_url: string | null;
  created_at: string;
};
