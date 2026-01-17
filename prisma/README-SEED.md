# 🌱 Seed de Categorías

Este documento explica cómo cargar las categorías iniciales en la base de datos.

## ✅ Ya está configurado

El proyecto ya tiene todo listo para cargar categorías:

### Categorías incluidas:
1. **cocina** - Productos para la cocina
2. **pasteleria** - Artículos para la pastelería
3. **decoracion** - Elementos de decoración
4. **indumentaria** - Ropa y accesorios
5. **electrodomesticos** - Aparatos eléctricos para el hogar

## 🚀 Cómo ejecutar el seed

```bash
yarn seed
```

Este comando:
- ✅ Carga las 5 categorías en la base de datos
- ✅ Usa `upsert`, así que no duplica si ya existen
- ✅ Puedes ejecutarlo las veces que quieras sin problemas

## 🧪 Verificar que funcionó

1. **Opción 1: Prisma Studio**
   ```bash
   yarn prisma:studio
   ```
   Se abre un navegador donde puedes ver tus datos visualmente.

2. **Opción 2: API**
   - Inicia el servidor: `yarn dev`
   - Prueba: `GET http://localhost:3000/api/categories`
   - Deberías ver las 5 categorías

3. **Opción 3: SQL directo**
   ```sql
   SELECT * FROM "Category";
   ```

## 📝 Crear productos con categorías

Ahora que tienes categorías, puedes crear productos:

```bash
POST /api/products
{
  "name": "Sartén antiadherente",
  "description": "Sartén de 28cm",
  "price": 15990,
  "stock": 10,
  "categoryId": 1  // ID de "cocina"
}
```

## 🔧 Agregar más categorías

Edita `prisma/seed.ts` y agrega más objetos al array `categories`:

```typescript
const categories = [
  { name: "cocina", description: "Productos para la cocina" },
  // ... categorías existentes ...
  { name: "nueva_categoria", description: "Descripción" },
];
```

Luego ejecuta `yarn seed` nuevamente.

## 📚 Archivos involucrados

- `prisma/seed.ts` - Script que carga las categorías
- `package.json` - Contiene el comando `"seed": "tsx prisma/seed.ts"`
