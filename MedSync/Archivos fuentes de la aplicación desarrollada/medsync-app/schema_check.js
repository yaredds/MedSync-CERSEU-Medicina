const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'cerseu_admin',
    password: 'cerseu2026',
    database: 'cerseu_med'
};

async function checkSchema() {
    let pool;
    try {
        pool = mysql.createPool(dbConfig);
        
        const [scheduleSchema] = await pool.execute('DESCRIBE schedule');
        console.log("schedule schema:", scheduleSchema);
        
        const [scheduleData] = await pool.execute('SELECT * FROM schedule LIMIT 5');
        console.log("schedule data:", scheduleData);
        
    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.end();
    }
}

checkSchema();
