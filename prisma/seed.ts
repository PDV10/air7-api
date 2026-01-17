import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Crear conexión de Prisma para el seed
// Neon siempre requiere SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

// Test de conexión
async function testConnection() {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Conexión a base de datos OK");
  } catch (error) {
    console.error("❌ Error de conexión:", error);
    throw error;
  }
}

// Categorías de zapatillas deportivas
const categories = [
  { name: "running", description: "Zapatillas para correr y entrenamientos de carrera" },
  { name: "training", description: "Zapatillas para gimnasio y entrenamientos funcionales" },
  { name: "basketball", description: "Zapatillas de básquet" },
  { name: "futbol", description: "Botines y zapatillas de fútbol" },
  { name: "tenis", description: "Zapatillas para tenis y pádel" },
  { name: "lifestyle", description: "Zapatillas casuales y urbanas" },
  { name: "outdoor", description: "Zapatillas para trail running y senderismo" },
];

// Productos de ejemplo por categoría
const products = [
  // Running
  { name: "Nike Air Zoom Pegasus 41", description: "Zapatilla de running versátil con amortiguación reactiva", price: 89990, stock: 25, brand: "Nike", category: "running" },
  { name: "Adidas Ultraboost Light", description: "Máxima amortiguación con Boost para carreras largas", price: 129990, stock: 15, brand: "Adidas", category: "running" },
  { name: "New Balance Fresh Foam 1080v13", description: "Comodidad premium para maratones", price: 109990, stock: 20, brand: "New Balance", category: "running" },
  { name: "Asics Gel-Nimbus 26", description: "Gel en talón y antepié para máxima absorción de impacto", price: 119990, stock: 18, brand: "Asics", category: "running" },
  { name: "Brooks Ghost 16", description: "Transiciones suaves y ajuste cómodo", price: 94990, stock: 22, brand: "Brooks", category: "running" },

  // Training
  { name: "Nike Metcon 9", description: "La zapatilla definitiva para CrossFit y HIIT", price: 84990, stock: 30, brand: "Nike", category: "training" },
  { name: "Reebok Nano X4", description: "Estabilidad y agarre para entrenamientos intensos", price: 79990, stock: 25, brand: "Reebok", category: "training" },
  { name: "Under Armour TriBase Reign 6", description: "Base plana para levantamiento de pesas", price: 74990, stock: 20, brand: "Under Armour", category: "training" },
  { name: "Adidas Dropset 2", description: "Diseñada para entrenamientos de fuerza", price: 69990, stock: 28, brand: "Adidas", category: "training" },

  // Basketball
  { name: "Nike LeBron XXI", description: "Tecnología Zoom Air para explosividad en cancha", price: 149990, stock: 12, brand: "Nike", category: "basketball" },
  { name: "Jordan XXXVIII", description: "Amortiguación premium y soporte de tobillo", price: 159990, stock: 10, brand: "Jordan", category: "basketball" },
  { name: "Adidas Harden Vol. 8", description: "Control y tracción para cambios de dirección", price: 109990, stock: 15, brand: "Adidas", category: "basketball" },
  { name: "Puma MB.03", description: "Zapatilla signature de LaMelo Ball", price: 99990, stock: 18, brand: "Puma", category: "basketball" },

  // Fútbol
  { name: "Nike Mercurial Superfly 9", description: "Velocidad máxima con Flyknit y placa de carbono", price: 179990, stock: 20, brand: "Nike", category: "futbol" },
  { name: "Adidas Predator Elite", description: "Control total del balón con Controlskin", price: 169990, stock: 15, brand: "Adidas", category: "futbol" },
  { name: "Puma Future Ultimate", description: "Ajuste adaptativo con FUZIONFIT+", price: 149990, stock: 18, brand: "Puma", category: "futbol" },
  { name: "Nike Phantom GX Elite", description: "Precisión en el pase y tiro", price: 159990, stock: 14, brand: "Nike", category: "futbol" },

  // Tenis
  { name: "Nike Court Air Zoom Vapor Pro 2", description: "Velocidad y estabilidad en cancha dura", price: 99990, stock: 16, brand: "Nike", category: "tenis" },
  { name: "Adidas Barricade 13", description: "Durabilidad extrema para jugadores agresivos", price: 94990, stock: 20, brand: "Adidas", category: "tenis" },
  { name: "Asics Gel-Resolution 9", description: "Soporte lateral y amortiguación GEL", price: 89990, stock: 22, brand: "Asics", category: "tenis" },

  // Lifestyle
  { name: "Nike Air Force 1 '07", description: "El clásico icónico que nunca pasa de moda", price: 74990, stock: 40, brand: "Nike", category: "lifestyle" },
  { name: "Adidas Stan Smith", description: "Elegancia minimalista en cuero blanco", price: 64990, stock: 35, brand: "Adidas", category: "lifestyle" },
  { name: "New Balance 550", description: "Estilo retro basketball para el día a día", price: 79990, stock: 30, brand: "New Balance", category: "lifestyle" },
  { name: "Puma Suede Classic", description: "Ícono del streetwear desde 1968", price: 54990, stock: 28, brand: "Puma", category: "lifestyle" },
  { name: "Converse Chuck Taylor All Star", description: "El original que definió generaciones", price: 49990, stock: 50, brand: "Converse", category: "lifestyle" },

  // Outdoor
  { name: "Salomon Speedcross 6", description: "Agarre extremo para trail técnico", price: 99990, stock: 15, brand: "Salomon", category: "outdoor" },
  { name: "The North Face Vectiv Enduris 3", description: "Placa de carbono para ultra trails", price: 119990, stock: 12, brand: "The North Face", category: "outdoor" },
  { name: "Merrell MQM 3 GTX", description: "Impermeable Gore-Tex para senderismo", price: 89990, stock: 18, brand: "Merrell", category: "outdoor" },
  { name: "Hoka Speedgoat 6", description: "Amortiguación máxima en terrenos difíciles", price: 109990, stock: 14, brand: "Hoka", category: "outdoor" },
];

async function main() {
  console.log("🌱 Iniciando seed de Air Seven...\n");

  // Verificar conexión primero
  await testConnection();

  // 1. Crear categorías
  console.log("\n📁 Creando categorías...");
  const categoryMap = new Map<string, number>();

  for (const c of categories) {
    const category = await prisma.category.upsert({
      where: { name: c.name },
      update: { description: c.description },
      create: c,
    });
    categoryMap.set(c.name, category.id);
    console.log(`  ✓ ${category.name} (ID: ${category.id})`);
  }

  // 2. Crear productos
  console.log("\n👟 Creando productos...");
  for (const p of products) {
    const categoryId = categoryMap.get(p.category);
    
    // Usamos upsert basado en nombre + marca para evitar duplicados
    const product = await prisma.product.upsert({
      where: {
        // Como no tenemos un campo único, primero buscamos
        id: (await prisma.product.findFirst({
          where: { name: p.name, brand: p.brand }
        }))?.id ?? 0
      },
      update: {
        description: p.description,
        price: p.price,
        stock: p.stock,
        categoryId,
      },
      create: {
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        brand: p.brand,
        categoryId,
      },
    });
    console.log(`  ✓ ${product.name} - $${product.price} (${p.category})`);
  }

  // 3. Resumen
  const totalCategories = await prisma.category.count();
  const totalProducts = await prisma.product.count();
  
  console.log("\n" + "=".repeat(50));
  console.log("✅ Seed completado exitosamente");
  console.log(`📁 Total categorías: ${totalCategories}`);
  console.log(`👟 Total productos: ${totalProducts}`);
  console.log("=".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
