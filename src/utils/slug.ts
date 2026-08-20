/** "Things To Do" -> "things-to-do", "Shows & Events" -> "shows-events". */
export const categorySlug = (name: string): string =>
  name.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-');
