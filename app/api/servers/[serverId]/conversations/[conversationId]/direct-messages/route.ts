import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { DirectMessage, Message } from "@prisma/client";
import { NextResponse } from "next/server";

const MESSAGES_BATCH = 15;

export async function POST(
  req: Request,
  { params }: { params: { serverId: string; conversationId: string } }
) {
  try {
    const profile = await currentProfile();
    const { content, fileUrl } = await req.json();
    const { serverId, conversationId } = params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!conversationId) {
      return new NextResponse("Conversation ID Missing", { status: 400 });
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

    const message = await db.directMessage.create({
      data: {
        userId: profile.id,
        conversationId,
        content,
        fileUrl,
        memberId: member.id,
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
    console.log("[DM_POST]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { serverId: string; conversationId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");

    const { conversationId } = params;

    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Conversation ID Missing", { status: 400 });
    }

    let messages: DirectMessage[] = [];

    if (cursor) {
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          conversationId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        where: {
          conversationId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    const nextCursor =
      messages.length === MESSAGES_BATCH
        ? messages[MESSAGES_BATCH - 1].id
        : null;

    return NextResponse.json({ items: messages, nextCursor });
  } catch (e) {
    console.log("[DM_GET]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
