import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: { serverId: string; channelId: string } }
) {
  try {
    console.log(params);
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID Missing", { status: 404 });
    }

    if (!params.channelId) {
      return new NextResponse("Channel ID Missing", { status: 404 });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          delete: {
            id: params.channelId,
            name: {
              not: "general",
            },
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (e) {
    console.log("[DELETE_CHANNEL]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string; channelId: string } }
) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID Missing", { status: 404 });
    }

    if (!params.channelId) {
      return new NextResponse("Channel ID Missing", { status: 404 });
    }

    if (name === "general") {
      return new NextResponse("Channel Name is Reserved", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: params.channelId,
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (e) {
    console.log("[PATCH_CHANNEL_ID]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
