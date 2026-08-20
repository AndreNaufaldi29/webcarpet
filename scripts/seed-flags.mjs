import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:123@localhost:5432/abcarpet?schema=public";
const pool = new Pool({ connectionString });

async function main() {
  const res = await pool.query('SELECT id, name FROM products ORDER BY id ASC');
  console.log("Found products:", res.rows.length);

  for (let i = 0; i < res.rows.length; i++) {
    const row = res.rows[i];
    const isFeatured = i < 4;
    const isNew = i < 3;
    await pool.query('UPDATE products SET "isFeatured" = $1, "isNew" = $2 WHERE id = $3', [isFeatured, isNew, row.id]);
    console.log(`Updated #${row.id} ${row.name}: isFeatured=${isFeatured}, isNew=${isNew}`);
  }
}

main().catch(console.error).finally(() => pool.end());
