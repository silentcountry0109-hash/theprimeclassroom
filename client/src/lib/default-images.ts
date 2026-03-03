import classroom1 from "@assets/classroom-daan-1.png";
import classroom2 from "@assets/classroom-taoyuan-1.png";
import classroom3 from "@assets/classroom-xinyi-1.png";

import teacher1 from "@assets/teacher_1.png";
import teacher2 from "@assets/teacher_2.png";
import teacher3 from "@assets/teacher_3.png";
import teacher4 from "@assets/teacher_4.png";
import teacher5 from "@assets/teacher_5.png";
import teacher6 from "@assets/teacher_6.png";

const CLASSROOM_DEFAULTS = [classroom1, classroom2, classroom3];
const TEACHER_DEFAULTS = [teacher1, teacher2, teacher3, teacher4, teacher5, teacher6];

export function getDefaultClassroomImage(id: number): string {
  return CLASSROOM_DEFAULTS[id % CLASSROOM_DEFAULTS.length];
}

export function getDefaultTeacherImage(id: number): string {
  return TEACHER_DEFAULTS[id % TEACHER_DEFAULTS.length];
}

export const TEACHER_PHOTO_MAP: Record<string, string> = {
  "林佳慧": teacher1,
  "陳志明": teacher2,
  "王雅琪": teacher3,
  "張育銘": teacher4,
  "李美玲": teacher5,
  "黃建宏": teacher6,
};

export function getCoachPhoto(name: string, id?: number, photoUrl?: string | null): string {
  if (photoUrl) return photoUrl;
  if (TEACHER_PHOTO_MAP[name]) return TEACHER_PHOTO_MAP[name];
  return getDefaultTeacherImage(id ?? (name.length > 0 ? name.charCodeAt(0) : 0));
}
