import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ProductDetailView = ({ product }) => {
  const { title, excerpt, description, category, subCategory } = product;
  const navigate = useNavigate();

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <Card className="shadow-sm border-0 p-4">
      <div className="ps-xl-3 mt-3 mt-xl-0">

        {/* TITLE */}
        <h2 className="fw-bold text-dark mb-3">{title}</h2>

        {/* CATEGORY BADGES */}
        <div className="d-flex gap-2 mb-3 flex-wrap">
          <span className="badge px-3 py-2 bg-primary text-white">
            <IconifyIcon icon="mdi:folder" className="me-1" />
            {category}
          </span>

          <span className="badge px-3 py-2 bg-secondary text-white">
            <IconifyIcon icon="mdi:subdirectory-arrow-right" className="me-1" />
            {subCategory}
          </span>
        </div>

        {/* EXCERPT */}
        <div className="mb-4">
          <h5 className="fw-semibold text-dark mb-2">Summary</h5>
          <p className="text-white fs-4">{excerpt}</p>
        </div>

        {/* DESCRIPTION */}
        <div className="mb-4">
          <h5 className="fw-semibold text-dark mb-2">Full Description</h5>
          <p className="text-white   fs-4" style={{ lineHeight: "1.7" }}>
            {stripHtml(description)}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="d-flex justify-content-center gap-2 mt-4">
          <Button
            onClick={() => navigate("/blogs")}
            variant="danger"
            type="button"
            className="px-4 py-2 d-flex align-items-center gap-2"
          >
            <IconifyIcon icon="bx:x" className="fs-18" />
            Close
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductDetailView;
