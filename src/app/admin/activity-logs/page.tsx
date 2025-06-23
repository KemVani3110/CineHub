import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback} from "@/components/ui/avatar";
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

const ITEMS_PER_PAGE = 10;

async function getActivityLogs(page: number = 1) {
  const offset = (page - 1) * ITEMS_PER_PAGE;
  
  const [rows] = await db.query(`
    SELECT 
      al.id,
      al.admin_id,
      al.action,
      al.target_user_id,
      al.description,
      al.metadata,
      al.ip_address,
      al.created_at,
      u.name as admin_name,
      u.email as admin_email,
      tu.name as target_user_name,
      tu.email as target_user_email
    FROM admin_activity_logs al
    LEFT JOIN users u ON al.admin_id = u.id
    LEFT JOIN users tu ON al.target_user_id = tu.id
    ORDER BY al.created_at DESC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
  `);
  
  const [countResult] = await db.query(`
    SELECT COUNT(*) as total
    FROM admin_activity_logs
  `);
  
  const total = (countResult as any)[0].total;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  
  return {
    logs: rows,
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
  const session = await getServerSession(authOptions);
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

      {/* Activity Logs Table */}
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
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-700/50 border-slate-600">
                  <TableHead className="min-w-[200px] text-slate-300">Admin</TableHead>
                  <TableHead className="min-w-[140px] text-slate-300">Action</TableHead>
                  <TableHead className="min-w-[200px] hidden md:table-cell text-slate-300">Target User</TableHead>
                  <TableHead className="min-w-[300px] hidden lg:table-cell text-slate-300">Description</TableHead>
                  <TableHead className="min-w-[120px] hidden xl:table-cell text-slate-300">IP Address</TableHead>
                  <TableHead className="min-w-[160px] text-slate-300">Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(logs as any).map((log: any) => (
                  <TableRow key={log.id} className="hover:bg-slate-700/30 transition-colors border-slate-600">
                    {/* Admin Column */}
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {getUserInitials(log.admin_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate text-white">
                            {log.admin_name || 'Unknown Admin'}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {log.admin_email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Action Column */}
                    <TableCell>
                      <Badge
                        variant={getActionVariant(log.action)}
                        className="flex items-center space-x-1 w-fit cursor-pointer hover:opacity-80"
                      >
                        {getActionIcon(log.action)}
                        <span className="text-xs">{log.action}</span>
                      </Badge>
                    </TableCell>

                    {/* Target User Column */}
                    <TableCell className="hidden md:table-cell">
                      {log.target_user_name ? (
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-slate-600 text-slate-300 text-xs">
                              {getUserInitials(log.target_user_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate text-white">
                              {log.target_user_name}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                              {log.target_user_email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">No target</span>
                      )}
                    </TableCell>

                    {/* Description Column */}
                    <TableCell className="hidden lg:table-cell">
                      <div className="max-w-md">
                        <p className="text-sm text-slate-300 line-clamp-2">
                          {log.description}
                        </p>
                      </div>
                    </TableCell>

                    {/* IP Address Column */}
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex items-center space-x-1 text-sm text-slate-400">
                        <Globe className="h-3 w-3" />
                        <span className="font-mono">{log.ip_address}</span>
                      </div>
                    </TableCell>

                    {/* Date Column */}
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <div>
                          <div className="font-medium text-white">
                            {format(new Date(log.created_at), "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-slate-400">
                            {format(new Date(log.created_at), "HH:mm")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Empty State */}
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
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <PaginationComponent 
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
            />
          )}
        </CardContent>
      </Card>

      {/* Mobile-specific responsive cards for smaller screens */}
      <div className="block md:hidden space-y-4">
        <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
        {(logs as any).map((log: any) => (
          <Card key={log.id} className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
            <div className="space-y-3">
              {/* Admin info */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getUserInitials(log.admin_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-white">{log.admin_name}</p>
                  <p className="text-xs text-slate-400 truncate">{log.admin_email}</p>
                </div>
                <Badge variant={getActionVariant(log.action)} className="flex items-center space-x-1 cursor-pointer">
                  {getActionIcon(log.action)}
                  <span className="text-xs">{log.action}</span>
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-300">{log.description}</p>

              {/* Target user if exists */}
              {log.target_user_name && (
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <User className="h-3 w-3" />
                  <span>Target: {log.target_user_name}</span>
                </div>
              )}

              {/* Footer info */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-600">
                <div className="flex items-center space-x-1">
                  <Globe className="h-3 w-3" />
                  <span className="font-mono">{log.ip_address}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(log.created_at), "MMM d, HH:mm")}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {/* Mobile Pagination */}
        {pagination.totalPages > 1 && (
          <Card className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 border-primary/20">
            <PaginationComponent 
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
            />
          </Card>
        )}
      </div>
    </div>
  );
}