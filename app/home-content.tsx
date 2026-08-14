"use client";

import Image from "next/image";
import { useState } from "react";
import { type ThemeName, ThemeSwitcher } from "./theme-switcher";

export function HomeContent() {
  const [activeTheme, setActiveTheme] = useState<ThemeName>("blue");

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center bg-accent-muted font-sans transition-colors duration-300 dark:bg-background"
      data-theme={activeTheme}
    >
      <main className="flex min-h-dvh w-full max-w-3xl flex-1 flex-col items-center justify-between bg-surface px-8 py-12 transition-colors duration-300 sm:items-start sm:px-16 sm:py-24">
        <header className="flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Image
            className="h-5 w-[100px] dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <ThemeSwitcher
            activeTheme={activeTheme}
            onThemeChange={setActiveTheme}
          />
        </header>
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <div className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent">
            AI Code Review Demo
          </div>
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground">
            To get started, edit the{" "}
            <code className="rounded bg-accent-muted px-1.5 py-0.5 font-mono text-[0.9em] text-accent">
              page.tsx
            </code>{" "}
            file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-text-muted">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-accent-foreground transition-colors hover:brightness-95 md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="h-[14px] w-4 invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-border-subtle px-5 text-foreground transition-colors hover:border-transparent hover:bg-accent-soft md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
