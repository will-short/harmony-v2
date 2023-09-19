import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  {
    params,
  }: { params: { serverId: string; channelId: string; messageId: string } }
) {
  try {
    const profile = await currentProfile();
    const { content } = await req.json();
    const { serverId, channelId } = params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID Missing", { status: 400 });
    }

    if (!content) {
      return new NextResponse("Content Missing", { status: 400 });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return new NextResponse("Server Not Found", { status: 404 });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId,
        serverId,
      },
    });

    if (!channel) {
      return new NextResponse("Channel Not Found", { status: 404 });
    }

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return new NextResponse("Member Not Found", { status: 404 });
    }

    const message = await db.message.update({
      where: {
        id: params.messageId,
        memberId: member.id,
      },
      data: {
        content,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json(message);
  } catch (e) {
    console.log("[MESSAGES_PATCH]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  {
    params,
  }: { params: { serverId: string; channelId: string; messageId: string } }
) {
  try {
    const profile = await currentProfile();
    const { serverId, channelId } = params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID Missing", { status: 400 });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return new NextResponse("Server Not Found", { status: 404 });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId,
        serverId,
      },
    });

    if (!channel) {
      return new NextResponse("Channel Not Found", { status: 404 });
    }

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return new NextResponse("Member Not Found", { status: 404 });
    }

    const messageCheck = await db.message.findFirst({
      where: {
        id: params.messageId,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const canDelete =
      member.role === MemberRole.ADMIN ||
      member.role === MemberRole.MODERATOR ||
      messageCheck?.memberId === member.id;

    if (!canDelete) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const message = await db.message.update({
      where: {
        id: params.messageId,
      },
      data: {
        fileUrl: null,
        content: "This message has been deleted.",
        deleted: true,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    return NextResponse.json(message);
  } catch (e) {
    console.log("[MESSAGES_DELETE]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
