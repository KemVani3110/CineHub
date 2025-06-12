import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
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
  Eye
} from "lucide-react";

async function getActivityLogs() {
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
    LIMIT 100
  `);
  return rows;
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

export default async function ActivityLogs() {
  const session = await getServerSession(authOptions);
  const logs = await getActivityLogs();

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
            <p className="text-muted-foreground">
              Monitor admin activities and system changes
            </p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total Activities</p>
                  <p className="text-2xl font-bold">{(logs as any).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Critical Actions</p>
                  <p className="text-2xl font-bold">
                    {(logs as any).filter((log: any) => 
                      log.action.toLowerCase().includes('delete')
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Active Admins</p>
                  <p className="text-2xl font-bold">
                    {new Set((logs as any).map((log: any) => log.admin_id)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activities</span>
          </CardTitle>
          <CardDescription>
            Latest 100 admin activities in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="min-w-[200px]">Admin</TableHead>
                  <TableHead className="min-w-[140px]">Action</TableHead>
                  <TableHead className="min-w-[200px] hidden md:table-cell">Target User</TableHead>
                  <TableHead className="min-w-[300px] hidden lg:table-cell">Description</TableHead>
                  <TableHead className="min-w-[120px] hidden xl:table-cell">IP Address</TableHead>
                  <TableHead className="min-w-[160px]">Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(logs as any).map((log: any) => (
                  <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                    {/* Admin Column */}
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {getUserInitials(log.admin_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">
                            {log.admin_name || 'Unknown Admin'}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {log.admin_email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Action Column */}
                    <TableCell>
                      <Badge
                        variant={getActionVariant(log.action)}
                        className="flex items-center space-x-1 w-fit"
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
                            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                              {getUserInitials(log.target_user_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">
                              {log.target_user_name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {log.target_user_email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No target</span>
                      )}
                    </TableCell>

                    {/* Description Column */}
                    <TableCell className="hidden lg:table-cell">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                          {log.description}
                        </p>
                      </div>
                    </TableCell>

                    {/* IP Address Column */}
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        <span className="font-mono">{log.ip_address}</span>
                      </div>
                    </TableCell>

                    {/* Date Column */}
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {format(new Date(log.created_at), "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">
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
              <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No activity logs found
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                When admin activities occur, they will appear here for monitoring and audit purposes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile-specific responsive cards for smaller screens */}
      <div className="block md:hidden space-y-4">
        <h3 className="text-lg font-semibold">Recent Activities</h3>
        {(logs as any).map((log: any) => (
          <Card key={log.id} className="p-4">
            <div className="space-y-3">
              {/* Admin info */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getUserInitials(log.admin_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{log.admin_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{log.admin_email}</p>
                </div>
                <Badge variant={getActionVariant(log.action)} className="flex items-center space-x-1">
                  {getActionIcon(log.action)}
                  <span className="text-xs">{log.action}</span>
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-900 dark:text-gray-100">{log.description}</p>

              {/* Target user if exists */}
              {log.target_user_name && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>Target: {log.target_user_name}</span>
                </div>
              )}

              {/* Footer info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
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
      </div>
    </div>
  );
}