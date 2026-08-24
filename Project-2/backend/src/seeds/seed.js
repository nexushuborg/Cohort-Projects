const bcrypt = require('bcrypt');
const { query, pool } = require('../config/database');

async function runSeeds() {
  try {
    console.log('Seeding database with raw SQL queries...');

    // 1. Clean existing records safely
    await query('TRUNCATE TABLE users, stores, categories CASCADE;');

    // 2. Hash test passwords
    const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
    const sellerPasswordHash = await bcrypt.hash('Seller123!', 10);
    const buyerPasswordHash = await bcrypt.hash('Buyer123!', 10);

    // 3. Insert Users via parameterized SQL
    const userInsertSql = `
      INSERT INTO users (id, email, password_hash, name, role, phone, avatar_url)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7),
        ($8, $9, $10, $11, $12, $13, $14),
        ($15, $16, $17, $18, $19, $20, $21),
        ($22, $23, $24, $25, $26, $27, $28)
      ON CONFLICT (email) DO NOTHING;
    `;

    await query(userInsertSql, [
      '11111111-1111-1111-1111-111111111111', 'admin@test.com', adminPasswordHash, 'System Admin', 'admin', '+1-555-0100', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      '22222222-2222-2222-2222-222222222222', 'seller1@test.com', sellerPasswordHash, 'Tech Haven Seller', 'seller', '+1-555-0101', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      '33333333-3333-3333-3333-333333333333', 'seller2@test.com', sellerPasswordHash, 'Vogue Apparel Seller', 'seller', '+1-555-0102', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      '44444444-4444-4444-4444-444444444444', 'buyer@test.com', buyerPasswordHash, 'John Buyer', 'buyer', '+1-555-0103', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    ]);

    // 4. Insert Categories & Subcategories via SQL
    const catInsertSql = `
      INSERT INTO categories (id, name, slug, parent_id)
      VALUES 
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Electronics', 'electronics', NULL),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Clothing', 'clothing', NULL),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Home & Living', 'home-and-living', NULL),
        ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Books', 'books', NULL),
        ('aaaaaaaa-1111-aaaa-aaaa-aaaaaaaaaaaa', 'Mobiles & Tablets', 'mobiles-and-tablets', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
        ('aaaaaaaa-2222-aaaa-aaaa-aaaaaaaaaaaa', 'Laptops & Computers', 'laptops-and-computers', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
        ('bbbbbbbb-1111-bbbb-bbbb-bbbbbbbbbbbb', 'Men''s Fashion', 'mens-fashion', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
        ('bbbbbbbb-2222-bbbb-bbbb-bbbbbbbbbbbb', 'Women''s Fashion', 'womens-fashion', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
      ON CONFLICT (slug) DO NOTHING;
    `;
    await query(catInsertSql);

    // 5. Insert Stores via SQL
    const storeInsertSql = `
      INSERT INTO stores (id, owner_id, name, slug, description, logo_url, banner_url, status, policies, contact_email, contact_phone)
      VALUES 
        (
          '99999999-1111-9999-9999-999999999999',
          '22222222-2222-2222-2222-222222222222',
          'Tech Haven Store',
          'tech-haven-store',
          'Your one-stop marketplace store for gadgets, electronics, and smart accessories.',
          'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150',
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
          'active',
          '30-day money-back guarantee. Fast shipping within 48 hours.',
          'support@techhaven.com',
          '+1-555-0101'
        ),
        (
          '99999999-2222-9999-9999-999999999999',
          '33333333-3333-3333-3333-333333333333',
          'Vogue Boutique',
          'vogue-boutique',
          'Curated premium fashion, seasonal styles, and trendy modern apparel.',
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150',
          'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200',
          'active',
          'Easy exchanges within 14 days. Sustainable packaging.',
          'hello@vogueboutique.com',
          '+1-555-0102'
        )
      ON CONFLICT (slug) DO NOTHING;
    `;
    await query(storeInsertSql);

    console.log('✅ Database seeded successfully via SQL queries.');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    if (require.main === module) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  runSeeds();
}

module.exports = {
  runSeeds,
};
