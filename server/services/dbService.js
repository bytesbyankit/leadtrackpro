const db = require('../config/database');

let isInitialized = false;

/**
 * Initialize the leads table if it doesn't exist.
 */
async function initDb() {
    if (isInitialized) return;

    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL && !process.env.STORAGE_DATABASE_URL) {
        console.warn('⚠️ Skipping DB init: No connection string found.');
        return;
    }

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS leads (
            id SERIAL PRIMARY KEY,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            businessName TEXT,
            contactPerson TEXT,
            phone TEXT,
            email TEXT,
            city TEXT,
            industry TEXT,
            websiteStatus TEXT,
            callStatus TEXT,
            leadStatus TEXT,
            interestLevel TEXT,
            need TEXT,
            budget TEXT,
            decisionMaker TEXT,
            nextAction TEXT,
            followUp TEXT,
            notes TEXT,
            source TEXT,
            dealStage TEXT
        );
    `;
    try {
        await db.query(createTableQuery);
        isInitialized = true;
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        // Don't re-throw here to prevent crashing the entire worker, 
        // but individual queries will still fail and be caught in server.js
    }
}

/**
 * Helper to map DB row to camelCase object
 */
function mapRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        createdAt: row.createdat,
        businessName: row.businessname,
        contactPerson: row.contactperson,
        phone: row.phone,
        email: row.email,
        city: row.city,
        industry: row.industry,
        websiteStatus: row.websitestatus,
        callStatus: row.callstatus,
        leadStatus: row.leadstatus,
        interestLevel: row.interestlevel,
        need: row.need,
        budget: row.budget,
        decisionMaker: row.decisionmaker,
        nextAction: row.nextaction,
        followUp: row.followup,
        notes: row.notes,
        source: row.source,
        dealStage: row.dealstage
    };
}

/**
 * Append a lead to the postgres database.
 */
async function appendLead(data) {
    await initDb();
    const query = `
        INSERT INTO leads (
            businessName, contactPerson, phone, email, city, industry, 
            websiteStatus, callStatus, leadStatus, interestLevel, 
            need, budget, decisionMaker, nextAction, followUp, 
            notes, source, dealStage
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *;
    `;
    const values = [
        data.businessName || '',
        data.contactPerson || '',
        data.phone || '',
        data.email || '',
        data.city || '',
        data.industry || '',
        data.websiteStatus || '',
        data.callStatus || '',
        data.leadStatus || '',
        data.interestLevel || '',
        data.need || '',
        data.budget || '',
        data.decisionMaker || '',
        data.nextAction || '',
        data.followUp || '',
        data.notes || '',
        data.source || '',
        data.dealStage || ''
    ];

    const res = await db.query(query, values);
    return mapRow(res.rows[0]);
}

/**
 * Read all leads from the postgres database.
 */
async function getAllLeads() {
    await initDb();
    const query = 'SELECT * FROM leads ORDER BY createdAt DESC;';
    const res = await db.query(query);
    return res.rows.map(mapRow);
}

/**
 * Update an existing lead by ID.
 */
async function updateLead(id, data) {
    await initDb();

    const fields = [];
    const values = [];
    let idx = 1;

    // Dynamically build the SET clause based on provided data
    for (const [key, value] of Object.entries(data)) {
        if (key === 'id' || key === 'createdAt') continue; // Don't update these

        // Map camelCase keys to potential DB column requirements if needed.
        // In our table definition, columns match exactly except they are case-insensitive.
        fields.push(`"${key.toLowerCase()}" = $${idx}`);
        values.push(value);
        idx++;
    }

    if (fields.length === 0) return null; // Nothing to update

    values.push(id);
    const query = `
        UPDATE leads 
        SET ${fields.join(', ')} 
        WHERE id = $${idx}
        RETURNING *;
    `;

    const res = await db.query(query, values);
    return res.rows.length ? mapRow(res.rows[0]) : null;
}

/**
 * Delete a lead by ID.
 */
async function deleteLead(id) {
    await initDb();
    const query = `DELETE FROM leads WHERE id = $1 RETURNING id;`;
    const res = await db.query(query, [id]);
    return res.rowCount > 0;
}

module.exports = { appendLead, getAllLeads, updateLead, deleteLead };
