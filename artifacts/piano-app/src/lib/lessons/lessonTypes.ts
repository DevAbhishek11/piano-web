export type LessonStep = {
  text: string;
  expectedNote?: string; // e.g. "C4"
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  steps: LessonStep[];
};
