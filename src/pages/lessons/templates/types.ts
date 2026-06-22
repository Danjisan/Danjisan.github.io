export interface TemplateProps {
  lesson: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    category: string | null;
    template_type: string;
    metadata: Record<string, unknown>;
  };
  completed: boolean;
  onToggleComplete: () => void;
  markingDone: boolean;
}
