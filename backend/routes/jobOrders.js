const express = require('express')
const router = express.Router()
const requireRole = require('../middleware/requireRole')

module.exports = (supabase) => {

    // update services in a job card
    router.put('/:orderId/services', requireRole(supabase, ['manager', 'technician']), async (req, res) => {
        try {
            const { orderId } = req.params
            const { services } = req.body

            const { data, error } = await supabase
                .from('Job_Orders')
                .update({ Services: services })
                .eq('"Order_ID"', orderId)
                .select()
                .single()

            if (error) return res.status(500).json({ error: error.message })
            if (!data) return res.status(404).json({ message: 'Job card not found' })

            res.json({ data })
        } catch (err) {
            res.status(500).json({ error: err.message })
        }
    })


    // update parts in a job order
    router.put('/:orderId/parts', requireRole(supabase, ['manager', 'technician']), async (req, res) => {
        try {
            const { orderId } = req.params
            const { parts } = req.body

            if (parts === undefined) {
                return res.status(400).json({ message: 'parts field is required' })
            }

            const { data, error } = await supabase
                .from('Job_Orders')
                .update({ Parts: parts })
                .eq('"Order_ID"', orderId)
                .select()
                .single()

            if (error) return res.status(500).json({ error: error.message })
            if (!data) return res.status(404).json({ message: 'Job order not found' })

            res.json({ data })
        } catch (err) {
            res.status(500).json({ error: err.message })
        }
    })

    // update order status for a job order
    router.put('/:orderId/status', requireRole(supabase, ['manager', 'technician']), async (req, res) => {
        try {
            const { orderId } = req.params
            const { status } = req.body

            if (status === undefined) {
                return res.status(400).json({ message: 'status field is required' })
            }

            const { data, error } = await supabase
                .from('Job_Orders')
                .update({ Order_Status: status })
                .eq('"Order_ID"', orderId)
                .select()
                .single()

            if (error) return res.status(500).json({ error: error.message })
            if (!data) return res.status(404).json({ message: 'Job order not found' })

            res.json({ data })
        } catch (err) {
            res.status(500).json({ error: err.message })
        }
    })

    return router
}