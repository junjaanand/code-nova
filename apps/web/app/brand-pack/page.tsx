"use client";

import React, { useState, useEffect } from "react";
import { BrandPackView } from "@/components/brand-pack/BrandPackView";
import { api } from "@/lib/api";

export default function BrandPackPage() {
  const [packData, setPackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getActiveBrandPack();
        setPackData(data);
      } catch (e) {
        console.error("Brand Pack load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xs text-slate-400">
        Loading Brand Pack & Knowledge Base...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <BrandPackView packData={packData} />
    </div>
  );
}
