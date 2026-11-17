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
  /** Utilizatorul logat (null pentru vizitatori) — pentru progres salvat per user */
  userId?: string | null;
  completed: boolean;
  onToggleComplete: () => void;
  markingDone: boolean;
  /** Progresul s-a salvat pe server (XP, lecție finalizată): pagina reîncarcă profilul și starea. */
  onProgressChange?: () => void;
}
