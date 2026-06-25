import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import FreePlayPage from "@/pages/FreePlayPage";
import LearnPage from "@/pages/LearnPage";
import RecordingsPage from "@/pages/RecordingsPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/not-found";
import { cn } from "@/lib/utils";

function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Free Play" },
    { href: "/learn", label: "Learn" },
    { href: "/recordings", label: "Recordings" },
    { href: "/profile", label: "Profile" },
    { href: "/settings", label: "Settings" }
  ];

  return (
    <nav className="shrink-0 w-full bg-card border-b border-border px-4 py-2 flex gap-2 justify-center overflow-x-auto">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
            location === link.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        {/* Use h-[100dvh] so all children can reference a real height with h-full */}
        <div className="h-[100dvh] flex flex-col bg-background text-foreground transition-colors duration-300 overflow-hidden">
          <Navigation />
          {/* min-h-0 prevents flex children from overflowing; overflow-y-auto for scrollable pages */}
          <main className="flex-1 min-h-0 relative overflow-y-auto">
            <Switch>
              <Route path="/" component={FreePlayPage} />
              <Route path="/learn" component={LearnPage} />
              <Route path="/recordings" component={RecordingsPage} />
              <Route path="/profile" component={ProfilePage} />
              <Route path="/settings" component={SettingsPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
