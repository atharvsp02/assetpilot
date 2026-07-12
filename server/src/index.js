import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import departmentsRouter from './routes/departments.js'
import categoriesRouter from './routes/categories.js'
import employeesRouter from './routes/employees.js'
import assetsRouter from './routes/assets.js'
import allocationsRouter from './routes/allocations.js'
import bookingsRouter from './routes/bookings.js'
import maintenanceRouter from './routes/maintenance.js'
import auditsRouter from './routes/audits.js'

const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))

// Routers are mounted here as each feature slice lands.
app.use('/auth', authRouter)
app.use('/departments', departmentsRouter)
app.use('/categories', categoriesRouter)
app.use('/employees', employeesRouter)
app.use('/assets', assetsRouter)
app.use('/allocations', allocationsRouter)
app.use('/bookings', bookingsRouter)
app.use('/maintenance', maintenanceRouter)
app.use('/audits', auditsRouter)

// Central error handler (last).
app.use((err, req, res, next) => {
  const status = err.status || 500
  res.status(status).json({
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Something went wrong',
  })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`AssetFlow API on :${PORT}`))
