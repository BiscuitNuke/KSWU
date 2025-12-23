export interface Project {
  slug: string;
  title: string;
  description: string;
  date?: string;
  url?: string;
  repository?: string;
  published: boolean;
  body: {
    code: string;
  };
}
