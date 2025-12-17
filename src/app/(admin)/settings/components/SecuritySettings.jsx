import { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { toast } from 'react-toastify';

export function SecuritySettings() {
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem('securitySettings', JSON.stringify(settings));
    toast.success('Security settings saved successfully!');
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-semibold mb-2">Security Settings</h4>
        <p className="text-muted mb-0">
          Manage security and authentication preferences
        </p>
      </div>

      <Card className="mb-3">
        <Card.Body>
          <Form.Check
            type="switch"
            id="two-factor"
            label={
              <div>
                <div className="fw-medium">Two-Factor Authentication</div>
                <small className="text-muted">Add an extra layer of security to your account</small>
              </div>
            }
            checked={settings.twoFactorAuth}
            onChange={() => handleToggle('twoFactorAuth')}
            className="mb-4"
          />

          <Form.Group className="mb-3">
            <Form.Label>Session Timeout (minutes)</Form.Label>
            <Form.Control
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
            />
            <Form.Text>Auto logout after inactivity</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password Expiry (days)</Form.Label>
            <Form.Control
              type="number"
              value={settings.passwordExpiry}
              onChange={(e) => setSettings({ ...settings, passwordExpiry: e.target.value })}
            />
            <Form.Text>Force password change after specified days</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Max Login Attempts</Form.Label>
            <Form.Control
              type="number"
              value={settings.loginAttempts}
              onChange={(e) => setSettings({ ...settings, loginAttempts: e.target.value })}
            />
            <Form.Text>Account lock after failed attempts</Form.Text>
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