
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'local-db.json');

// Interface definition matching Prisma schema (subset)
interface MockDB {
    users: any[];
    voiceJournals: any[];
    journals: any[];
    mindMaps: any[];
    // Add other collections as needed
}

const INITIAL_DB: MockDB = {
    users: [
        { id: 'mock-user-123', email: 'preview@example.com', name: 'Preview User' }
    ],
    voiceJournals: [],
    journals: [],
    mindMaps: []
};

function readDB(): MockDB {
    try {
        if (!fs.existsSync(DB_PATH)) {
            // Write initial DB if not exists
            fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2));
            return INITIAL_DB;
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Failed to read local-db.json:", error);
        return INITIAL_DB;
    }
}

function writeDB(data: MockDB) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Failed to write local-db.json:", error);
    }
}

export const mockDb = {
    voiceJournals: {
        findMany: async (query: any = {}) => {
            const db = readDB();
            let results = db.voiceJournals;
            if (query.where?.userId) {
                results = results.filter(vj => vj.userId === query.where.userId);
            }
            // Sort descenting by default for journals
            return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },
        findUnique: async (query: any) => {
            const db = readDB();
            return db.voiceJournals.find(vj => vj.id === query.where.id) || null;
        },
        create: async (data: any) => {
            const db = readDB();
            const newItem = {
                id: `mock-vj-${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...data.data
            };
            db.voiceJournals.push(newItem);
            writeDB(db);
            return newItem;
        },
        update: async (args: any) => {
            const db = readDB();
            const index = db.voiceJournals.findIndex(vj => vj.id === args.where.id);
            if (index === -1) throw new Error("Item not found");

            const updated = { ...db.voiceJournals[index], ...args.data, updatedAt: new Date().toISOString() };
            db.voiceJournals[index] = updated;
            writeDB(db);
            return updated;
        },
        delete: async (args: any) => {
            const db = readDB();
            const initialLength = db.voiceJournals.length;
            db.voiceJournals = db.voiceJournals.filter(vj => vj.id !== args.where.id);
            if (db.voiceJournals.length === initialLength) throw new Error("Item not found");
            writeDB(db);
            return { success: true };
        }
    },
    journals: {
        findMany: async (query: any = {}) => {
            const db = readDB();
            let results = db.journals;
            if (query.where?.userId) {
                results = results.filter(j => j.userId === query.where.userId);
            }
            return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },
        findUnique: async (query: any) => {
            const db = readDB();
            return db.journals.find(j => j.id === query.where.id) || null;
        },
        create: async (data: any) => {
            const db = readDB();
            const newItem = {
                id: `mock-j-${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...data.data
            };
            db.journals.push(newItem);
            writeDB(db);
            return newItem;
        }
        // Add update/delete if needed
    },
    // Implement other models similarly as needed
};
