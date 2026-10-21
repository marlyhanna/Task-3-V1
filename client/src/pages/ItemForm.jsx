import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

const STATUSES = ['lost', 'found', 'claimed'];
const CATEGORIES = ['electronics', 'clothing', 'documents', 'accessories', 'other'];

const emptyForm = {
  title: '',
  status: 'lost',
  category: 'electronics',
  location: '',
  description: '',
};

// "lost" -> "Lost" for display only; the value sent stays lowercase
const label = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Get the server's error message from an axios error
const errorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';

export default function ItemForm() {
  const { id } = useParams(); // undefined on /items/new
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Part 3: when editing, load the item and fill the form
  useEffect(() => {
    if (!isEdit) {
      setForm(emptyForm);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    api
      .get(`/items/${id}`)
      .then((res) => {
        if (cancelled) return;
        const item = res.data;
        setForm({
          title: item.title ?? '',
          status: item.status ?? 'lost',
          category: item.category ?? 'electronics',
          location: item.location ?? '',
          description: item.description ?? '',
        });
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  // Part 1: one handler for every field, using the input's name
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Part 2 + 3: POST for a new item, PATCH when editing
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // Only these five fields, never reportedBy
    const body = {
      title: form.title,
      status: form.status,
      category: form.category,
      location: form.location,
      description: form.description,
    };

    try {
      if (isEdit) {
        await api.patch(`/items/${id}`, body);
      } else {
        await api.post('/items', body);
      }
      navigate('/items');
    } catch (err) {
      // 400, 409 and 403 all end up here
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400';

  return (
    <div className="mx-auto mt-6 max-w-lg rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h1 className="mb-4 text-xl font-semibold">
        {isEdit ? 'Edit Item' : 'Report Item'}
      </h1>

      {error && (
        <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
            className={fieldClass}
          />

          <select name="status" value={form.status} onChange={handleChange} className={fieldClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>

          <select name="category" value={form.category} onChange={handleChange} className={fieldClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {label(c)}
              </option>
            ))}
          </select>

          <input
            name="location"
            type="text"
            placeholder="Location (optional)"
            value={form.location}
            onChange={handleChange}
            className={fieldClass}
          />

          <textarea
            name="description"
            placeholder="Description (optional)"
            rows={3}
            value={form.description}
            onChange={handleChange}
            className={fieldClass}
          />

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}
    </div>
  );
}