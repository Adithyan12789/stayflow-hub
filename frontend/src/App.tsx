import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import HostDashboard from "./pages/HostDashboard";
import HostOnboardingPage from "./pages/HostOnboardingPage";
import { BookingsPage, LoginPage, RoomsPage, SignupPage, StaysPage } from "./pages/WorkspacePages";
import { ConnectedBookingsPage, ConnectedRoomsPage, ConnectedStaysPage } from "./pages/ConnectedWorkspacePages";
import GuestStayPage from "./pages/GuestStayPage";
import GuestProfilePage from "./pages/GuestProfilePage";
import GuestCheckoutPage from "./pages/GuestCheckoutPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/stay"} component={GuestStayPage} />
      <Route path={"/profile"} component={GuestProfilePage} />
      <Route path={"/checkout"} component={GuestCheckoutPage} />
      <Route path={"/confirmation/:id"} component={BookingConfirmationPage} />
      <Route path={"/dashboard"} component={HostDashboard} />
      <Route path={"/onboarding/host"} component={HostOnboardingPage} />
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/signup"} component={SignupPage} />
      <Route path={"/stays"} component={ConnectedStaysPage} />
      <Route path={"/rooms"} component={ConnectedRoomsPage} />
      <Route path={"/bookings"} component={ConnectedBookingsPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
