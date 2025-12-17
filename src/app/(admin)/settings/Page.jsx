// ============================================================
// Settings.jsx - Main Settings Page
// ============================================================

import { useState } from 'react';
import { Container, Row, Col, Card, Nav, Tab } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { GeneralSettings } from './components/GeneralSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { AppearanceSettings } from './components/AppearanceSettings';
import SystemInfo from './components/SystemInfo';



export default function Settings() {
  const [activeTab, setActiveTab] = useState('system');

  const tabs = [
      { key: 'system', label: 'System Info', icon: 'bx:info-circle' },
    { key: 'general', label: 'General', icon: 'bx:cog' },
    { key: 'notifications', label: 'Notifications', icon: 'bx:bell' },
    { key: 'security', label: 'Security', icon: 'bx:shield' },
    { key: 'appearance', label: 'Appearance', icon: 'bx:palette' },
  ];

  return (
    <>
      <PageBreadcrumb title="Settings" subName="System" />
      <PageMetaData title="Settings" />

      <Container fluid>
        <Row>
          <Col xs={12}>
            <Card className="shadow-sm">
              <Card.Body className="p-0">
                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                  <Row className="g-0 flex justify-content-center">
                    {/* Sidebar Navigation */}
                    {/* <Col lg={3} className="border-end">
                      <div className="p-3">
                        <h5 className="fw-semibold mb-3">Settings</h5>
                        <Nav variant="pills" className="flex-column gap-1">
                          {tabs.map((tab) => (
                            <Nav.Item key={tab.key}>
                              <Nav.Link
                                eventKey={tab.key}
                                className="d-flex align-items-center gap-2 rounded"
                              >
                                <IconifyIcon icon={tab.icon} className="fs-20" />
                                <span>{tab.label}</span>
                              </Nav.Link>
                            </Nav.Item>
                          ))}
                        </Nav>
                      </div>
                    </Col> */}

                    {/* Content Area */}
                    <Col lg={9}>
                      <div className="p-4 ">
                        <Tab.Content>
                                   <Tab.Pane eventKey="system">
                            <SystemInfo />
                          </Tab.Pane>
                          <Tab.Pane eventKey="general">
                            <GeneralSettings />
                          </Tab.Pane>
                          {/* <Tab.Pane eventKey="notifications">
                            <NotificationSettings />
                          </Tab.Pane> */}
                          <Tab.Pane eventKey="security">
                            <SecuritySettings />
                          </Tab.Pane>
                          <Tab.Pane eventKey="appearance">
                            <AppearanceSettings />
                          </Tab.Pane>
                   
                        </Tab.Content>
                      </div>
                    </Col>
                  </Row>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}