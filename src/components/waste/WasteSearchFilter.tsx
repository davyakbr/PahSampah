"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";

export default function WasteSearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset to page 1 on new search
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (cat) {
      params.set("category", cat);
    } else {
      params.delete("category");
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const categories = [
    { value: "", label: "Semua Kategori" },
    { value: "ORGANIK", label: "Organik" },
    { value: "ANORGANIK", label: "Non Organik" },
    { value: "B3", label: "B3" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full sm:max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Cari nama, deskripsi, atau lokasi..."
          className="input-theme w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        />
      </div>

      {/* Category Tabs / Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
        {categories.map((cat) => {
          const isActive = currentCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap focus:outline-none cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-250/70 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
