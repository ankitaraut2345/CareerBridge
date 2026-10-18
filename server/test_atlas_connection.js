require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

async function testConnection() {
  const uri = process.env.MONGODB_URI;

  console.log('\n======================================================');
  console.log('  🔍 CAREERBRIDGE — MONGODB ATLAS CONNECTION TEST');
  console.log('======================================================\n');

  if (!uri) {
    console.error('❌ MONGODB_URI is not set in server/.env');
    process.exit(1);
  }

  if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
    console.log('ℹ️  Current MONGODB_URI points to local database (127.0.0.1:27017).');
    console.log('👉 Please update MONGODB_URI in server/.env with your Atlas connection string.');
    process.exit(2);
  }

  if (uri.includes('<password>') || uri.includes('<db_password>')) {
    console.log('ℹ️  MONGODB_URI contains placeholder <password>.');
    console.log('👉 Please replace <password> in server/.env with your actual database user password.');
    process.exit(2);
  }

  // Safely mask credentials
  const maskedUri = uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
  console.log(`⏳ Testing connection to: ${maskedUri} ...`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log('\n✅ [SUCCESS] Successfully connected to MongoDB Atlas!');
    console.log(`📡 Cluster Host : ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    console.log(`🔒 Ready State  : ${conn.connection.readyState === 1 ? 'Connected (1)' : conn.connection.readyState}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ [FAIL] Could not connect to MongoDB Atlas.\n');

    if (err.message && err.message.includes('bad auth')) {
      console.error('🔑 Authentication Failed:');
      console.error('   The username or password was rejected by MongoDB Atlas.');
      console.error('   - Ensure the database user is "careerbridge_app".');
      console.error('   - If your password contains special characters (@, :, /, #, %, etc.), ensure they are URL-encoded.');
    } else if (err.name === 'MongooseServerSelectionError' || err.message.includes('timed out')) {
      console.error('🌐 Network / IP Access Error:');
      console.error('   The connection timed out while reaching the Atlas cluster.');
      console.error('   - Check Atlas > Network Access and confirm 0.0.0.0/0 is "Active".');
    } else if (err.message && (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo'))) {
      console.error('🌍 Hostname Resolution Error:');
      console.error('   The cluster hostname could not be found via DNS.');
      console.error('   - Confirm the cluster address is: careerbridgecluster.px9sazy.mongodb.net');
    } else {
      console.error(`   Error details: ${err.message}`);
    }

    console.log('\n======================================================\n');
    process.exit(1);
  }
}

testConnection();
