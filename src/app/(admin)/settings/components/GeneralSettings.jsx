import { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { toast } from 'react-toastify';

export function GeneralSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Reback CMS',
    siteTagline: 'Professional Content Management System',
    adminEmail: 'admin@reback.com',
    timezone: 'Asia/Kolkata',
    language: 'en',
    dateFormat: 'YYYY-MM-DD',
  });

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem('generalSettings', JSON.stringify(settings));
    toast.success('General settings saved successfully!');
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-semibold mb-2">General Settings</h4>
        <p className="text-muted mb-0">
          Configure basic system settings and preferences
        </p>
      </div>

      <Card className="mb-3">
        <Card.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Site Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Site Tagline</Form.Label>
                  <Form.Control
                    type="text"
                    name="siteTagline"
                    value={settings.siteTagline}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Admin Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="adminEmail"
                    value={settings.adminEmail}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Timezone</Form.Label>
                  <Form.Select name="timezone" value={settings.timezone} onChange={handleChange}>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Language</Form.Label>
                  <Form.Select name="language" value={settings.language} onChange={handleChange}>
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                    <option value="hi">Hindi</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date Format</Form.Label>
                  <Form.Select name="dateFormat" value={settings.dateFormat} onChange={handleChange}>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
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