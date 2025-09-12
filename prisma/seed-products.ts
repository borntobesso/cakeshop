import { PrismaClient } from '@prisma/client'
import productsData from '../src/data/products.json'

const prisma = new PrismaClient()

async function seedProducts() {
  console.log('Seeding products...')

  for (const product of productsData.products) {
    try {
      if (product.category === 'CAKE') {
        // Create CAKE products in both patisseries and gateaux-entiers categories
        const patisseriesCategory = await prisma.productCategory.findUnique({
          where: { slug: 'patisseries' }
        })
        const gateauxCategory = await prisma.productCategory.findUnique({
          where: { slug: 'gateaux-entiers' }
        })

        if (!patisseriesCategory || !gateauxCategory) {
          console.log('Required categories not found for CAKE products')
          continue
        }

        // Create in patisseries category (individual cakes)
        const existingInPatisseries = await prisma.product.findFirst({
          where: {
            name: product.name,
            categoryId: patisseriesCategory.id
          }
        })

        if (!existingInPatisseries) {
          await prisma.product.create({
            data: {
              name: product.name,
              description: product.description,
              price: product.price,
              image: product.image,
              isAvailable: product.available,
              stock: product.stock,
              categoryId: patisseriesCategory.id,
              displayOrder: product.id
            }
          })
          console.log(`Created product in patisseries: ${product.name}`)
        } else {
          console.log(`Product already exists in patisseries: ${product.name}`)
        }

        // Create in gateaux-entiers category (whole cakes)
        const existingInGateaux = await prisma.product.findFirst({
          where: {
            name: product.name,
            categoryId: gateauxCategory.id
          }
        })

        if (!existingInGateaux) {
          await prisma.product.create({
            data: {
              name: product.name,
              description: product.description,
              price: product.price, // Will be different pricing for whole cakes in future
              image: product.image,
              isAvailable: product.available,
              stock: product.stock,
              categoryId: gateauxCategory.id,
              displayOrder: product.id
            }
          })
          console.log(`Created product in gateaux-entiers: ${product.name}`)
        } else {
          console.log(`Product already exists in gateaux-entiers: ${product.name}`)
        }

      } else if (product.category === 'BRUNCH') {
        // Create BRUNCH products only in brunch category
        const brunchCategory = await prisma.productCategory.findUnique({
          where: { slug: 'brunch' }
        })

        if (!brunchCategory) {
          console.log('Brunch category not found')
          continue
        }

        const existingProduct = await prisma.product.findFirst({
          where: {
            name: product.name,
            categoryId: brunchCategory.id
          }
        })

        if (!existingProduct) {
          await prisma.product.create({
            data: {
              name: product.name,
              description: product.description,
              price: product.price,
              image: product.image,
              isAvailable: product.available,
              stock: product.stock,
              categoryId: brunchCategory.id,
              displayOrder: product.id
            }
          })
          console.log(`Created product in brunch: ${product.name}`)
        } else {
          console.log(`Product already exists in brunch: ${product.name}`)
        }

      } else {
        console.log(`Skipping product ${product.name} - category ${product.category} not processed`)
      }

    } catch (error) {
      console.error(`Error creating product ${product.name}:`, error)
    }
  }

  console.log('Products seeding completed!')
}

seedProducts()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })