import { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { toast } from 'react-toastify';

export function AppearanceSettings() {
  const [settings, setSettings] = useState({
    theme: 'dark',
    sidebarSize: 'default',
    layoutWidth: 'fluid',
  });

  const handleSave = () => {
    localStorage.setItem('appearanceSettings', JSON.stringify(settings));
    toast.success('Appearance settings saved successfully!');
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-semibold mb-2">Appearance Settings</h4>
        <p className="text-muted mb-0">
          Customize the look and feel of your dashboard
        </p>
      </div>

      <Card className="mb-3">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Theme</Form.Label>
            <Form.Select 
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Sidebar Size</Form.Label>
            <Form.Select 
              value={settings.sidebarSize}
              onChange={(e) => setSettings({ ...settings, sidebarSize: e.target.value })}
            >
              <option value="default">Default</option>
              <option value="compact">Compact</option>
              <option value="small">Small</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Layout Width</Form.Label>
            <Form.Select 
              value={settings.layoutWidth}
              onChange={(e) => setSettings({ ...settings, layoutWidth: e.target.value })}
            >
              <option value="fluid">Fluid</option>
              <option value="boxed">Boxed</option>
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-end">
        <Button variant="primary" onClick={handleSave}>
          <IconifyIcon icon="bx:save" className="me-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}