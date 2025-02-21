
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto flex h-[80vh] flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-white">404 - Page Not Found</h1>
      <p className="mt-4 text-lg text-gray-300">The page you're looking for doesn't exist.</p>
      <Button
        className="mt-8"
        onClick={() => setLocation("/")}
      >
        Go Home
      </Button>
    </div>
  );
}
