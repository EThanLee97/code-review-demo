type ThemeName = "blue" | "emerald" | "rose" | "amber";

export const themes: Array<{
  name: ThemeName;
  label: string;
  swatch: string;
}> = [
  { name: "blue", label: "蓝色", swatch: "#2563eb" },
  { name: "emerald", label: "绿色", swatch: "#059669" },
  { name: "rose", label: "玫瑰", swatch: "#e11d48" },
  { name: "amber", label: "琥珀", swatch: "#d97706" },
];

export type { ThemeName };

export function ThemeSwitcher({
  activeTheme,
  onThemeChange,
}: {
  activeTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}) {
  return (
    <div
      aria-label="主题色切换"
      className="flex items-center gap-2 rounded-full border border-black/[.08] bg-white/80 px-2.5 py-2 shadow-sm backdrop-blur dark:border-white/[.14] dark:bg-zinc-950/75"
      role="group"
    >
      <span className="pr-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        主题色
      </span>
      {themes.map((theme) => (
        <button
          aria-label={`切换到${theme.label}主题色`}
          aria-pressed={activeTheme === theme.name}
          className="relative grid size-7 place-items-center rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          key={theme.name}
          onClick={() => onThemeChange(theme.name)}
          title={theme.label}
          type="button"
        >
          <span
            className="size-5 rounded-full border border-black/10 shadow-sm"
            style={{ backgroundColor: theme.swatch }}
          />
          {activeTheme === theme.name ? (
            <span className="absolute size-2 rounded-full bg-white shadow ring-1 ring-black/10" />
          ) : null}
        </button>
      ))}
    </div>
  );
}
