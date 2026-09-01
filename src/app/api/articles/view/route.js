import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { slug, id } = body;

    if (!slug && !id) {
      return NextResponse.json(
        { success: false, error: "Slug atau ID artikel wajib disertakan" },
        { status: 400 }
      );
    }

    try {
      const where = slug ? { slug } : { id: Number(id) };
      const updated = await prisma.article.update({
        where,
        data: {
          views: { increment: 1 },
        },
        select: {
          id: true,
          slug: true,
          title: true,
          views: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          slug: updated.slug,
          views: updated.views,
        },
      });
    } catch (dbErr) {
      console.warn("Database increment views warning:", dbErr.message);
      return NextResponse.json({
        success: true,
        data: { slug, views: 1 },
        isFallback: true,
      });
    }
  } catch (error) {
    console.error("Error incrementing article views:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui view artikel" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    if (!slug && !id) {
      return NextResponse.json(
        { success: false, error: "Slug atau ID artikel wajib disertakan" },
        { status: 400 }
      );
    }

    const where = slug ? { slug } : { id: Number(id) };
    const article = await prisma.article.findUnique({
      where,
      select: { id: true, slug: true, views: true },
    });

    return NextResponse.json({
      success: true,
      data: article || { slug, views: 0 },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
