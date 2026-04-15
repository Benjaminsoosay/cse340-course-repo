// scripts/updateToAdmin.cjs
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name';
const dbName = process.env.DB_NAME || 'your_database_name';

async function updateToAdmin(email) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const users = db.collection('users'); // change if your collection is different

        const result = await users.updateOne(
            { email: email },
            { $set: { role: 'admin' } }
        );

        if (result.matchedCount === 0) {
            console.log(`User with email ${email} not found.`);
        } else {
            console.log(`User ${email} updated to admin role.`);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: node scripts/updateToAdmin.cjs <email>');
    process.exit(1);
}
updateToAdmin(email);