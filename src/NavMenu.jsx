
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './supabase'

function NavMenu() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('scp_subjects')
        .select('id, item')

      if (error) {
        console.log(error)
      } else {
        setItems(data)
      }
    }

    fetchItems()
  }, [])

  return (
    <nav>
      <h2>SCP Subjects</h2>
      <ul>
        {items.map((scp) => (
          <li key={scp.id}>
            <Link to={`/item/${scp.id}`}>
              {scp.item}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default NavMenu
