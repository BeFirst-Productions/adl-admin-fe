// src/pages/PremiumPackages.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Row, Col, Card, Button, Tabs, Tab, Spinner, Modal, Form, Badge
} from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  getAllCommonPackages,
  createCommonPackage,
  updateCommonPackage,
  deleteCommonpackage,
  getCategoryPackages,
  createCategoryPackage,
  updateCategoryPackage,
  deleteCategoryPackage
} from '@/api/apis';
import { toast } from 'react-toastify';
import { STATIC_FREEZONES } from './freezone';
import DeleteConfrimModal from '../../Common/DeleteConfrimModal';

const currency = 'UAD ';

/* ===================== Inline card styles for premium look ===================== */
const cardStyles = {
  card: {
    borderRadius: 12,
    boxShadow: '0 8px 20px rgba(13,20,33,0.06)',
    minHeight: 320,
    display: 'flex',
    flexDirection: 'column'
  },
  imgWrapper: {
    height: 180,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    background: '#fafafa'
  },
  img: {
    maxHeight: '100%',
    width: 'auto',
    objectFit: 'cover'
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8
  },
  pointsList: {
    paddingLeft: 18,
    marginTop: 8,
    marginBottom: 0
  },
  actionRow: {
    marginTop: 'auto',
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap'
  }
};

/* -------------------- Utility to extract API data defensively ------------------ */
const unwrap = (res) => {
  if (!res) return null;
  if (res.data && res.data.data !== undefined) return res.data.data;
  if (res.data !== undefined) return res.data;
  return res;
};

/* ===================== CommonPackageCard ===================== */
const CommonPackageCard = ({ pkg, onEdit, onDelete }) => {
  const points = (pkg.points || []).map(p => typeof p === 'string' ? p : p.text);
  return (
   <Card
  className="h-100 border-0 overflow-hidden"
  style={{
    borderRadius: 20,
    boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
    transition: "all 0.35s ease",
  }}
  onMouseEnter={(e) =>
    (e.currentTarget.style.transform = "scale(1.02)")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.transform = "scale(1)")
  }
>
  {/* ================= HEADER ================= */}
  <div
    style={{
      height: 110,
      background: "linear-gradient(135deg, #1e293b, #0f172a)", // admin panel style
      position: "relative",
    }}
  >
    {/* LOGO */}
    <div
      style={{
        position: "absolute",
        bottom: -45,
        left: 24,
        width: 90,
        height: 90,
        borderRadius: "50%",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
      }}
    >
      {pkg.iconUrl ? (
        <img
          src={pkg.iconUrl}
          alt={pkg.title}
          style={{
            width: 55,
            height: 55,
            objectFit: "contain",
          }}
        />
      ) : (
        <IconifyIcon
          icon="bx:image"
          style={{ fontSize: 36 }}
          className="text-primary"
        />
      )}
    </div>
  </div>

  {/* ================= BODY ================= */}
  <Card.Body
    className="px-4 d-flex flex-column"
    style={{ paddingTop: 70 }}
  >
    {/* TITLE + BADGES */}
    <div className="d-flex justify-content-between align-items-start mb-3">
      <div>
        <h5 className="fw-bold mb-1">{pkg.title}</h5>
        <small className="text-muted">
          {pkg.description}
        </small>
      </div>

      <div className="text-end">
        {pkg.is_home && (
          <span className="badge rounded-pill bg-info mb-1">
            Home
          </span>
        )}
        {pkg.is_freezone && (
          <span className="badge rounded-pill bg-dark ms-1">
            Freezone
          </span>
        )}
      </div>
    </div>

    {/* PRICE */}
    <div
      style={{
        background: "#f8f9fa",
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 18,
      }}
    >
      <div className="text-muted small">Starting from</div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "#0d6efd",
        }}
      >
        {currency}
        {pkg.amount}
      </div>
    </div>

    {/* FEATURES */}
    <ul className="list-unstyled mb-4">
      {points.length ? (
        points.map((pt, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 10,
              fontSize: 14,
            }}
          >
            <IconifyIcon
              icon="bx:check"
              className="me-2 text-success"
            />
            {pt}
          </li>
        ))
      ) : (
        <li className="text-muted small">
          No features listed
        </li>
      )}
    </ul>

    {/* ACTIONS */}
    <div
      style={{
        marginTop: "auto",
        display: "flex",
        gap: 12,
      }}
    >
      <Button
        variant="primary"
        size="sm"
        className="w-100"
        onClick={() => onEdit(pkg)}
      >
        Edit
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        className="w-100"
        onClick={() => onDelete(pkg)}
      >
        Delete
      </Button>
    </div>
  </Card.Body>
</Card>

  );
};

/* ===================== CategoryPackageCard ===================== */
const CategoryPackageCard = ({ pkg, onEdit, onDelete }) => {
  const points = (pkg.points || []).map(p => p.text);
  return (
    <Card style={{ ...cardStyles.card }} className="h-100">
      <Card.Body className="d-flex flex-column">
        <div style={cardStyles.titleRow}>
          <div>
            <h6 className="mb-0">{pkg.title}</h6>
            <small className="text-muted">Price: {currency}{pkg.price}</small>
          </div>
        </div>

        <div className="mt-3">
          <ul style={cardStyles.pointsList}>
            {points.length ? points.map((pt, i) => (
              <li key={i} className="small">{pt}</li>
            )) : <li className="text-muted small">No points</li>}
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

/* ===================== CommonPackageModal ===================== */
const CommonPackageModal = ({ show, onHide, initial = null, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [pointsStr, setPointsStr] = useState('');
  const [isHome, setIsHome] = useState(false);
  const [isFreezone, setIsFreezone] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setTitle(initial?.title || '');
    setDescription(initial?.description || '');
    setAmount(initial?.amount ?? '');
    setPointsStr(
      (initial?.points || [])
        .map(p => (typeof p === 'string' ? p : p.text))
        .join(',')
    );
    setIsHome(!!initial?.is_home);
    setIsFreezone(!!initial?.is_freezone);
    setPreview(initial?.iconUrl || null);
    setFile(null);
    setSubmitting(false);
    setErrors({});
  }, [initial, show]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);

    if (f) {
      setPreview(URL.createObjectURL(f));
      setErrors(prev => ({ ...prev, image: null }));
    } else {
      setPreview(initial?.iconUrl || null);
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    const points = pointsStr.split(',').map(s => s.trim()).filter(Boolean);

    if (!title) newErrors.title = 'Title is required';
    if (!description) newErrors.description = 'Description is required';

    if (amount === '' || Number.isNaN(Number(amount))) {
      newErrors.amount = 'Enter a valid amount';
    }

    if (!points.length || points.length > 4) {
      newErrors.points = 'Points must be between 1 and 4 items';
    }

    if (isHome && isFreezone) {
      newErrors.flags = 'Select either Home or Freezone, not both';
    }

    // Image validation (required on create)
    if (!initial && !file) {
      newErrors.image = 'Image is required';
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        id: initial?._id,
        title,
        description,
        amount,
        points,
        is_home: isHome,
        is_freezone: isFreezone,
        imageFile: file
      });
      onHide();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {initial ? 'Edit Common Package' : 'Create Common Package'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form noValidate>
          <Row className="g-3">
            <Col md={8}>
              {/* Title */}
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
                  value={title}
                  isInvalid={!!errors.title}
                  onChange={e => {
                    setTitle(e.target.value);
                    setErrors(prev => ({ ...prev, title: null }));
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Description */}
              <Form.Group className="mt-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  isInvalid={!!errors.description}
                  onChange={e => {
                    setDescription(e.target.value);
                    setErrors(prev => ({ ...prev, description: null }));
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>

              <Row className="mt-2">
                {/* Amount */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                      value={amount}
                      isInvalid={!!errors.amount}
                      onChange={e => {
                        setAmount(e.target.value);
                        setErrors(prev => ({ ...prev, amount: null }));
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.amount}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                {/* Points */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Points (comma separated)</Form.Label>
                    <Form.Control
                      value={pointsStr}
                      isInvalid={!!errors.points}
                      onChange={e => {
                        setPointsStr(e.target.value);
                        setErrors(prev => ({ ...prev, points: null }));
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.points}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              {/* Checkboxes */}
              <Row className="mt-2">
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    label="Is Home"
                    checked={isHome}
                    onChange={e => {
                      setIsHome(e.target.checked);
                      if (e.target.checked) setIsFreezone(false);
                      setErrors(prev => ({ ...prev, flags: null }));
                    }}
                  />
                </Col>
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    label="Is Freezone"
                    checked={isFreezone}
                    onChange={e => {
                      setIsFreezone(e.target.checked);
                      if (e.target.checked) setIsHome(false);
                      setErrors(prev => ({ ...prev, flags: null }));
                    }}
                  />
                </Col>
              </Row>

              {errors.flags && (
                <div className="text-danger mt-1" style={{ fontSize: 13 }}>
                  {errors.flags}
                </div>
              )}
            </Col>

            {/* Image */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Image</Form.Label>

                <div
                  className={`mb-2 ${errors.image ? 'border border-danger' : ''}`}
                  style={{
                    borderRadius: 8,
                    padding: 2
                  }}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      style={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 6
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: 120,
                        background: '#f6f7fb',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <small className="text-muted">No image</small>
                    </div>
                  )}
                </div>

                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  isInvalid={!!errors.image}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.image}
                </Form.Control.Feedback>

                <small className="text-muted">
                  Uploading a new image will replace the old one.
                </small>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

/* ===================== CategoryPackageModal ===================== */
const CategoryPackageModal = ({
  show,
  onHide,
  initial = null,
  pageName = '',
  categoryKey = '',
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [pointsStr, setPointsStr] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setTitle(initial?.title || '');
    setDescription(initial?.description || '');
    setAmount(initial?.amount ?? '');
    setPointsStr(
      (initial?.points || [])
        .map(p => (typeof p === 'string' ? p : p.text))
        .join(',')
    );
    setPreview(initial?.image || null);
    setFile(null);
    setSubmitting(false);
    setErrors({});
  }, [initial, show]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);

    if (f) {
      setPreview(URL.createObjectURL(f));
      setErrors(prev => ({ ...prev, image: null }));
    } else {
      setPreview(initial?.iconUrl || null);
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    const points = pointsStr.split(',').map(s => s.trim()).filter(Boolean);

    if (!title) newErrors.title = 'Title is required';
    if (!description) newErrors.description = 'Description is required';

    if (amount === '' || Number.isNaN(Number(amount))) {
      newErrors.amount = 'Enter a valid amount';
    }

    if (!points.length || points.length > 4) {
      newErrors.points = 'Points must be between 1 and 4 items';
    }

    // Image required only on create
    if (!initial && !file) {
      newErrors.image = 'Image is required';
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        id: initial?.id,
        categoryKey,
        pageName,
        title,
        description,
        amount,
        points,
        imageFile: file
      });
      onHide();
    } catch (err) {
      toast.error(err?.message || "Submission failed");

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {initial ? 'Edit Package' : `Create Package for ${pageName}`}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form noValidate>
          <Row className="g-3">
            <Col md={8}>
              {/* Title */}
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
                  value={title}
                  isInvalid={!!errors.title}
                  onChange={e => {
                    setTitle(e.target.value);
                    setErrors(prev => ({ ...prev, title: null }));
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Description */}
              <Form.Group className="mt-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  isInvalid={!!errors.description}
                  onChange={e => {
                    setDescription(e.target.value);
                    setErrors(prev => ({ ...prev, description: null }));
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>

              <Row className="mt-2">
                {/* Amount */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                      value={amount}
                      isInvalid={!!errors.amount}
                      onChange={e => {
                        setAmount(e.target.value);
                        setErrors(prev => ({ ...prev, amount: null }));
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.amount}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                {/* Points */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Points (comma separated)</Form.Label>
                    <Form.Control
                      value={pointsStr}
                      isInvalid={!!errors.points}
                      onChange={e => {
                        setPointsStr(e.target.value);
                        setErrors(prev => ({ ...prev, points: null }));
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.points}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Col>

            {/* Image */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Image</Form.Label>

                <div
                  className={`mb-2 ${errors.image ? 'border border-danger' : ''}`}
                  style={{ borderRadius: 8, padding: 2 }}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      style={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 6
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: 120,
                        background: '#f6f7fb',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <small className="text-muted">No image</small>
                    </div>
                  )}
                </div>

                <Form.Control
                  type="file"
                  accept="image/*"
                  isInvalid={!!errors.image}
                  onChange={handleFile}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.image}
                </Form.Control.Feedback>

                <small className="text-muted">
                  Uploading a new image will replace the old one.
                </small>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

/* ===================== Main Packages Page ===================== */
const Packages = () => {
  /* ---------------- Tabs ---------------- */
  const [topActiveKey, setTopActiveKey] = useState("common");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteCommonPackage, setDeleteCommonPackage] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState([])
  const [isDeleting, setIsDeleting] = useState(false);

  /* ---------------- COMMON (UNCHANGED) ---------------- */
  const [commonPackages, setCommonPackages] = useState([]);
  const [loadingCommon, setLoadingCommon] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [commonModal, setCommonModal] = useState({
    show: false,
    initial: null
  });

  /* ---------------- STATIC FREEZONES ---------------- */
  const pages = STATIC_FREEZONES.freezones;

  const [selectedPage, setSelectedPage] = useState(pages[0]);
  const [selectedUrl, setSeletedUrl] = useState("jafza-freezone-dubai")

  const [selectedItemId, setSelectedItemId] = useState(
    pages[0]?.items?.[0]?.id || null
  );

  /* ---------------- CATEGORY PACKAGES (PER ITEM) ---------------- */
  const [packagesByItem, setPackagesByItem] = useState({});

  /* ---------------- CATEGORY MODAL ---------------- */
  const [categoryModal, setCategoryModal] = useState({
    show: false,
    initial: null,
    categoryKey: null,
    pageName: null
  });

  /* ---------------- DERIVED ---------------- */
  const selectedItem = useMemo(() => {
    return selectedPage?.items?.find(i => i.id === selectedItemId);
  }, [selectedPage, selectedItemId]);

  const currentItemPackages = packagesByItem[selectedItemId] || [];

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    fetchCommon();
  }, []);

  /* ================= COMMON API (UNCHANGED) ================= */
  const fetchCommon = async () => {
    setLoadingCommon(true);
    try {
      const res = await getAllCommonPackages();
      setCommonPackages(unwrap(res) || []);
    } catch (err) {
      console.error(err);
      setCommonPackages([]);
    } finally {
      setLoadingCommon(false);
    }
  };

  const handleOpenCommonCreate = () =>
    setCommonModal({ show: true, initial: null });

  const handleOpenCommonEdit = pkg =>
    setCommonModal({ show: true, initial: pkg });

  const handleCloseCommonModal = () =>
    setCommonModal({ show: false, initial: null });

  const handleSubmitCommon = async data => {
    setFetching(true);
    try {
            let res;

      if (data.id) {
       res= await updateCommonPackage(data.id, data);
      } else {
       res= await createCommonPackage(data);
      }
      await fetchCommon();
      if(res.success){
        toast.success(res.message)
      }
    } finally {
      setFetching(false);
    }
  };

  const handleDeleteCommon = async pkg => {
    setDeleteCommonPackage(true)
    setSelectedPackage(pkg)
    // setFetching(true);
    // try {
    //   await deleteCommonPackage(pkg._id);
    //   await fetchCommon();
    // } finally {
    //   setFetching(false);
    // }
  };
 const confirmDeletePackage = async () => {
  try {
    setIsDeleting(true);

    const res = await deleteCommonpackage(selectedPackage._id);

    if (res.success) {
      setCommonPackages((prev) =>
        prev.filter((pkg) => pkg._id !== selectedPackage._id)
      );

      toast.success(res.message);
      setDeleteCommonPackage(false);
    }
  } catch (error) {
    toast.error(error?.message || "Failed to delete package");
  } finally {
    setIsDeleting(false);
  }
};



  /* ================= STATIC CATEGORY HANDLERS ================= */
  const handleSelectPage = page => {
    setSelectedPage(page);
    setSeletedUrl(page.items[0].url)
    setSelectedItemId(page.items?.[0]?.id || null);
  };

  const handleSelectItem = item => {


    setSeletedUrl(item.url)
    setSelectedItemId(item.id);

  };

  /* ================= CATEGORY MODAL HANDLERS ================= */
  const handleOpenCreateCategoryPkg = () => {
    if (!selectedPage || !selectedItem) {
      alert("Select a page and freezone first");
      return;
    }
    setSeletedUrl(selectedItem.url)

    setCategoryModal({
      show: true,
      initial: null,
      categoryKey: selectedPage.page, // e.g. Dubai Freezones
      pageName: selectedItem.id       // e.g. jafza
    });
  };

  const handleCloseCategoryModal = () => {
    setCategoryModal({
      show: false,
      initial: null,
      categoryKey: null,
      pageName: null
    });
  };

  const handleSubmitCategory = async ({
    id,
    categoryKey,
    pageName,
    title,
    amount,
    points,
    imageFile,
    description
  }) => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("amount", amount);
      formData.append("points", points);
      formData.append("innerPage", selectedUrl);
      formData.append("page", selectedPage.page);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      // 🔁 EDIT
      let res;
      if (id) {
        res = await updateCategoryPackage(id, formData);
      }
      // ➕ CREATE
      else {
        res = await createCategoryPackage(formData);
      }

      if (res?.success) {
        const pkg = res.data;
        toast.success(res.message);

        setPackagesByItem((prev) => ({
          ...prev,
          [pageName]: Array.isArray(prev[pageName])
            ? id
              ? prev[pageName].map((item) =>
                item.id === id
                  ? {
                    ...item,
                    title: pkg.title,
                    description: pkg.description,
                    amount: pkg.price,
                    points: pkg.points,
                    image: pkg.image,
                    page: pkg.page,
                    innerPage: pkg.innerPage,
                  }
                  : item
              )
              : [
                {
                  id: pkg._id,
                  title: pkg.title,
                  description: pkg.description,
                  amount: pkg.price,
                  points: pkg.points,
                  image: pkg.image,
                  page: pkg.page,
                  innerPage: pkg.innerPage,
                },
                ...prev[pageName]
              ]
            : []
        }));

        handleCloseCategoryModal();
      }
    } catch (error) {
      toast.error(error?.message || "Operation failed");
    }
  };


  useEffect(() => {
    const fetchCategoryPackages = async () => {
      try {
        if (!selectedPage?.page || !selectedUrl) return;

        const res = await getCategoryPackages(
          selectedPage.page,
          selectedUrl
        );

        if (res?.success) {
          setPackagesByItem(prev => ({
            ...prev,
            [selectedItemId]: res.data.map(pkg => ({
              id: pkg._id,
              title: pkg.title,
              amount: pkg.price,
              points: pkg.points,
              image: pkg.image,
              description: pkg.description,
              page: pkg.page,
              innerPage: pkg.innerPage,
            }))
          }));
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (topActiveKey === "categories") {
      fetchCategoryPackages();
    }
  }, [topActiveKey, selectedPage, selectedUrl, selectedItemId]);
  const handleOpenCategoryEdit = pkg => {
    setCategoryModal({
      show: true,
      initial: pkg,
      categoryKey: selectedPage.page, // e.g. Dubai Freezones
      pageName: selectedItem.id       // e.g. jafza
    });
  }

  const confirmDelete = async () => {

    try {
      setIsDeleting(true);


      const res = await deleteCategoryPackage(selectedPackage.id);

      if (res.success) {
        toast.success(res.message);
        setDeleteModal(!deleteModal)
        setPackagesByItem((prev) => ({
          ...prev,
          [selectedItemId]: Array.isArray(prev[selectedItemId])
            ? prev[selectedItemId].filter(
              (item) => item.id !== selectedPackage.id
            )
            : []
        }));
      }
    } catch (error) {
      toast.error(error?.message || "Failed to delete package");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <>
      <PageBreadcrumb subName="Pages" title="Packages" />
      <PageMetaData title="Packages" />

      <Tabs
        activeKey={topActiveKey}
        onSelect={k => setTopActiveKey(k)}
        className="mb-4"
      >
        {/* ================= COMMON TAB (UNCHANGED) ================= */}
        <Tab
          eventKey="common"
          title={
            <span>
              <IconifyIcon icon="bx:box" className="me-1" />
              Common Packages
            </span>
          }
        >
          <Row className="align-items-center mb-3">
            <Col>
              <h4>Common Packages</h4>
            </Col>
            <Col className="text-end">
              <Button
                className="me-2"
                variant="outline-secondary"
                onClick={fetchCommon}
              >
                Refresh
              </Button>
              <Button onClick={handleOpenCommonCreate}>
                Add Package
              </Button>
            </Col>
          </Row>

          {loadingCommon ? (
            <Spinner />
          ) : (
            <Row className="g-4">
              {commonPackages.map(pkg => (
                <Col md={3} key={pkg._id}>
                  <CommonPackageCard
                    pkg={pkg}
                    onEdit={handleOpenCommonEdit}
                    onDelete={handleDeleteCommon}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Tab>

        {/* ================= CATEGORIES (STATIC) ================= */}
        <Tab
          eventKey="categories"
          title={
            <span>
              <IconifyIcon icon="bx:category" className="me-1" />
              Categories
            </span>
          }
        >
          <Row>
            {/* LEFT – VERTICAL PAGES */}
            <Col md={3}>
              {pages.map(page => (
                <Button
                  key={page.page}
                  className="w-100 mb-2 text-start"
                  variant={
                    page.page === selectedPage?.page
                      ? "primary"
                      : "outline-secondary"
                  }
                  onClick={() => handleSelectPage(page)}
                >
                  <strong>{page.page}</strong>
                  <Badge bg="light" text="dark" className="float-end">
                    {page.items.length}
                  </Badge>
                </Button>
              ))}
            </Col>

            {/* RIGHT – ITEMS + ADD BUTTON + PACKAGES */}
            <Col md={9}>
              <h4 className="mb-3">{selectedPage?.page}</h4>

              {/* HORIZONTAL ITEMS */}
              <div
                className="mb-3"
                style={{ whiteSpace: "nowrap", overflowX: "auto" }}
              >
                {selectedPage?.items.map(item => {
                  const count = packagesByItem?.[item.id]?.length ?? 0;

                  return (
                    <button
                      key={item.id}
                      className={`btn me-2 ${item.id === selectedItemId
                        ? "btn-primary"
                        : "btn-outline-secondary"
                        }`}
                      onClick={() => handleSelectItem(item)}
                    >
                      {item.title}

                      <Badge bg="light" text="dark" className="float-end ms-2">
                        {count}
                      </Badge>
                    </button>
                  );
                })}


              </div>

              {/* ADD PACKAGE BUTTON */}
              {selectedItem && (
                <div className="text-end mb-3">
                  <Button onClick={handleOpenCreateCategoryPkg}>
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add Package
                  </Button>
                </div>
              )}

              {/* PACKAGES LIST */}
              <Row className="g-3">
  {currentItemPackages.length > 0 ? (
    currentItemPackages.map(pkg => (
      <Col md={4} key={pkg.id}>
        <Card
          className="h-100 border-0 overflow-hidden"
          style={{
            borderRadius: 20,
            boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
            transition: "all 0.35s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.02)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "scale(1)")
          }
        >
          {/* ================= HEADER ================= */}
          <div
            style={{
              height: 110,
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              position: "relative",
            }}
          >
            {/* IMAGE / ICON */}
            <div
              style={{
                position: "absolute",
                bottom: -45,
                left: 24,
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
                overflow: "hidden",
              }}
            >
              {pkg.image ? (
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  loading="lazy"
                  style={{
                    width: 55,
                    height: 55,
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <IconifyIcon
                  icon="bx:image"
                  style={{ fontSize: 36 }}
                  className="text-primary"
                />
              )}
            </div>
          </div>

          {/* ================= BODY ================= */}
          <Card.Body
            className="px-4 d-flex flex-column"
            style={{ paddingTop: 70 }}
          >
            {/* TITLE */}
            <div className="mb-3">
              <h6 className="mb-1 fw-bold text-uppercase">
                {pkg.title}
              </h6>
              <small className="text-muted">
                {pkg.description}
              </small>
            </div>

            {/* PRICE */}
            <div
              style={{
                background: "#f8f9fa",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 16,
              }}
            >
              <div className="text-muted small">Starting from</div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#0d6efd",
                }}
              >
                {currency}
                {pkg.amount}
              </div>
            </div>

            <hr className="my-2" />

            {/* FEATURES */}
            <ul className="list-unstyled mb-4">
              {Array.isArray(pkg.points) && pkg.points.length > 0 ? (
                pkg.points.map((pt, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                      fontSize: 14,
                    }}
                  >
                    <IconifyIcon
                      icon="bx:check"
                      className="me-2 text-success"
                    />
                    {pt}
                  </li>
                ))
              ) : (
                <li className="text-muted small">
                  No features listed
                </li>
              )}
            </ul>

            {/* ACTIONS */}
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                gap: 12,
              }}
            >
              <Button
                variant="primary"
                size="sm"
                className="w-100"
                onClick={() => handleOpenCategoryEdit(pkg)}
              >
                Edit
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                className="w-100"
                onClick={() => {
                  setDeleteModal(true);
                  setSelectedPackage(pkg);
                }}
              >
                Delete
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    ))
  ) : (
    <Col>
      <p className="text-muted mb-0">No packages added yet.</p>
    </Col>
  )}
</Row>


            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* ================= MODALS ================= */}
      <CommonPackageModal
        show={commonModal.show}
        initial={commonModal.initial}
        onHide={handleCloseCommonModal}
        onSubmit={handleSubmitCommon}
        loading={fetching}
      />

      <CategoryPackageModal
        show={categoryModal.show}
        initial={categoryModal.initial}
        categoryKey={categoryModal.categoryKey}
        pageName={categoryModal.pageName}
        onHide={handleCloseCategoryModal}
        onSubmit={handleSubmitCategory}
      />
      {deleteModal && (
        <DeleteConfrimModal
          confirmDelete={confirmDelete}
          isDeleting={isDeleting}
          handleModal={() => setDeleteModal(false)}
        />
      )}
      {deleteCommonPackage && (
        <DeleteConfrimModal
          confirmDelete={confirmDeletePackage}
          isDeleting={isDeleting}
          handleModal={() => setDeleteCommonPackage(false)}
        />
      )}
    </>
  );
};
/* ---------------------- Helper render helpers used above --------------------- */
function currentCategoryPages(categories, selectedCategoryKey) {
  const cat = categories.find(c => c.categoryKey === selectedCategoryKey);
  return (cat && Array.isArray(cat.pages)) ? cat.pages : [];
}
function currentCategoryExists(categories, selectedCategoryKey) {
  return categories.some(c => c.categoryKey === selectedCategoryKey);
}
function currentCategoryTitle(categories, selectedCategoryKey) {
  const cat = categories.find(c => c.categoryKey === selectedCategoryKey);
  return cat?.categoryTitle || 'Select a category';
}
function currentPagePackages(categories, selectedCategoryKey, selectedPageName) {
  const cat = categories.find(c => c.categoryKey === selectedCategoryKey);
  if (!cat) return [];
  const page = (cat.pages || []).find(p => p.pageName === selectedPageName);
  return page?.packages || [];
}

export default Packages;
