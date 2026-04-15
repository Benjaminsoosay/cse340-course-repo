// scripts/createAdminDirect.js
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'cse340'; // change to your database name

async function createAdmin() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const users = db.collection('users'); // adjust collection name if needed

        const hashedPassword = await bcrypt.hash('Admin123!', 10);
        const adminUser = {
            name: 'Admin',
            email: 'grader@example.com',
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date()
        };

        const result = await users.updateOne(
            { email: 'grader@example.com' },
            { $set: adminUser },
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            console.log('✅ Admin user created successfully!');
        } else if (result.modifiedCount > 0) {
            console.log('✅ Existing user updated to admin role.');
        } else {
            console.log('⚠️ User already admin, no changes needed.');
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.close();
    }
}

createAdmin();