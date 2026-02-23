require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('Users') // replace with any table you have in Supabase
            .select('*')
            .limit(1)

        if (error) throw error

        console.log('Connection successful! Data:', data)
    } catch (err) {
        console.error('Connection failed:', err.message)
    }
}

testConnection()