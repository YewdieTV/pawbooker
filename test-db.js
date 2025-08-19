const { PrismaClient } = require('@prisma/client');

// Test database connection
async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  // Read from .env file manually
  require('dotenv').config();
  
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 30) + '...');
  
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
