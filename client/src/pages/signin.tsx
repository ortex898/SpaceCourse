import { useState } from 'react';
import { useLocation } from "wouter";
import { RocketIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setLocation('/dashboard');
      } else {
        // Handle non-ok responses, e.g., display an error message
        console.error("Login failed:", response.status);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black bg-[url('/stars.png')] flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-black/50 backdrop-blur-sm p-8 rounded-lg w-96 space-y-6">
        <h1 className="text-3xl font-orbitron text-white text-center mb-8">Sign In</h1>

        <Input
          type="email"
          placeholder="Email"
          className="bg-white/10 text-white border-white/20"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <Input
          type="password"
          placeholder="Password"
          className="bg-white/10 text-white border-white/20"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full font-orbitron group">
          Launch
          <RocketIcon className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Button>
      </form>
    </div>
  );
}