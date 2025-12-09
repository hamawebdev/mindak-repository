import { ThemeManager } from "./_components/theme-manager";

export default function PodcastConfigurationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Podcast Configuration</h1>
        <p className="text-muted-foreground">
          Manage podcast configuration settings including themes, decors, packs, and supplements.
        </p>
      </div>

      <div className="space-y-8">
        <ThemeManager />
      </div>
    </div>
  );
}
