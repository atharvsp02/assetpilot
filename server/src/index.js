import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'

const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))

// Routers are mounted here as each feature slice lands.
app.use('/auth', authRouter)

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
