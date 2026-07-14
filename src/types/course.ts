import type { Spot } from "@/types/spot";

export type CourseSpot = {
  id: string;
  position: number;
  note: string | null;
  spots: Spot;
};

export type Course = {
  id: string;
  title: string;
  area: string;
  mood: string;
  budget_label: string;
  memo: string | null;
  created_at: string;
  course_spots: CourseSpot[];
};
