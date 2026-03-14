import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PAGE_SIZE = 10;

const WidgetList = ({ onEdit, onDelete }) => {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    axios.get('/api/widgets')
      .then(res => {
        setWidgets(res.data.widgets || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredWidgets = widgets.filter(w =>
    (w.name || w.title || '').toLowerCase().includes(filter.toLowerCase()) ||
    (w.type || '').toLowerCase().includes(filter.toLowerCase()) ||
    (w.position || '').toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredWidgets.length / PAGE_SIZE);
  const pagedWidgets = filteredWidgets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <div>Loading widgets...</div>;
  if (!widgets.length) return <div>No widgets found.</div>;

  return (
    <div style={{ marginTop: 32 }}>
      <h3>Widget List</h3>
      <input
        placeholder="Filter by title, type, or position"
        value={filter}
        onChange={e => { setFilter(e.target.value); setPage(1); }}
        style={{ marginBottom: 16, width: '100%', padding: 8 }}
      />
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Position</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pagedWidgets.map(widget => (
            <tr key={widget._id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{widget.name || widget.title}</td>
              <td>{widget.type}</td>
              <td>{widget.position}</td>
              <td>
                <button onClick={() => onEdit(widget)} style={{ marginRight: 8 }}>Edit</button>
                <button onClick={() => onDelete(widget._id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 16 }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            style={{ marginRight: 4, fontWeight: page === i + 1 ? 'bold' : 'normal' }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WidgetList;
