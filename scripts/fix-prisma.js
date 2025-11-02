// Fix Prisma 6.x default.js issue
const fs = require('fs');
const path = require('path');

const prismaClientPath = path.join(__dirname, '../node_modules/.prisma/client');
const defaultJsPath = path.join(prismaClientPath, 'default.js');

// Create default.js that properly exports from client
const defaultJsContent = `// Auto-generated file for Prisma 6.x compatibility
module.exports = require('./index.js');
`;

if (!fs.existsSync(defaultJsPath)) {
  fs.writeFileSync(defaultJsPath, defaultJsContent);
  console.log('✅ Created default.js');
} else {
  console.log('ℹ️ default.js already exists');
}
