import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UI_ELEMENTS = [
  { key: 'header', label: 'Header' },
  { key: 'loaderBox', label: 'Loader Box' },
  { key: 'mainRouter', label: 'Main Router' },
  { key: 'mcdRotatingPhone', label: 'Mcd Rotating Phone' },
  { key: 'mcdPopupPage', label: 'Mcd Popup Page' },
  { key: 'step1DevExtUi', label: 'Step1 Dev Ext UI' },
  { key: 'cdkOverlayContainer', label: 'CDK Overlay Container' },
];

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api/ui';

export default function AdminDashboard() {
  const [uiConfig, setUiConfig] = useState({});
  const [jackpot, setJackpot] = useState({ value: 0, lastWinner: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [uiRes, jackpotRes] = await Promise.all([
        axios.get(`${API_BASE}/ui-config`),
        axios.get(`${API_BASE}/jackpot`),
      ]);
      setUiConfig(uiRes.data);
      setJackpot(jackpotRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleToggle = (key) => {
    setUiConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleJackpotChange = (e) => {
    setJackpot((prev) => ({ ...prev, value: e.target.value }));
  };

  const saveConfig = async () => {
    setSaving(true);
    await axios.post(`${API_BASE}/ui-config`, uiConfig);
    await axios.post(`${API_BASE}/jackpot`, { value: jackpot.value });
    setSaving(false);
    alert('Configuration saved!');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2>Admin Panel</h2>
      <h3>UI Elements</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {UI_ELEMENTS.map((el) => (
          <li key={el.key} style={{ marginBottom: 12 }}>
            <label>
              <input
                type="checkbox"
                checked={!!uiConfig[el.key]}
                onChange={() => handleToggle(el.key)}
              />
              {' '}{el.label}
            </label>
          </li>
        ))}
      </ul>
      <h3>Jackpot</h3>
      <div style={{ marginBottom: 16 }}>
        <label>
          Jackpot Value:{' '}
          <input
            type="number"
            value={jackpot.value}
            onChange={handleJackpotChange}
            style={{ width: 120 }}
          />
        </label>
      </div>
      <button onClick={saveConfig} disabled={saving} style={{ padding: '8px 24px', fontWeight: 'bold' }}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
