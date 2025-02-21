
import { Link } from "wouter";

export default function Navbar() {
  return (
    <nav className="bg-black/50 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <a className="text-white font-orbitron text-xl">SpaceCourse</a>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/signin">
            <a className="text-white hover:text-purple-400">Sign In</a>
          </Link>
          <Link href="/signup">
            <a className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              Sign Up
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
}
