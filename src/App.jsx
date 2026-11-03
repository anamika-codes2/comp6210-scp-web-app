
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { supabase } from './supabase'
import ItemDetail from './ItemDetail'
import AdminPanel from './AdminPanel'
import AdminLogin from './AdminLogin'
import './App.css'

function Home() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadSubjects() {
      const { data, error } = await supabase
        .from('scp_subjects')
        .select('*')
        .order('id')

      if (error) {
        setError(error.message)
      } else {
        setSubjects(data || [])
      }

      setLoading(false)
    }

    loadSubjects()
  }, [])

  const filteredSubjects = subjects.filter((scp) =>
    `${scp.item} ${scp.class} ${scp.description || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <main>
      <h1>SCP Foundation Database</h1>
      <p>Explore SCP subjects and their classifications.</p>

      <input
        type="text"
        placeholder="Search SCP subjects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>Loading SCP subjects...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <section id="subjects">
          <p>Total SCP Subjects: {subjects.length}</p>
          <p>Showing: {filteredSubjects.length}</p>

          {filteredSubjects.map((scp) => (
            <div className="scp-card" key={scp.id}>
              <h2>
                <Link to={`/item/${scp.id}`}>
                  {scp.item}
                </Link>
              </h2>

              <p>Class: {scp.class}</p>
              <p>{scp.description}</p>

              <h3>Containment</h3>
              <p>{scp.containment}</p>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}

function AdminPage({ user, onLogin }) {
  if (!user) {
    return <AdminLogin onLogin={onLogin} />
  }

  return <AdminPanel />
}

function App() {
  const [user, setUser] = useState(null)
  const [checkingLogin, setCheckingLogin] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setCheckingLogin(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
        setCheckingLogin(false)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert(error.message)
    } else {
      setUser(null)
    }
  }

  return (
    <BrowserRouter>
      <nav className="navbar">
        <h2>SCP Foundation</h2>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/admin">Admin Panel</Link>

        {user && (
          <>
            {' | '}
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </nav>

      {checkingLogin ? (
        <main>
          <p>Checking login...</p>
        </main>
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route
            path="/admin"
            element={
              <AdminPage
                user={user}
                onLogin={setUser}
              />
            }
          />
        </Routes>
      )}
    </BrowserRouter>
  )
}

export default App
