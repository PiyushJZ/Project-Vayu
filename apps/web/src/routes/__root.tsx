import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";

import "../index.css";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "Vayu",
      },
      {
        name: "description",
        content:
          "Turn raw air quality tables into local actions, a briefing note and a citizen advisory.",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/vayu-logo.svg",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="flex min-h-svh flex-col">
          <Header />
          <main id="main" className="flex flex-1 flex-col pt-(--nav)">
            <Outlet />
          </main>
          <footer className="wrap flex flex-col gap-x-8 gap-y-1 border-t py-6 t-small text-muted-foreground lg:flex-row lg:justify-between">
            <p>Bands follow the CPCB National Air Quality Index for PM2.5.</p>
            <p>A brief does not replace official CPCB or SAFAR bulletins or medical advice.</p>
          </footer>
        </div>
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
    </>
  );
}
