import { useState } from 'react';
import { useLocation } from 'wouter';
import { RocketIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function SignUp() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setLocation('/dashboard');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black bg-[url('/stars.png')] flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-black/50 backdrop-blur-sm p-8 rounded-lg w-96 space-y-6">
        <h1 className="text-3xl font-orbitron text-white text-center mb-8">Sign Up</h1>

        <Input
          type="email"
          placeholder="Email"
          className="bg-white/10 text-white border-white/20"
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
        />

        <Input
          type="password"
          placeholder="Password"
          className="bg-white/10 text-white border-white/20"
          value={formData.password}
          onChange={e => setFormData({...formData, password: e.target.value})}
        />

        <Select value={formData.role} onValueChange={value => setFormData({...formData, role: value})}>
          <SelectTrigger className="bg-white/10 text-white border-white/20">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="instructor">Instructor</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" className="w-full font-orbitron group">
          Launch
          <RocketIcon className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Button>
      </form>
    </div>
  );
}