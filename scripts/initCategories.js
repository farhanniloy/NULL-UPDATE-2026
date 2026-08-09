const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const defaultCategories = [
    { slug: 'philosophy', title: 'Philosophy' },
    { slug: 'infiltration', title: 'Infiltration' },
    { slug: 'science', title: 'Science' },
    { slug: 'programs', title: 'Programs' },
    { slug: 'projects', title: 'Projects' },
    { slug: 'article', title: 'Article' }
  ];

  for (const cat of defaultCategories) {
    try {
      const existing = await prisma.category.findUnique({
        where: { slug: cat.slug }
      });

      if (!existing) {
        await prisma.category.create({
          data: cat
        });
        console.log(`✓ Created category: ${cat.title}`);
      } else {
        console.log(`• Category already exists: ${cat.title}`);
      }
    } catch (error) {
      console.error(`✗ Error creating category ${cat.title}:`, error.message);
    }
  }

  console.log('Category initialization complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
