import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { hash } from "bcryptjs";

function getAdapter() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const u = new URL(url);
  return new PrismaMariaDb({
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: u.username,
    password: u.password,
    database: u.pathname.slice(1) || undefined,
  });
}

const db = new PrismaClient({ adapter: getAdapter() });

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@localhost";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await hash(password, 10);

  await db.user.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash },
  });
  console.log("Admin user ready:", email);

  const home = await db.page.upsert({
    where: { slug: "home" },
    create: {
      slug: "home",
      title: "Homepage",
      body: "<h1>Welcome</h1><p>Your CMS is ready.</p>",
      status: "PUBLISHED",
    },
    update: {
      title: "Homepage",
      body: "<h1>Welcome</h1><p>Your CMS is ready.</p>",
      status: "PUBLISHED",
    },
  });

  const notfound = await db.page.upsert({
    where: { slug: "404" },
    create: {
      slug: "404",
      title: "404 Not Found",
      body: "<h1>404</h1><p>Page not found</p>",
      status: "PUBLISHED",
    },
    update: {
      title: "404 Not Found",
      body: "<h1>404</h1><p>Page not found</p>",
      status: "PUBLISHED",
    },
  });

  await db.setting.upsert({
    where: { key: "homepage_id" },
    create: { key: "homepage_id", value: home.id },
    update: { value: home.id },
  });
  await db.setting.upsert({
    where: { key: "notfound_page_id" },
    create: { key: "notfound_page_id", value: notfound.id },
    update: { value: notfound.id },
  });
  console.log("Default settings: homepage_id, notfound_page_id");
  console.log("Bootstrap done.");
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    db.$disconnect();
    process.exit(1);
  });
