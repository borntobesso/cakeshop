import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCategories() {
  console.log('Seeding product categories...')

  const categories = [
    {
      name: 'La maison',
      slug: 'la-maison',
      description: 'Découvrez notre maison et notre histoire',
      iconPath: '/images/categories/la-maison.png',
      isPrincipal: false,
      displayOrder: 1,
    },
    {
      name: 'Gâteaux entiers',
      slug: 'gateaux-entiers',
      description: 'Nos pâtisseries disponibles en gâteaux entiers pour vos occasions spéciales',
      iconPath: '/images/categories/gateaux-entiers.png',
      isPrincipal: true,
      displayOrder: 2,
    },
    {
      name: 'Pâtisseries',
      slug: 'patisseries',
      description: 'Nos pâtisseries individuelles préparées chaque jour',
      iconPath: '/images/categories/patisseries.png',
      isPrincipal: true,
      displayOrder: 3,
    },
    {
      name: 'Brunch',
      slug: 'brunch',
      description: 'Nos plats brunch fusion asiatique-française',
      iconPath: '/images/categories/brunch.png',
      isPrincipal: true,
      displayOrder: 4,
    },
    {
      name: 'Café en grains',
      slug: 'cafe-en-grains',
      description: 'Café en grains de spécialité pour déguster à la maison',
      iconPath: '/images/categories/cafe-en-grains.png',
      isPrincipal: false,
      displayOrder: 5,
    },
    {
      name: 'Cake & gâteaux de voyage',
      slug: 'cake-gateaux-voyage',
      description: 'Gâteaux parfaits pour vos voyages et déplacements',
      iconPath: '/images/categories/cake-gateaux-voyage.png',
      isPrincipal: true,
      displayOrder: 6,
    },
    {
      name: 'Glace & sorbet en pot',
      slug: 'glace-sorbet-pot',
      description: 'Glaces et sorbets artisanaux à emporter',
      iconPath: '/images/categories/glace-sorbet-pot.png',
      isPrincipal: true,
      displayOrder: 7,
    },
    {
      name: 'Bougies & topper cake',
      slug: 'bougies-topper-cake',
      description: 'Accessoires pour décorer vos gâteaux',
      iconPath: '/images/categories/bougies-topper-cake.png',
      isPrincipal: false,
      displayOrder: 8,
    },
    {
      name: 'Carte cadeau',
      slug: 'carte-cadeau',
      description: 'Offrez le plaisir de nos pâtisseries avec nos cartes cadeaux',
      iconPath: '/images/categories/carte-cadeau.png',
      isPrincipal: false,
      displayOrder: 9,
    },
    {
      name: 'Gâteaux événementiels (contacter)',
      slug: 'gateaux-evenementiels-contacter',
      description: 'Créations sur mesure pour vos événements spéciaux',
      iconPath: '/images/categories/gateaux-evenementiels-contacter.png',
      isPrincipal: false,
      displayOrder: 10,
    },
  ]

  for (const category of categories) {
    const existingCategory = await prisma.productCategory.findUnique({
      where: { slug: category.slug }
    })

    if (!existingCategory) {
      await prisma.productCategory.create({
        data: category
      })
      console.log(`Created category: ${category.name}`)
    } else {
      console.log(`Category already exists: ${category.name}`)
    }
  }

  console.log('Categories seeding completed!')
}

seedCategories()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })