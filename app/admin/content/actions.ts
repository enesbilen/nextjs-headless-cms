"use server";

import { invalidate } from "@/core/cache";
import { db } from "@/core/db";
import { normalizePath } from "@/core/resolve";
import {
  generateSlug,
  isValidSlug,
  normalizeSlugInput,
} from "@/core/slug";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type Status = "DRAFT" | "PUBLISHED";

function invalidateContent(slug: string) {
  invalidate(normalizePath("/" + slug));
}

export async function createContent(formData: FormData) {
  const title = (formData.get("title") as string)?.trim() || "";
  let slugRaw = (formData.get("slug") as string)?.trim() || "";
  const body = (formData.get("body") as string) || "";
  const status = ((formData.get("status") as string) === "PUBLISHED"
    ? "PUBLISHED"
    : "DRAFT") as Status;

  if (!title) {
    return { error: "Başlık gerekli" };
  }

  const slug = slugRaw ? normalizeSlugInput(slugRaw) : generateSlug(title);
  if (!isValidSlug(slug) || slug === "/") {
    return { error: "Geçersiz slug: boş, \"/\" veya boşluk/uppercase kullanılamaz" };
  }

  const existing = await db.page.findUnique({ where: { slug } });
  if (existing) {
    return { error: "Bu slug zaten kullanılıyor" };
  }

  const content = await db.page.create({
    data: { title, slug, body, status },
  });

  if (status === "PUBLISHED") {
    invalidateContent(content.slug);
  }

  revalidatePath("/admin");
  redirect(`/admin/content/${content.id}`);
}

export async function updateContent(
  id: string,
  previousStatus: Status,
  formData: FormData
) {
  const title = (formData.get("title") as string)?.trim() || "";
  let slugRaw = (formData.get("slug") as string)?.trim() || "";
  const body = (formData.get("body") as string) || "";
  const statusParam = formData.get("status") as string;
  const status: Status =
    statusParam === "UNPUBLISH"
      ? "DRAFT"
      : statusParam === "PUBLISHED"
        ? "PUBLISHED"
        : "DRAFT";

  if (!title) {
    return { error: "Başlık gerekli" };
  }

  const slug = slugRaw ? normalizeSlugInput(slugRaw) : generateSlug(title);
  if (!isValidSlug(slug) || slug === "/") {
    return { error: "Geçersiz slug: boş, \"/\" veya boşluk/uppercase kullanılamaz" };
  }

  const duplicate = await db.page.findFirst({
    where: { slug, id: { not: id } },
  });
  if (duplicate) {
    return { error: "Bu slug zaten başka bir içerikte kullanılıyor" };
  }

  const content = await db.page.update({
    where: { id },
    data: { title, slug, body, status },
  });

  if (status === "PUBLISHED" || previousStatus === "PUBLISHED") {
    invalidateContent(content.slug);
  }

  revalidatePath("/admin");
  redirect(`/admin/content/${content.id}`);
}
