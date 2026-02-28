const express = require('express')
const router = express.Router()

module.exports = (supabase) => {

    // GET all technicians
    router.get('/', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '')

        const { data: { user } } = await supabase.auth.getUser(token)
        if (!user) return res.status(401).json({ message: 'Not authenticated' })

        const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single()

        if (profile?.role !== 'manager') {
        return res.status(403).json({ message: 'Manager access required' })
        }

        const { data: technicians, error } = await supabase
        .from('Profiles')
        .select('ID, Name, Email')
        .eq('Role', 'technician')

        if (error) {
        return res.status(500).json({ message: error.message })
        }

        res.json({ technicians })
    } catch (err) {
        console.error('Get technicians error:', err)
        res.status(500).json({ error: err.message })
    }
    })  

    // PATCH update technician_id for an appointment
    router.patch('/:appointmentId/technician', async (req, res) => {
        try {
        const token = req.headers.authorization?.replace('Bearer ', '')

        const { data: { user } } = await supabase.auth.getUser(token)
        if (!user) return res.status(401).json({ message: 'Not authenticated' })

        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('email', user.email)
            .single()

        if (profile?.role !== 'manager') {
            return res.status(403).json({ message: 'Manager access required' })
        }

        const { appointmentId } = req.params
        const { technician_id } = req.body

        if (!technician_id) {
            return res.status(400).json({ message: 'technician_id is required' })
        }

        const { data, error } = await supabase
            .from('appointments')
            .update({ technician_id })
            .eq('id', appointmentId)
            .select()
            .single()

        if (error) return res.status(400).json({ error: error.message })
        if (!data) return res.status(404).json({ message: 'Appointment not found' })

        res.json({ message: 'Technician updated successfully', data })
        } catch (err) {
        res.status(500).json({ error: err.message })
        }
    })

  return router
}