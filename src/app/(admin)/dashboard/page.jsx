import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import { Col, Row } from 'react-bootstrap';
import Stats from './analytics/components/Stats';
import Conversions from './analytics/components/Conversions';


export default function Home() {
  return <>
      <PageBreadcrumb title="Dashboard" />
      <PageMetaData title="Dashboard" />

      <Row>
        <Col xxl={3}>
          <Stats />
        </Col>
        <Col xxl={9}>
          <Conversions />
        </Col>
      </Row>
     
    </>;
}