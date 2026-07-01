import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { listAdminLogs, listAdminUsers, requireAdmin } from "@/lib/admin-firestore";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const [users, logs, ratingsSnapshot, watchlistSnapshot] = await Promise.all([
      listAdminUsers(),
      listAdminLogs(),
      adminDb.collection("ratings").get(),
      adminDb.collection("watchlists").get(),
    ]);

    const usersByRole = users.reduce((acc: Record<string, number>, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const activityByType = logs.reduce((acc: Record<string, number>, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});

    const ratingValues = ratingsSnapshot.docs
      .map((doc) => Number(doc.data().rating))
      .filter((rating) => !Number.isNaN(rating));

    const averageRating = ratingValues.length
      ? Number(
          (
            ratingValues.reduce((sum, rating) => sum + rating, 0) /
            ratingValues.length
          ).toFixed(1)
        )
      : 0;

    return NextResponse.json({
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.isActive).length,
      usersByRole,
      recentActivity: logs.slice(0, 5),
      activityByType,
      totalActivities: logs.length,
      totalRatings: ratingsSnapshot.size,
      totalWatchlist: watchlistSnapshot.size,
      averageRating,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
