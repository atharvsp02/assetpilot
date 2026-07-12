import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup as signupApi } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await signupApi({ name, email, password })
      login(token, user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[#efece8] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#37322f]">AssetFlow</h1>
          <p className="text-sm text-[#847d76]">Create your account</p>
        </div>
        <form onSubmit={submit} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-[#e6e3df]">
          <h2 className="mb-4 text-lg font-semibold text-[#37322f]">Sign up</h2>
          {error && (
            <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          <label className="block text-sm font-medium text-[#605a57]">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mb-3 mt-1 w-full rounded-md border border-[#e0dedb] px-3 py-2 text-sm focus:border-[#37322f] focus:outline-none focus:ring-1 focus:ring-[#37322f]"
          />
          <label className="block text-sm font-medium text-[#605a57]">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mb-3 mt-1 w-full rounded-md border border-[#e0dedb] px-3 py-2 text-sm focus:border-[#37322f] focus:outline-none focus:ring-1 focus:ring-[#37322f]"
          />
          <label className="block text-sm font-medium text-[#605a57]">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mb-2 mt-1 w-full rounded-md border border-[#e0dedb] px-3 py-2 text-sm focus:border-[#37322f] focus:outline-none focus:ring-1 focus:ring-[#37322f]"
          />
          <p className="mb-4 text-xs text-[#a39c94]">
            New accounts are created as <span className="font-medium">Employees</span>. An Admin can
            promote you later.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#37322f] py-2 text-sm font-medium text-white hover:bg-[#4b453f] disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
          <p className="mt-4 text-center text-sm text-[#847d76]">
            Have an account?{' '}
            <Link to="/login" className="font-medium text-[#37322f] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
