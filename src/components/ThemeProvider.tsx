"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // @ts-ignore
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
