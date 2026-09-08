const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create users
  const user1 = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      email: "john@example.com",
      name: "John Doe",
      password: "hashed_password_1",
      role: "admin",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      email: "jane@example.com",
      name: "Jane Doe",
      password: "hashed_password_2",
      role: "user",
    },
  });

  // Create tags
  const tag1 = await prisma.tag.upsert({
    where: { name: "javascript" },
    update: {},
    create: { name: "javascript" },
  });

  const tag2 = await prisma.tag.upsert({
    where: { name: "nodejs" },
    update: {},
    create: { name: "nodejs" },
  });

  const tag3 = await prisma.tag.upsert({
    where: { name: "prisma" },
    update: {},
    create: { name: "prisma" },
  });

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      title: "Getting Started with Prisma",
      content: "Prisma is a modern ORM for Node.js and TypeScript.",
      published: true,
      authorId: user1.id,
      tags: {
        connect: [{ id: tag1.id }, { id: tag2.id }, { id: tag3.id }],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "Node.js Best Practices",
      content: "Learn the best practices for building Node.js applications.",
      published: true,
      authorId: user2.id,
      tags: {
        connect: [{ id: tag2.id }],
      },
    },
  });

  // Create comments
  await prisma.comment.create({
    data: {
      content: "Great article about Prisma!",
      authorId: user2.id,
      postId: post1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Very helpful, thanks!",
      authorId: user1.id,
      postId: post2.id,
    },
  });

  console.log("Seeding completed!");
  console.log("Created users:", { user1, user2 });
  console.log("Created posts:", { post1, post2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
