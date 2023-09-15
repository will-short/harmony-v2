import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

type ParamType = { params: { memberId: string; serverId: string } };

export async function DELETE(_req: Request, { params }: ParamType) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params?.serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!params?.memberId) {
      return new NextResponse("Member ID Missing", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          delete: {
            id: params.memberId,
            profileId: {
              not: profile.id,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (e) {
    console.log("[MEMBER_ID_DELETE]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: ParamType) {
  try {
    const profile = await currentProfile();
    const { role } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params?.serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!params?.memberId) {
      return new NextResponse("Member ID Missing", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          update: {
            where: {
              id: params.memberId,
              profileId: {
                not: profile.id,
              },
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (e) {
    console.log("[MEMBER_ID]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
