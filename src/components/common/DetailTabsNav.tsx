"use client";

import { LucideIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface DetailTabItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface DetailTabsNavProps {
  tabs: DetailTabItem[];
}

export default function DetailTabsNav({ tabs }: DetailTabsNavProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="rounded-2xl border border-slate-700/45 bg-slate-950/70 p-1.5 shadow-lg shadow-black/20 backdrop-blur-md">
        <ScrollArea className="w-full">
          <TabsList
            className={cn(
              "mx-auto grid h-auto min-w-max grid-flow-col auto-cols-[minmax(132px,1fr)] gap-1 border-0 bg-transparent p-0",
              "md:min-w-0 md:auto-cols-fr",
              tabs.length === 5 && "md:grid-cols-5",
              tabs.length === 6 && "md:grid-cols-6"
            )}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "group relative min-h-12 justify-center gap-2 rounded-xl border border-transparent px-3 py-3",
                    "text-xs font-semibold text-slate-300 transition-all duration-200",
                    "hover:border-cyan-300/25 hover:bg-cyan-300/10 hover:text-white",
                    "focus-visible:ring-cyan-300/40",
                    "data-[state=active]:border-cyan-300/45 data-[state=active]:bg-cyan-300/15",
                    "data-[state=active]:text-cyan-100 data-[state=active]:shadow-[inset_0_0_0_1px_rgba(103,232,249,0.18)]",
                    "sm:text-sm"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800/80 text-slate-400 transition-colors",
                      "group-hover:bg-cyan-300/15 group-hover:text-cyan-100",
                      "group-data-[state=active]:bg-cyan-300 group-data-[state=active]:text-slate-950"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="truncate">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <ScrollBar
            orientation="horizontal"
            className="mt-2 h-2 md:hidden"
          />
        </ScrollArea>
      </div>
    </div>
  );
}
