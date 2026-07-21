import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { 
  Activity, 
  User, 
  Clock, 
  Globe, 
  Shield,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { listAdminLogs } from "@/lib/admin-firestore";

const ITEMS_PER_PAGE = 5;

async function getActivityLogs(page: number = 1) {
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const allLogs = await listAdminLogs();
  const total = allLogs.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  
  return {
    logs: allLogs.slice(offset, offset + ITEMS_PER_PAGE),
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: ITEMS_PER_PAGE
    }
  };
}

function getActionIcon(action: string) {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('create')) return <Plus className="h-3 w-3" />;
  if (actionLower.includes('delete')) return <Trash2 className="h-3 w-3" />;
  if (actionLower.includes('edit') || actionLower.includes('update')) return <Edit className="h-3 w-3" />;
  if (actionLower.includes('view') || actionLower.includes('read')) return <Eye className="h-3 w-3" />;
  return <Activity className="h-3 w-3" />;
}

function getActionVariant(action: string) {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('delete')) return 'destructive';
  if (actionLower.includes('create')) return 'default';
  if (actionLower.includes('edit') || actionLower.includes('update')) return 'secondary';
  return 'outline';
}

function getUserInitials(name: string | null) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

function PaginationComponent({ currentPage, totalPages, totalItems }: PaginationProps) {
  const createPageUrl = (page: number) => {
    return `/admin/activity-logs?page=${page}`;
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-600">
      <div className="text-sm text-slate-400">
        Showing {startItem} to {endItem} of {totalItems} entries
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
            <Link href={createPageUrl(1)}>
              <ChevronsLeft className="h-4 w-4" />
            </Link>
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
            <Link href={createPageUrl(currentPage - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          )}
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {(() => {
            const pages = [];
            const showPages = 5;
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
                    <Link href={createPageUrl(i)}>{i}</Link>
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
            <Link href={createPageUrl(currentPage + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Link>
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
            <Link href={createPageUrl(totalPages)}>
              <ChevronsRight className="h-4 w-4" />
            </Link>
          )}
        </Button>
      </div>
    </div>
  );
}

export default async function ActivityLogs({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const { logs, pagination } = await getActivityLogs(currentPage);

  const criticalActions = (logs as any).filter((log: any) => 
    log.action.toLowerCase().includes('delete')
  ).length;

  const activeAdmins = new Set((logs as any).map((log: any) => log.admin_id)).size;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Activity Logs</h1>
            <p className="text-slate-400">
              Monitor admin activities and system changes
            </p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Total Activities</p>
                  <p className="text-2xl font-bold text-white">{pagination.totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Critical Actions</p>
                  <p className="text-2xl font-bold text-white">{criticalActions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Active Admins</p>
                  <p className="text-2xl font-bold text-white">{activeAdmins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="bg-slate-600" />

      {/* Activity Logs */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
        <CardHeader className="border-b border-slate-600">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Activity className="h-5 w-5" />
            <span>Recent Activities</span>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Page {pagination.currentPage} of {pagination.totalPages} - {pagination.totalItems} total activities
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {(logs as any).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                No activity logs found
              </h3>
              <p className="text-sm text-slate-400 max-w-md">
                When admin activities occur, they will appear here for monitoring and audit purposes.
              </p>
            </div>
          )}

          {(logs as any).length > 0 && (
            <div className="grid gap-3">
              {(logs as any).map((log: any) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-700 bg-slate-950/35 p-4 transition-colors hover:border-primary/40 hover:bg-slate-800/70"
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(190px,0.8fr)_minmax(0,1.6fr)_minmax(150px,auto)] lg:items-start">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-11 w-11 flex-shrink-0 border border-primary/20">
                        {log.admin_avatar && (
                          <AvatarImage
                            src={log.admin_avatar}
                            alt={log.admin_name || "Admin"}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {getUserInitials(log.admin_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">
                          {log.admin_name || "Unknown Admin"}
                        </div>
                        <div className="truncate text-xs text-slate-400">
                          {log.admin_email}
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={getActionVariant(log.action)}
                          className="flex h-8 w-fit cursor-pointer items-center gap-1 px-3 hover:opacity-80"
                        >
                          {getActionIcon(log.action)}
                          <span className="text-xs">{log.action}</span>
                        </Badge>

                        {log.target_user_name ? (
                          <div className="flex min-w-0 max-w-full items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 sm:max-w-[360px]">
                            <Avatar className="h-7 w-7 flex-shrink-0">
                              {log.target_user_avatar && (
                                <AvatarImage
                                  src={log.target_user_avatar}
                                  alt={log.target_user_name || "User"}
                                  className="object-cover"
                                />
                              )}
                              <AvatarFallback className="bg-slate-600 text-slate-300 text-xs">
                                {getUserInitials(log.target_user_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-white">
                                {log.target_user_name}
                              </div>
                              <div className="truncate text-xs text-slate-400">
                                {log.target_user_email}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-sm text-slate-400">
                            <User className="h-4 w-4" />
                            <span>No target</span>
                          </div>
                        )}
                      </div>

                      <p className="min-w-0 text-sm leading-6 text-slate-300">
                        {log.description}
                      </p>

                      <div className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate font-mono">
                          {log.ip_address || "Unknown"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm lg:justify-end">
                      <Clock className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      <div>
                        <div className="font-medium text-white">
                          {format(new Date(log.created_at), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-slate-400">
                          {format(new Date(log.created_at), "HH:mm")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <PaginationComponent 
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
