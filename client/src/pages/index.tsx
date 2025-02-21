
import { useEffect, useState } from 'react';
import { Course, LiveSession } from '@shared/schema';

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Fetch featured courses
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data.slice(0, 6))); // Show first 6 courses

    // Fetch upcoming sessions
    fetch('/api/live-sessions')
      .then(res => res.json())
      .then(data => setSessions(data));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-950 to-black bg-[url('/stars.png')] p-8">
      <h1 className="text-4xl font-orbitron text-white text-center mb-8">
        Explore SpaceCourse
      </h1>
      
      <div className="max-w-2xl mx-auto mb-12">
        <input
          type="text"
          placeholder="Search courses..."
          className="w-full p-4 rounded-lg bg-black/50 text-white border-2 border-blue-400 focus:ring-2 focus:ring-purple-600 focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-orbitron text-white mb-6">Featured Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {courses.map(course => (
            <div key={course.id} className="bg-purple-600 rounded-full text-white p-4 shadow-lg shadow-purple-400/50 flex flex-col items-center text-center transform hover:scale-105 transition">
              <h3 className="text-xl font-bold mb-2">{course.title}</h3>
              <p className="text-sm opacity-80">{course.description}</p>
              <p className="mt-4 font-bold">${course.price}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-orbitron text-white mb-6">Upcoming Live Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map(session => (
            <div key={session.id} className="bg-orange-500 text-white p-4 rounded-lg hover:animate-bounce transform hover:scale-105 transition">
              <h3 className="text-lg font-bold">{session.courseId}</h3>
              <p className="text-sm">
                {new Date(session.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
