export interface PostDTO {
  title?: string;
  content?: string;
  author?: number | { id: number };
  blog?: number | { id: number };
  categories?: string[];
}
