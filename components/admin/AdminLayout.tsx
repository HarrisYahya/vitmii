"use client";

import { ReactNode } from "react";

export default function AdminLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {children}
      </div>
    </div>
  );
}
