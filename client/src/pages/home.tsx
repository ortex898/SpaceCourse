import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to User Management
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A simple user management system built with React and Express
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 w-full max-w-2xl">
        <Link href="/users">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                View Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Browse and manage existing users in the system
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/users/create">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle>Create User</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add new users to the system
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex justify-center">
        <Link href="/users/create">
          <Button size="lg" className="gap-2">
            Get Started
            <Users className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
