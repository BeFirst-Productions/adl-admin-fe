import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Row, Spinner } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { getKpis } from "@/api/apis";

const StatCard = ({ icon, variant, name, value, loading }) => {
  return (
    <Card>
      <CardBody>
        <Row>
          <Col xs={6}>
            <div className={`avatar-md bg-opacity-10 rounded flex-centered bg-${variant}`}>
              <IconifyIcon
                icon={icon}
                height={32}
                width={32}
                className={`text-${variant}`}
              />
            </div>
          </Col>
          <Col xs={6} className="text-end">
            <p className="text-muted mb-0 text-truncate">{name}</p>
            <h3 className="text-dark mt-1 mb-0">
              {loading ? <Spinner size="sm" /> : value ?? "-"}
            </h3>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

const Stats = ({ days = 28 }) => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    pageViews: null,
    activeUsers: null,
    events: null,
    newUsers: null,
  });

  // Format numbers cleanly (12,345 → 12.3K)
  const fmt = (n) =>
    typeof n === "number"
      ? n.toLocaleString()
      : n ?? "-";

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getKpis(days);
      if (res?.success && res?.data) {
        const d = res.data;
        setKpis({
          pageViews: d.screenPageViews ?? 0,
          activeUsers: d.activeUsers ?? 0,
          events: d.eventCount ?? 0,
          newUsers: d.newUsers ?? 0,
        });
      }
    } catch (err) {
      console.error("Stats fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [days]);

  return (
    <Row className="g-2 g-lg-3 h-100">
      <Col md={6} xxl={12}>
        <StatCard
          icon="iconamoon:eye-duotone"
          variant="primary"
          name="Page Views"
          value={fmt(kpis.pageViews)}
          loading={loading}
        />
      </Col>

      <Col md={6} xxl={12}>
        <StatCard
          icon="iconamoon:trend-up-bold"
          variant="success"
          name="Events"
          value={fmt(kpis.events)}
          loading={loading}
        />
      </Col>

      <Col md={6} xxl={12}>
        <StatCard
          icon="mdi:account-group"
          variant="danger"
          name="Active Users"
          value={fmt(kpis.activeUsers)}
          loading={loading}
        />
      </Col>

      <Col md={6} xxl={12}>
        <StatCard
          icon="iconamoon:profile-circle-duotone"
          variant="warning"
          name="New Users"
          value={fmt(kpis.newUsers)}
          loading={loading}
        />
      </Col>
    </Row>
  );
};

export default Stats;
