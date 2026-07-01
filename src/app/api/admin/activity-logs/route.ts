import { NextRequest, NextResponse } from "next/server";
import { listAdminLogs, requireAdmin } from "@/lib/admin-firestore";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = (searchParams.get("search") || "").toLowerCase();
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const action = searchParams.get("action") || "";

    let logs = await listAdminLogs();

    if (search) {
      logs = logs.filter((log) =>
        [
          log.admin_name,
          log.admin_email,
          log.target_user_name,
          log.target_user_email,
          log.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search)
      );
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      logs = logs.filter((log) => new Date(log.created_at).getTime() >= start);
    }

    if (endDate) {
      const end = new Date(endDate).getTime();
      logs = logs.filter((log) => new Date(log.created_at).getTime() <= end);
    }

    if (action) {
      logs = logs.filter((log) => log.action === action);
    }

    const total = logs.length;
    const offset = (page - 1) * limit;

    return NextResponse.json({
      logs: logs.slice(offset, offset + limit),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
