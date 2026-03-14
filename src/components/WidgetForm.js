import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WidgetForm = ({ editingWidget }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('game_spotlight');
  const [position, setPosition] = useState('main_top');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (editingWidget) {
      setTitle(editingWidget.name || editingWidget.title || '');
      setType(editingWidget.type || 'game_spotlight');
      setPosition(editingWidget.position || 'main_top');
      setContent(editingWidget.content || '');
    }
  }, [editingWidget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title, type, position, content };
    try {
      if (editingWidget && editingWidget._id) {
        await axios.put(`/api/widgets/${editingWidget._id}`, payload);
        alert('Widget updated!');
      } else {
        await axios.post('/api/widgets', payload);
        alert('Widget created!');
      }
      window.location.reload();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>{editingWidget ? 'Edit Widget' : 'Create Widget'}</h2>
      <label>
        Title:<br />
        <input value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%' }} />
      </label>
      <br />
      <label>
        Type:<br />
        <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%' }}>
          <option value="game_spotlight">Game Spotlight</option>
          <option value="custom_html">Custom HTML</option>
        </select>
      </label>
      <br />
      <label>
        Position:<br />
        <select value={position} onChange={e => setPosition(e.target.value)} style={{ width: '100%' }}>
          <option value="main_top">Main Top</option>
          <option value="main_middle">Main Middle</option>
        </select>
      </label>
      <br />
      <label>
        Content:<br />
        <textarea value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%' }} />
      </label>
      <br />
      <button type="submit" style={{ marginTop: 12 }}>{editingWidget ? 'Update Widget' : 'Create Widget'}</button>
    </form>
  );
};

export default WidgetForm;
