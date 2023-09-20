import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: {
      serverId: string;
      conversationId: string;
      directMessageId: string;
    };
  }
) {
  try {
    const profile = await currentProfile();
    const { content } = await req.json();
    const { serverId, conversationId, directMessageId } = params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!conversationId) {
      return new NextResponse("Channel ID Missing", { status: 400 });
    }

    if (!content) {
      return new NextResponse("Content Missing", { status: 400 });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { memberOne: { profileId: profile.id } },
          { memberTwo: { profileId: profile.id } },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation) {
      return new NextResponse("Conversation Not Found", { status: 404 });
    }

    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return new NextResponse("Member Not Found", { status: 404 });
    }

    const message = await db.directMessage.update({
      where: {
        id: directMessageId,
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
    console.log("[DM_PATCH]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  {
    params,
  }: {
    params: {
      serverId: string;
      conversationId: string;
      directMessageId: string;
    };
  }
) {
  try {
    const profile = await currentProfile();
    const { serverId, conversationId, directMessageId } = params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { memberOne: { profileId: profile.id } },
          { memberTwo: { profileId: profile.id } },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation) {
      return new NextResponse("Conversation Not Found", { status: 404 });
    }

    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return new NextResponse("Member Not Found", { status: 404 });
    }

    const messageCheck = await db.directMessage.findFirst({
      where: {
        id: directMessageId,
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

    const message = await db.directMessage.update({
      where: {
        id: directMessageId,
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
    console.log("[DM_DELETE]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
