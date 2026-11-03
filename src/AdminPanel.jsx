
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const emptyForm = {
  item: '',
  class: '',
  description: '',
  containment: '',
  image: ''
}

function AdminPanel() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadItems() {
    const { data, error } = await supabase
      .from('scp_subjects')
      .select('*')
      .order('id')

    if (error) {
      setMessage(error.message)
    } else {
      setItems(data || [])
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    })
  }

  async function uploadImage(file) {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file.')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be smaller than 5 MB.')
    }

    const extension = file.name.split('.').pop().toLowerCase()
    const fileName = `${crypto.randomUUID()}.${extension}`
    const filePath = `scp/${fileName}`

    const { error } = await supabase.storage
      .from('scp-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    const { data } = supabase.storage
      .from('scp-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (!form.item.trim()) {
        throw new Error('Please enter an SCP name.')
      }

      let imageUrl = form.image

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile)
      }

      const record = {
        ...form,
        image: imageUrl
      }

      let error

      if (editingId !== null) {
        const result = await supabase
          .from('scp_subjects')
          .update(record)
          .eq('id', editingId)

        error = result.error
      } else {
        const result = await supabase
          .from('scp_subjects')
          .insert([record])

        error = result.error
      }

      if (error) {
        throw error
      }

      setMessage(
        editingId !== null
          ? 'SCP updated successfully!'
          : 'SCP added successfully!'
      )

      setForm(emptyForm)
      setSelectedFile(null)
      setEditingId(null)
      await loadItems()

    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  function startEditing(scp) {
    setEditingId(scp.id)

    setForm({
      item: scp.item || '',
      class: scp.class || '',
      description: scp.description || '',
      containment: scp.containment || '',
      image: scp.image || ''
    })

    setSelectedFile(null)
    setMessage('')
    window.scrollTo(0, 0)
  }

  async function deleteItem(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this SCP?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('scp_subjects')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('SCP deleted successfully!')
      await loadItems()
    }
  }

  return (
    <main>
      <h1>SCP Admin Panel</h1>
      <p>Add, edit and delete SCP records.</p>

      <form onSubmit={handleSubmit}>
        <h2>{editingId !== null ? 'Edit SCP' : 'Add New SCP'}</h2>

        <input
          name="item"
          placeholder="SCP Name"
          value={form.item}
          onChange={handleChange}
          required
        />

        <input
          name="class"
          placeholder="Class"
          value={form.class}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <textarea
          name="containment"
          placeholder="Containment"
          value={form.containment}
          onChange={handleChange}
        />

        <input
          name="image"
          placeholder="Image URL (optional)"
          value={form.image}
          onChange={handleChange}
        />

        <p>Or upload an image from your computer:</p>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            setSelectedFile(e.target.files[0] || null)
          }}
        />

        <button type="submit" disabled={loading}>
          {loading
            ? 'Saving...'
            : editingId !== null
              ? 'Save Changes'
              : 'Add SCP'}
        </button>

        {editingId !== null && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null)
              setForm(emptyForm)
              setSelectedFile(null)
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {message && <p>{message}</p>}

      <h2>Existing SCP Records</h2>

      {items.map((scp) => (
        <div className="scp-card" key={scp.id}>
          <h3>{scp.item}</h3>
          <p>Class: {scp.class}</p>

          {scp.image && (
            <img
              src={scp.image}
              alt={scp.item}
              style={{ width: '180px', maxWidth: '100%' }}
            />
          )}

          <button
            type="button"
            onClick={() => startEditing(scp)}
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => deleteItem(scp.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </main>
  )
}

export default AdminPanel
