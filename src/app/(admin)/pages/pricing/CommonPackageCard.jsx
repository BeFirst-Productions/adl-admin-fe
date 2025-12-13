

import React from 'react';
import {
  Card, Button, Badge
} from 'react-bootstrap';

import IconifyIcon from '@/components/wrappers/IconifyIcon';



export const CommonPackageCard = ({ pkg, onEdit, onDelete }) => {
  const points = (pkg.points || []).map(p => typeof p === 'string' ? p : p.text);
  return (
    <Card style={cardStyles.card} className="h-100">
      {pkg.iconUrl ? (
        <div style={cardStyles.imgWrapper}>
          <img src={pkg.iconUrl} alt={pkg.title} style={cardStyles.img} />
        </div>
      ) : (
        <div style={{ ...cardStyles.imgWrapper, fontSize: 20, color: '#6c757d' }}>
          <IconifyIcon icon="bx:image" className="fs-2" />
        </div>
      )}

      <Card.Body className="d-flex flex-column">
        <div style={cardStyles.titleRow}>
          <div>
            <h6 className="mb-0 text-uppercase">{pkg.title}</h6>
            <small className="text-muted">{pkg.description}</small>
          </div>
          <div className="text-end">
            {pkg.is_home && <Badge bg="info" className="mb-1">Home</Badge>}
            {pkg.is_freezone && <Badge bg="secondary" className="mb-1 ms-1">Freezone</Badge>}
          </div>
        </div>

        <div className="mt-3">
          <div style={cardStyles.price}>
            {currency}{pkg.amount}
            <span className="text-muted" style={{ fontSize: 14, fontWeight: 500 }}> / Month</span>
          </div>

          <hr />

          <ul style={cardStyles.pointsList}>
            {points.length ? points.map((pt, i) => (
              <li key={i} className="text-dark small">
                <IconifyIcon icon="bx:check-circle" className="text-primary me-2" />{pt}
              </li>
            )) : <li className="text-muted small">No features listed</li>}
          </ul>
        </div>

        <div style={cardStyles.actionRow}>
          <Button variant="outline-primary" size="sm" onClick={() => onEdit(pkg)}>Edit</Button>
          <Button variant="outline-danger" size="sm" onClick={() => onDelete(pkg)}>Delete</Button>
        </div>
      </Card.Body>
    </Card>
  );
};
