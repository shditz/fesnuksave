"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-purple-200 border-b shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <div className="flex">
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-700 text-2xl tracking-tight">
                  FesnukSave
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
