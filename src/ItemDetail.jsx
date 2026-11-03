
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from './supabase'

function ItemDetail() {
  const { id } = useParams()

  const [item, setItem] = useState(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadItem() {
      setLoading(true)
      setError('')

      const { data, error: itemError } = await supabase
        .from('scp_subjects')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (itemError) {
        setError(itemError.message)
      } else if (!data) {
        setError('SCP subject not found.')
      } else {
        setItem(data)

        const { data: extraDescription } = await supabase
          .from('descriptions')
          .select('description_text')
          .eq('object_id', data.id)
          .limit(1)
          .maybeSingle()

        setDescription(
          extraDescription?.description_text ||
          data.description ||
          'No description available.'
        )
      }

      setLoading(false)
    }

    loadItem()
  }, [id])

  if (loading) {
    return <p>Loading SCP details...</p>
  }

  if (error) {
    return <p>Error: {error}</p>
  }

  if (!item) {
    return <p>SCP subject not found.</p>
  }

  return (
    <main>
      <h1>{item.item}</h1>

      <div className="scp-card">
        {item.image && (
          <img
            src={item.image}
            alt={item.item}
            style={{
              maxWidth: '100%',
              width: '350px',
              borderRadius: '10px'
            }}
          />
        )}

        <h3>Object Class</h3>
        <p>{item.class}</p>

        <h3>Description</h3>
        <p>{description}</p>

        <h3>Containment Procedures</h3>
        <p>{item.containment}</p>
      </div>

      <p>
        <Link to="/">Back to SCP List</Link>
      </p>
    </main>
  )
}

export default ItemDetail
