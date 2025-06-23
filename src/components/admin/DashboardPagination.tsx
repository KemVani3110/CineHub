"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const DASHBOARD_ITEMS_PER_PAGE = 5;

interface DashboardPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export function DashboardPaginationComponent({ currentPage, totalPages, totalItems }: DashboardPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('activityPage', page.toString());
    return `/admin/dashboard?${params.toString()}`;
  };

  const handlePageChange = (url: string) => {
    router.push(url, { scroll: false });
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  
  const startItem = (currentPage - 1) * DASHBOARD_ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * DASHBOARD_ITEMS_PER_PAGE, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-600">
      <div className="text-sm text-slate-400">
        Showing {startItem} to {endItem} of {totalItems} recent activities
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isFirstPage}
          className="cursor-pointer disabled:cursor-not-allowed bg-slate-800 border-slate-600 text-slate-300 hover:bg-primary/20 hover:border-primary/40 hover:text-primary disabled:opacity-50"
          asChild={!isFirstPage}
        >
          {isFirstPage ? (
            <span><ChevronsLeft className="h-4 w-4" /></span>
          ) : (
            <span onClick={() => handlePageChange(createPageUrl(1))}>
              <ChevronsLeft className="h-4 w-4" />
            </span>
          )}
        </Button>
        
        <Button
          variant="outline" 
          size="sm"
          disabled={isFirstPage}
          className="cursor-pointer disabled:cursor-not-allowed bg-slate-800 border-slate-600 text-slate-300 hover:bg-primary/20 hover:border-primary/40 hover:text-primary disabled:opacity-50"
          asChild={!isFirstPage}
        >
          {isFirstPage ? (
            <span><ChevronLeft className="h-4 w-4" /></span>
          ) : (
            <span onClick={() => handlePageChange(createPageUrl(currentPage - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {(() => {
            const pages = [];
            const showPages = 3; // Fewer pages for dashboard
            let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
            const endPage = Math.min(totalPages, startPage + showPages - 1);
            
            if (endPage - startPage < showPages - 1) {
              startPage = Math.max(1, endPage - showPages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <Button
                  key={i}
                  variant={i === currentPage ? "default" : "outline"}
                  size="sm"
                  className={`cursor-pointer min-w-[2.5rem] ${
                    i === currentPage 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-primary/20 hover:border-primary/40 hover:text-primary"
                  }`}
                  asChild={i !== currentPage}
                >
                  {i === currentPage ? (
                    <span>{i}</span>
                  ) : (
                    <span onClick={() => handlePageChange(createPageUrl(i))}>{i}</span>
                  )}
                </Button>
              );
            }
            return pages;
          })()}
        </div>

        <Button
          variant="outline"
          size="sm" 
          disabled={isLastPage}
          className="cursor-pointer disabled:cursor-not-allowed bg-slate-800 border-slate-600 text-slate-300 hover:bg-primary/20 hover:border-primary/40 hover:text-primary disabled:opacity-50"
          asChild={!isLastPage}
        >
          {isLastPage ? (
            <span><ChevronRight className="h-4 w-4" /></span>
          ) : (
            <span onClick={() => handlePageChange(createPageUrl(currentPage + 1))}>
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          disabled={isLastPage}
          className="cursor-pointer disabled:cursor-not-allowed bg-slate-800 border-slate-600 text-slate-300 hover:bg-primary/20 hover:border-primary/40 hover:text-primary disabled:opacity-50"
          asChild={!isLastPage}
        >
          {isLastPage ? (
            <span><ChevronsRight className="h-4 w-4" /></span>
          ) : (
            <span onClick={() => handlePageChange(createPageUrl(totalPages))}>
              <ChevronsRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
} 