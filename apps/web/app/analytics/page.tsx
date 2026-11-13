"use client";

import React, { useState, useEffect } from "react";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { api } from "@/lib/api";

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getAnalytics();
        setAnalyticsData(data);
      } catch (e) {
        console.error("Analytics load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xs text-slate-400">
        Loading governance analytics & health index...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <AnalyticsView data={analyticsData} />
    </div>
  );
}
