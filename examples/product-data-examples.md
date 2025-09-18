# Product Database Examples

This file provides examples of how to populate the enhanced Product fields in the database.

## Basic Product Information

```json
{
  "id": "product_123",
  "name": "Tarte aux Fraises",
  "description": "Délicieuse tarte aux fraises fraîches sur pâte sablée",
  "longDescription": "Mousse vanille de Madagascar, crémeux mangue passion, biscuit joconde, croustillant praliné feuilletine",
  "price": 28.50,
  "image": "/images/products/tarte-fraises.jpg"
}
```

## Enhanced Product Details

### Image Gallery
```json
{
  "imageGallery": [
    "/images/products/tarte-fraises-detail1.jpg",
    "/images/products/tarte-fraises-detail2.jpg", 
    "/images/products/tarte-fraises-coupe.jpg",
    "/images/products/tarte-fraises-ingredients.jpg"
  ]
}
```

### Ingredients
```json
{
  "ingredients": "Crème, œufs, sucre, chocolat blanc, gélatine végétale, purée de mangue, purée de fruit de la passion, vanille de Madagascar, beurre, farine de blé, poudre d'amandes, praliné noisettes (noisettes, sucre), feuilletine (farine de blé, sucre, matière grasse végétale, lactosérum en poudre, sel), stabilisant (agar-agar), émulsifiant (lécithine de soja), arôme naturel de vanille, colorant naturel."
}
```

### Storage Instructions
```json
{
  "storage": "À conserver au réfrigérateur entre 2°C et 4°C. À consommer dans les 48h après achat. Sortir 15 minutes avant dégustation."
}
```

### Allergens
```json
{
  "allergens": "Gluten, œufs, lait, fruits à coque (amandes, noisettes), soja"
}
```

### Nutrition Information
```json
{
  "nutritionInfo": {
    "portionSize": "100g",
    "calories": 285,
    "fat": 12.5,
    "saturatedFat": 8.2,
    "carbohydrates": 38.7,
    "sugars": 22.1,
    "protein": 4.8,
    "fiber": 2.1,
    "sodium": 0.15,
    "unit": "g"
  }
}
```

### Size Options
```json
{
  "sizeOptions": [
    {
      "size": "4 parts",
      "price": 22
    },
    {
      "size": "6 parts", 
      "price": 30
    },
    {
      "size": "8 parts",
      "price": 38
    },
    {
      "size": "10 parts",
      "price": 45
    },
    {
      "size": "12 parts",
      "price": 54
    },
    {
      "size": "14 parts",
      "price": 63
    },
    {
      "size": "16 parts",
      "price": 72
    },
    {
      "size": "18 parts",
      "price": 81
    },
    {
      "size": "20 parts",
      "price": 90
    }
  ]
}
```

### Related Products
```json
{
  "relatedProductIds": [
    "product_456", // Tarte aux Framboises
    "product_789", // Tarte Tatin
    "product_012", // Tarte au Citron
    "product_345"  // Fraisier
  ]
}
```

### Click & Collect Information
```json
{
  "preparationTime": 24,
  "availableForPickup": true
}
```

## Complete Product Examples

### 1. Individual Pastry (Éclair)
```json
{
  "name": "Éclair au Chocolat",
  "description": "Éclair garni de crème pâtissière et glaçage chocolat",
  "longDescription": "Pâte à choux dorée et croustillante, garnie généreusement de crème pâtissière à la vanille et recouverte d'un glaçage au chocolat noir 70%. Un grand classique de la pâtisserie française.",
  "price": 4.50,
  "image": "/images/products/eclair-chocolat.jpg",
  "imageGallery": [
    "/images/products/eclair-chocolat-coupe.jpg",
    "/images/products/eclair-chocolat-detail.jpg"
  ],
  "ingredients": "Eau, farine, beurre, œufs, lait, sucre, chocolat noir (cacao 70%), vanille, amidon",
  "storage": "À conserver au frais. À consommer le jour même pour une fraîcheur optimale.",
  "allergens": "Contient: gluten, œufs, lait. Peut contenir: fruits à coque",
  "nutritionInfo": {
    "portionSize": "1 pièce (85g)",
    "calories": 245,
    "fat": 14.2,
    "saturatedFat": 8.8,
    "carbohydrates": 24.1,
    "sugars": 12.7,
    "protein": 6.3,
    "fiber": 1.2,
    "sodium": 0.18
  },
  "sizeOptions": null, // Individual pastry, no size options
  "relatedProductIds": ["eclair_cafe", "eclair_vanille", "profiterole"],
  "preparationTime": 4,
  "availableForPickup": true
}
```

### 2. Whole Cake (Gâteau Entier)
```json
{
  "name": "Forêt Noire",
  "description": "Gâteau au chocolat, cerises et chantilly",
  "longDescription": "Un classique de la pâtisserie allemande revisité à la française. Génoise au chocolat imbibée de kirsch, garnie de cerises griottes et de chantilly légère, le tout recouvert de copeaux de chocolat noir.",
  "price": 45.00,
  "image": "/images/products/foret-noire.jpg",
  "imageGallery": [
    "/images/products/foret-noire-coupe.jpg",
    "/images/products/foret-noire-detail.jpg",
    "/images/products/foret-noire-ingredients.jpg"
  ],
  "ingredients": "Chocolat noir, farine, œufs, sucre, beurre, crème fraîche, cerises griottes, kirsch, vanille",
  "storage": "À conserver au réfrigérateur. À consommer dans les 3 jours. Sortir 30 minutes avant service.",
  "allergens": "Contient: gluten, œufs, lait. Contient de l'alcool (kirsch). Peut contenir: fruits à coque",
  "nutritionInfo": {
    "portionSize": "100g",
    "calories": 320,
    "fat": 18.5,
    "saturatedFat": 11.2,
    "carbohydrates": 32.8,
    "sugars": 25.4,
    "protein": 5.7,
    "fiber": 3.1,
    "sodium": 0.25
  },
  "sizeOptions": [
    {
      "size": "6 personnes",
      "price": 45.00
    },
    {
      "size": "8 personnes",
      "price": 62.00
    },
    {
      "size": "10 personnes",
      "price": 78.00
    },
    {
      "size": "12 personnes",
      "price": 95.00
    }
  ],
  "relatedProductIds": ["gateau_chocolat", "tiramisu", "opera"],
  "preparationTime": 48,
  "availableForPickup": true
}
```

### 3. Brunch Item
```json
{
  "name": "Croissant aux Amandes",
  "description": "Croissant garni de crème d'amandes et amandes effilées",
  "longDescription": "Croissant pur beurre du jour précédent transformé en délice: fendu et garni de crème d'amandes maison, saupoudré d'amandes effilées et doré au four. Une seconde vie gourmande pour nos viennoiseries.",
  "price": 3.80,
  "image": "/images/products/croissant-amandes.jpg",
  "imageGallery": [
    "/images/products/croissant-amandes-coupe.jpg",
    "/images/products/croissant-amandes-detail.jpg"
  ],
  "ingredients": "Pâte feuilletée (farine, beurre), amandes en poudre, sucre, œufs, beurre, amandes effilées, rhum",
  "storage": "À consommer de préférence le jour même. Peut se réchauffer 2-3 minutes au four.",
  "allergens": "Contient: gluten, œufs, lait, amandes. Peut contenir: autres fruits à coque",
  "nutritionInfo": {
    "portionSize": "1 pièce (95g)",
    "calories": 385,
    "fat": 24.8,
    "saturatedFat": 12.1,
    "carbohydrates": 35.2,
    "sugars": 18.7,
    "protein": 8.9,
    "fiber": 3.4,
    "sodium": 0.42
  },
  "sizeOptions": null,
  "relatedProductIds": ["pain_chocolat", "croissant_beurre", "chausson_pommes"],
  "preparationTime": 2,
  "availableForPickup": true
}
```

### 4. Coffee/Beverage
```json
{
  "name": "Café Espresso",
  "description": "Espresso italien préparé avec nos grains torréfiés",
  "longDescription": "Espresso corsé préparé avec notre mélange signature de grains arabica et robusta, torréfaction artisanale. Servi dans une tasse en porcelaine préchauffée avec un petit biscuit maison.",
  "price": 2.50,
  "image": "/images/products/espresso.jpg",
  "imageGallery": [
    "/images/products/espresso-preparation.jpg",
    "/images/products/espresso-grains.jpg"
  ],
  "ingredients": "Café en grains (arabica 80%, robusta 20%), eau filtrée",
  "storage": "À consommer immédiatement après préparation",
  "allergens": "Peut contenir des traces de: lait (machines partagées)",
  "nutritionInfo": {
    "portionSize": "1 tasse (30ml)",
    "calories": 2,
    "fat": 0.1,
    "saturatedFat": 0,
    "carbohydrates": 0.2,
    "sugars": 0,
    "protein": 0.3,
    "fiber": 0,
    "sodium": 0.005,
    "caffeine": 63
  },
  "sizeOptions": [
    {
      "size": "Simple",
      "price": 2.50
    },
    {
      "size": "Double",
      "price": 4.00
    }
  ],
  "relatedProductIds": ["cafe_americano", "cappuccino", "cafe_creme"],
  "preparationTime": 0, // Immediate preparation
  "availableForPickup": true
}
```

## Data Import Examples

### Using Prisma Studio
1. Open Prisma Studio: `npm run db:studio`
2. Navigate to the Product table
3. Add new record with the JSON data above

### Using Database Seed Script
```javascript
// In prisma/seed.js
const sampleProducts = [
  {
    name: "Tarte aux Fraises",
    description: "Délicieuse tarte aux fraises fraîches sur pâte sablée",
    longDescription: "Une tarte artisanale composée d'une pâte sablée...",
    price: 28.50,
    image: "/images/products/tarte-fraises.jpg",
    imageGallery: [
      "/images/products/tarte-fraises-detail1.jpg",
      "/images/products/tarte-fraises-detail2.jpg"
    ],
    ingredients: "Farine de blé, beurre, sucre, œufs...",
    allergens: "Contient: gluten (blé), œufs, lait...",
    storage: "À conserver au réfrigérateur entre 2°C et 4°C...",
    nutritionInfo: {
      portionSize: "100g",
      calories: 285,
      fat: 12.5
    },
    sizeOptions: [
      { size: "4-6 personnes", price: 28.50 },
      { size: "6-8 personnes", price: 42.00 }
    ],
    preparationTime: 24,
    availableForPickup: true,
    categoryId: "category_patisseries_id"
  }
];
```

## Notes

- **JSON Fields**: `imageGallery`, `nutritionInfo`, `sizeOptions`, `relatedProductIds` are stored as JSON
- **Prices**: Always include 2 decimal places
- **Preparation Time**: In hours (0 for immediate, 24 for next day, 48 for 2 days)
- **Related Products**: Use actual product IDs from your database
- **Images**: Ensure image paths exist in your public folder
- **Allergens**: Follow EU regulations format
- **Storage**: Provide clear, actionable instructions