import { PrismaClient } from "@prisma/client";
import { blogPostsData } from "./blog-data.mjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Upserting GM Reforma Express case study blog post into database...");

  // 1. Clean up old Pacha Tattoo post if present
  try {
    const oldPacha = await prisma.post.findUnique({
      where: { slug: "como-se-hizo-la-web-de-pacha-tattoo" },
    });
    if (oldPacha) {
      await prisma.postTranslation.deleteMany({
        where: { postId: oldPacha.id },
      });
      await prisma.post.delete({
        where: { id: oldPacha.id },
      });
      console.log("Cleaned up previous Pacha Tattoo post from database.");
    }
  } catch (err) {
    console.warn("Notice during cleanup:", err);
  }

  // 2. Upsert GM Reforma Express post
  const p = blogPostsData.find((item) => item.slug === "como-se-hizo-la-web-de-gm-reforma-express");
  if (!p) {
    throw new Error("GM Reforma Express blog post not found in blogPostsData");
  }

  const post = await prisma.post.upsert({
    where: { slug: p.slug },
    create: {
      slug: p.slug,
      categoryKey: p.categoryKey,
      authorName: p.authorName,
      status: p.status,
      featuredImage: p.featuredImage,
      readingTime: p.readingTime,
      publishedAt: p.publishedAt,
    },
    update: {
      categoryKey: p.categoryKey,
      authorName: p.authorName,
      status: p.status,
      featuredImage: p.featuredImage,
      readingTime: p.readingTime,
      publishedAt: p.publishedAt,
    },
  });

  console.log(`Post upserted with ID: ${post.id}`);

  for (const [locale, t] of Object.entries(p.translations)) {
    const translation = await prisma.postTranslation.upsert({
      where: {
        postId_locale: {
          postId: post.id,
          locale,
        },
      },
      create: {
        postId: post.id,
        locale,
        slug: t.slug,
        title: t.title,
        excerpt: t.excerpt,
        content: t.content,
        seoTitle: t.seoTitle,
        seoDesc: t.seoDesc,
      },
      update: {
        slug: t.slug,
        title: t.title,
        excerpt: t.excerpt,
        content: t.content,
        seoTitle: t.seoTitle,
        seoDesc: t.seoDesc,
      },
    });

    console.log(`  [${locale}] (${translation.slug}) -> ${translation.title}`);
  }

  console.log("Successfully seeded GM Reforma Express post in all 4 languages!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
