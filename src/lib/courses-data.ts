import { Course } from "@/types/api";

// Minimal fallback data for when API is unavailable
// In production, this should be empty or contain only essential placeholder data
export const initialCourses: Course[] = [];

// In a real app, this would be connected to a database or API
let coursesData = [...initialCourses];

export function getCourses(): Course[] {
  return coursesData;
}

export function addCourse(course: Omit<Course, "id">): Course {
  const newCourse: Course = {
    ...course,
    id: (coursesData.length + 1).toString(),
  };
  coursesData.push(newCourse);
  return newCourse;
}

export function updateCourse(id: string | number, course: Partial<Course>): Course | null {
  const index = coursesData.findIndex(c => c.id == id);
  if (index === -1) return null;
  
  coursesData[index] = { ...coursesData[index], ...course };
  return coursesData[index];
}

export function deleteCourse(id: string | number): boolean {
  const index = coursesData.findIndex(c => c.id == id);
  if (index === -1) return false;
  
  coursesData.splice(index, 1);
  return true;
}
