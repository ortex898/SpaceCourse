
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages";
import SignupPage from "@/pages/signup";
import SigninPage from "@/pages/signin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-r from-blue-950 to-black">
        <Router>
          <Navbar />
          <Route path="/" component={HomePage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/signin" component={SigninPage} />
          <Route component={NotFound} />
        </Router>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
