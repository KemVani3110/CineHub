import { NextRequest, NextResponse } from "next/server";
import { adminDb, serverTimestamp } from "@/lib/firebase-admin";
import {
  deleteFirebaseAuthUser,
  findUserDocByNumericId,
  listAdminUsers,
  requireAdmin,
  serializeAdminUser,
  writeAdminActivityLog,
} from "@/lib/admin-firestore";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const users = await listAdminUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    const { userId, role, isActive } = await request.json();

    const targetDoc = await findUserDocByNumericId(userId);
    if (!targetDoc?.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetData = targetDoc.data() || {};
    if (targetDoc.id === admin.id && role !== "admin") {
      return NextResponse.json(
        { error: "Cannot change your own admin role" },
        { status: 403 }
      );
    }

    if (role === "admin" && targetData.role !== "admin") {
      return NextResponse.json(
        { error: "Cannot promote users to admin role" },
        { status: 403 }
      );
    }

    if (targetData.role === "admin" && !isActive) {
      return NextResponse.json(
        { error: "Cannot deactivate admin accounts" },
        { status: 403 }
      );
    }

    await targetDoc.ref.update({
      role,
      is_active: Boolean(isActive),
      updated_at: serverTimestamp(),
    });

    const updatedDoc = await targetDoc.ref.get();
    const updatedUser = serializeAdminUser(updatedDoc.id, updatedDoc.data() || {});

    await writeAdminActivityLog(
      admin,
      "UPDATE_USER",
      `Updated user ${updatedUser.name} (${updatedUser.email})`,
      request,
      {
        targetUserId: updatedUser.id,
        targetUserName: updatedUser.name,
        targetUserEmail: updatedUser.email,
        metadata: { role, isActive },
      }
    );

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    const { userId } = await request.json();

    const targetDoc = await findUserDocByNumericId(userId);
    if (!targetDoc?.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userToDelete = serializeAdminUser(targetDoc.id, targetDoc.data() || {});
    if (userToDelete.role === "admin") {
      return NextResponse.json(
        { error: "Cannot delete admin accounts" },
        { status: 403 }
      );
    }

    await writeAdminActivityLog(
      admin,
      "DELETE_USER",
      `Deleted user ${userToDelete.name} (${userToDelete.email})`,
      request,
      {
        targetUserId: userToDelete.id,
        targetUserName: userToDelete.name,
        targetUserEmail: userToDelete.email,
        metadata: { deletedUser: userToDelete },
      }
    );

    await Promise.all([
      targetDoc.ref.delete(),
      deleteFirebaseAuthUser(targetDoc.id),
      adminDb.collection("users_deleted").doc(targetDoc.id).set({
        ...userToDelete,
        deleted_at: serverTimestamp(),
        deleted_by: admin.id,
      }),
    ]);

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: userToDelete,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
