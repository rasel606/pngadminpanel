import React, { useState } from 'react';
import WidgetForm from '../components/WidgetForm';
import WidgetList from '../components/WidgetList';

const WidgetAdmin = () => {
  const [editingWidget, setEditingWidget] = useState(null);

  const handleEdit = (widget) => {
    setEditingWidget(widget);
    // Optionally, prefill WidgetForm with widget data
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this widget?')) return;
    try {
      await fetch(`/api/widgets/${id}`, { method: 'DELETE' });
      window.location.reload(); // Simple reload for now
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Widget Management</h1>
      <WidgetForm editingWidget={editingWidget} />
      <WidgetList onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default WidgetAdmin;
