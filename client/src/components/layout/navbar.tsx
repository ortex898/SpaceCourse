import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <a className="text-xl font-bold text-primary">User Management</a>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/users">
              <Button variant="ghost" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </Button>
            </Link>
            <Link href="/users/create">
              <Button>Create User</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
