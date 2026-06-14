"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { CategoryScore } from "@/lib/types";

export default function MaturityRadar({ scores }: { scores: CategoryScore[] }) {
  const data = scores.map((s) => ({ category: s.ownerLabel, score: s.scorePct }));
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#dbe2ee" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fontSize: 12, fill: "#44516a" }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="score"
            stroke="#2563eb"
            fill="#38bdf8"
            fillOpacity={0.45}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
