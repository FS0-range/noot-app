const express = require('express')
const router = express.Router()

module.exports = (supabase) => {

router.post('/createAppointment', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })

    const {
      appointment_date,
      appointment_time,
      customer_notes,
      vehicle_license_plate,
      vehicle_make,
      vehicle_year,
      phone_number
    } = req.body

    if (!appointment_date || !appointment_time) {
      return res.status(400).json({ message: 'appointment_date and appointment_time are required' })
    }

    const { data, error } = await supabase
      .from('Appointments')
      .insert([{
        appointment_date,
        appointment_time,
        customer_id: user.id,  // taken from the token
        customer_notes,
        status: 'booked',
        vehicle_license_plate,
        vehicle_make,
        vehicle_year,
        phone_number
      }])
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })

    res.status(201).json({ message: 'Appointment created successfully', data })
  } catch (err) {
    console.error('Create appointment error:', err)
    res.status(500).json({ error: err.message })
  }
})

// get timing of booked slots and disallow users to select.
router.get('/bookedSlots', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Appointments')
      .select('appointment_date, appointment_time')
      .eq('status', 'booked')


    if (error) return res.status(400).json({ error: error.message })

    res.json({ data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/getAppointments', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const { data, error } = await supabase
      .from('Appointments')
      .select('*')
      .eq('customer_id', user.id)
    if (error) return res.status(400).json({ error: error.message })
    res.status(200).json({ message: 'Appointments retrieved successfully', data })
  } catch (err) {
    console.error('Get appointments error:', err)
    res.status(500).json({ error: err.message })
  }
})

router.put('/editAppointment/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })

    const { id } = req.params
    const { appointment_date, appointment_time } = req.body

    if (!appointment_date || !appointment_time) {
      return res.status(400).json({ message: 'appointment_date and appointment_time are required' })
    }

    // Check appointment belongs to this user and is more than 2 days away
    const { data: existing, error: fetchError } = await supabase
      .from('Appointments')
      .select('*')
      .eq('id', id)
      .eq('customer_id', user.id)
      .single()

    if (fetchError || !existing) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const apptDate = new Date(existing.appointment_date)
    const diffDays = (apptDate - today) / (1000 * 60 * 60 * 24)
    if (diffDays <= 2) {
      return res.status(400).json({ message: 'Cannot edit an appointment within 2 days of the scheduled date' })
    }

    const { data, error } = await supabase
      .from('Appointments')
      .update({ appointment_date, appointment_time })
      .eq('id', id)
      .eq('customer_id', user.id)
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.status(200).json({ message: 'Appointment updated successfully', data })
  } catch (err) {
    console.error('Edit appointment error:', err)
    res.status(500).json({ error: err.message })
  }
})

router.put('/cancelAppointment/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })

    const { id } = req.params

    // Check appointment belongs to this user
    const { data: existing, error: fetchError } = await supabase
      .from('Appointments')
      .select('*')
      .eq('id', id)
      .eq('customer_id', user.id)
      .single()

    if (fetchError || !existing) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    if (existing.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const apptDate = new Date(existing.appointment_date)
    const diffDays = (apptDate - today) / (1000 * 60 * 60 * 24)
    if (diffDays <= 2) {
      return res.status(400).json({ message: 'Cannot cancel an appointment within 2 days of the scheduled date' })
    }

    const { data, error } = await supabase
      .from('Appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('customer_id', user.id)
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })
    res.status(200).json({ message: 'Appointment cancelled successfully', data })
  } catch (err) {
    console.error('Cancel appointment error:', err)
    res.status(500).json({ error: err.message })
  }
})
  return router
}