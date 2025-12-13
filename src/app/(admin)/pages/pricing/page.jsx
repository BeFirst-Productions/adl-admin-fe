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
  deleteCommonPackage,
  getCategoryPackages,
  createCategoryPackage,
  updateCategoryPackage,
  deleteCategoryPackage
} from '@/api/apis'; 

const currency = 'UAD';

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
    height: 120,
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
            <span className="text-muted" style={{ fontSize: 14, fontWeight: 500 }}></span>
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
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [amount, setAmount] = useState(initial?.amount ?? '');
  const [pointsStr, setPointsStr] = useState((initial?.points || []).map(p => typeof p === 'string' ? p : p.text).join(','));
  const [isHome, setIsHome] = useState(!!initial?.is_home);
  const [isFreezone, setIsFreezone] = useState(!!initial?.is_freezone);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial?.iconUrl || null);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setTitle(initial?.title || '');
    setDescription(initial?.description || '');
    setAmount(initial?.amount ?? '');
    setPointsStr((initial?.points || []).map(p => typeof p === 'string' ? p : p.text).join(','));
    setIsHome(!!initial?.is_home);
    setIsFreezone(!!initial?.is_freezone);
    setPreview(initial?.iconUrl || null);
    setFile(null);
    setSubmitting(false);
  }, [initial, show]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(initial?.iconUrl || null);
    }
  };

  const handleSubmit = async () => {
    const points = pointsStr.split(',').map(s => s.trim()).filter(Boolean);
    if (!title || !description) return alert('Title and description required');
    if (!points.length || points.length > 4) return alert('Points: 1–4 items');
    if (amount === '' || Number.isNaN(Number(amount))) return alert('Valid amount required');
    if (isHome && isFreezone) return alert('Only one of Home or Freezone allowed');

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
      alert(err?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{initial ? 'Edit Common Package' : 'Create Common Package'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="g-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control value={title} onChange={e => setTitle(e.target.value)} />
              </Form.Group>

              <Form.Group className="mt-2">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
              </Form.Group>

              <Row className="mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Amount</Form.Label>
                    <Form.Control value={amount} onChange={e => setAmount(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Points (comma separated, 1-4)</Form.Label>
                    <Form.Control value={pointsStr} onChange={e => setPointsStr(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mt-2">
                <Col md={6}>
                  <Form.Check type="checkbox" label="Is Home" checked={isHome} onChange={e => { setIsHome(e.target.checked); if (e.target.checked) setIsFreezone(false); }} />
                </Col>
                <Col md={6}>
                  <Form.Check type="checkbox" label="Is Freezone" checked={isFreezone} onChange={e => { setIsFreezone(e.target.checked); if (e.target.checked) setIsHome(false); }} />
                </Col>
              </Row>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Image</Form.Label>
                <div className="mb-2">
                  {preview ? (
                    <img src={preview} alt="preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    <div style={{height:120, background:'#f6f7fb', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center'}}><small className="text-muted">No image</small></div>
                  )}
                </div>
                <Form.Control type="file" accept="image/*" onChange={handleFile} />
                <small className="text-muted">Uploading a new image will replace the old one.</small>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

/* ===================== CategoryPackageModal ===================== */
const CategoryPackageModal = ({ show, onHide, initial = null, pageName = '', categoryKey = '', onSubmit }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [pointsStr, setPointsStr] = useState((initial?.points || []).map(p => p.text).join(','));
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setTitle(initial?.title || '');
    setPrice(initial?.price ?? '');
    setPointsStr((initial?.points || []).map(p => p.text).join(','));
    setSubmitting(false);
  }, [initial, show]);

  const handleSubmit = async () => {
    const points = (pointsStr || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!title) return alert('Title required');
    if (points.length < 1 || points.length > 4) return alert('Points must be 1–4');
    setSubmitting(true);
    try {
      await onSubmit({
        id: initial?._id,
        categoryKey,
        pageName,
        title,
        price,
        points
      });
      onHide();
    } catch (err) {
      console.error(err);
      alert('Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{initial ? 'Edit Package' : `Create Package for ${pageName}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control value={title} onChange={e => setTitle(e.target.value)} />
          </Form.Group>

          <Form.Group className="mt-2">
            <Form.Label>Price</Form.Label>
            <Form.Control value={price} onChange={e => setPrice(e.target.value)} />
          </Form.Group>

          <Form.Group className="mt-2">
            <Form.Label>Points (comma separated)</Form.Label>
            <Form.Control value={pointsStr} onChange={e => setPointsStr(e.target.value)} />
            <small className="text-muted">1–4 points.</small>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
      </Modal.Footer>
    </Modal>
  );
};

/* ===================== Main Packages Page ===================== */
const Packages = () => {
  const [commonPackages, setCommonPackages] = useState([]);
  const [categories, setCategories] = useState([]); // array of category docs
  const [loadingCommon, setLoadingCommon] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // which top tab is active
  const [topActiveKey, setTopActiveKey] = useState('common');

  // selected category & page (sub-category)
  const [selectedCategoryKey, setSelectedCategoryKey] = useState(null);
  const [selectedPageName, setSelectedPageName] = useState(null);

  // modals state
  const [commonModal, setCommonModal] = useState({ show: false, initial: null });
  const [categoryModal, setCategoryModal] = useState({ show: false, initial: null, categoryKey: null, pageName: null });

  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchCommon();
    fetchCategories();
  }, []);

  // When categories load, set default selected category and first page
  useEffect(() => {
    if (categories.length && !selectedCategoryKey) {
      setSelectedCategoryKey(categories[0].categoryKey);
      const firstPage = categories[0].pages?.[0];
      setSelectedPageName(firstPage?.pageName || null);
    }
  }, [categories]);

  const fetchCommon = async () => {
    setLoadingCommon(true);
    try {
      const res = await getAllCommonPackages();
      const pkgs = unwrap(res) || [];
      setCommonPackages(pkgs);
    } catch (err) {
      console.error(err);
      setCommonPackages([]);
    } finally {
      setLoadingCommon(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await getCategoryPackages();
      const data = unwrap(res) || [];
      setCategories(Array.isArray(data) ? data : [data].filter(Boolean));
    } catch (err) {
      console.error(err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  /* ------------ Common package handlers (create/edit/delete) ------------ */
  const handleOpenCommonCreate = () => setCommonModal({ show: true, initial: null });
  const handleOpenCommonEdit = (pkg) => setCommonModal({ show: true, initial: pkg });
  const handleCloseCommonModal = () => setCommonModal({ show: false, initial: null });

  const handleSubmitCommon = async ({ id, title, description, amount, points, is_home, is_freezone, imageFile }) => {
    setFetching(true);
    try {
      if (id) {
        await updateCommonPackage(id, { title, description, amount, points, is_home, is_freezone, imageFile });
      } else {
        await createCommonPackage({ title, description, amount, points, is_home, is_freezone, imageFile });
      }
      await fetchCommon();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setFetching(false);
    }
  };

  const handleDeleteCommon = async (pkg) => {
    if (!window.confirm(`Delete "${pkg.title}"?`)) return;
    setFetching(true);
    try {
      await deleteCommonPackage(pkg._id);
      await fetchCommon();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    } finally {
      setFetching(false);
    }
  };

  /* ------------ Category handlers ------------ */
  const handleSelectCategory = (categoryKey) => {
    setSelectedCategoryKey(categoryKey);
    const cat = categories.find(c => c.categoryKey === categoryKey);
    const page = cat?.pages?.[0];
    setSelectedPageName(page?.pageName || null);
  };

  const handleSelectPage = (pageName) => setSelectedPageName(pageName);

  const currentCategory = useMemo(() => categories.find(c => c.categoryKey === selectedCategoryKey), [categories, selectedCategoryKey]);
  const currentPage = useMemo(() => currentCategory?.pages?.find(p => p.pageName === selectedPageName), [currentCategory, selectedPageName]);

  /* Create package in currently selected page */
  const handleOpenCreateCategoryPkg = () => {
    if (!currentCategory || !selectedPageName) return alert('Select a Category and Page first');
    setCategoryModal({ show: true, initial: null, categoryKey: currentCategory.categoryKey, pageName: selectedPageName });
  };

  const handleOpenEditCategoryPkg = ({ categoryKey, pageName, pkg }) => {
    setCategoryModal({ show: true, initial: pkg, categoryKey, pageName });
  };

  const handleCloseCategoryModal = () => setCategoryModal({ show: false, initial: null, categoryKey: null, pageName: null });

  const handleSubmitCategory = async ({ id, categoryKey, pageName, title, price, points }) => {
    setFetching(true);
    try {
      if (id) {
        await updateCategoryPackage({ categoryKey, pageName, packageId: id, title, price, points });
      } else {
        await createCategoryPackage({ categoryKey, pageName, title, price, points });
      }
      await fetchCategories();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setFetching(false);
    }
  };

  const handleDeleteCategoryPkg = async ({ categoryKey, pageName, pkg }) => {
    if (!window.confirm(`Delete "${pkg.title}"?`)) return;
    setFetching(true);
    try {
      await deleteCategoryPackage({ categoryKey, pageName, packageId: pkg._id });
      await fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    } finally {
      setFetching(false);
    }
  };

  /* ------------------ Render ------------------ */
  return (
    <>
      <PageBreadcrumb subName="Pages" title="Packages" />
      <PageMetaData title="Packages" />

      {/* <Row className="align-items-center mb-3">
        <Col>
        <h4 className="mb-0">Packages</h4>
        </Col>
        <Col className="text-end">
      
          <Button variant="outline-secondary" className="me-2" onClick={() => { fetchCommon(); fetchCategories(); }}>
            <IconifyIcon icon="bx:refresh" /> Refresh All
          </Button>
        </Col>
      </Row> */}

      <Tabs activeKey={topActiveKey} onSelect={(k) => setTopActiveKey(k)} className="mb-4">
        <Tab
          eventKey="common"
          title={<span><IconifyIcon icon="bx:box" className="me-1" /> Common Packages</span>}
        >
          {/* TAB HEADER for common tab */}
          <Row className="align-items-center mb-3">
            <Col>
              <h4 className="mb-0">Common Packages</h4>
              <p className="text-muted">Manage Home and Freezone packages</p>
            </Col>
            <Col className="text-end">
              <Button variant="outline-secondary" className="me-2" onClick={() => { fetchCommon(); }}>
                <IconifyIcon icon="bx:refresh" /> Refresh
              </Button>
              <Button variant="primary" onClick={handleOpenCommonCreate}>
                <IconifyIcon icon="bx:plus" className="me-1" /> Add package
              </Button>
            </Col>
          </Row>

          {loadingCommon ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
            <Row className="g-4">
              {commonPackages.length ? commonPackages.map(pkg => (
                <Col key={pkg._id} xs={12} sm={6} md={6} lg={4} xl={3}>
                  <CommonPackageCard pkg={pkg} onEdit={handleOpenCommonEdit} onDelete={handleDeleteCommon} />
                </Col>
              )) : (
                <Col xs={12}><p className="text-muted text-center">No common packages found</p></Col>
              )}
            </Row>
          )}
        </Tab>

        <Tab
          eventKey="categories"
          title={<span><IconifyIcon icon="bx:category" className="me-1" /> Categories</span>}
        >
          {/* TAB HEADER for categories tab */}
          <Row className="align-items-center mb-3">
            <Col>
              <h4 className="mb-0">Categories</h4>
              <p className="text-muted">Manage nested Freezone category Packages</p>
            </Col>
            <Col className="text-end">
              <Button variant="outline-secondary" className="me-2" onClick={() => fetchCategories()}>
                <IconifyIcon icon="bx:refresh" /> Refresh
              </Button>
              <Button variant="primary" onClick={handleOpenCreateCategoryPkg}>
                <IconifyIcon icon="bx:plus" className="me-1" /> Add package
              </Button>
            </Col>
          </Row>

          {loadingCategories ? <div className="text-center py-5"><Spinner animation="border" /></div> : categories.length === 0 ? (
            <p className="text-muted">No categories configured.</p>
          ) : (
            <Row>
              {/* left: categories list */}
              <Col xs={12} md={4} lg={3} className="mb-3">
                <div className="mb-3">
                  {/* <h4 className="mb-2">Categories</h4> */}
                  {categories.map(cat => (
                    <Button
                      key={cat.categoryKey}
                      variant={cat.categoryKey === selectedCategoryKey ? 'primary' : 'outline-secondary'}
                      className="w-100 mb-2 text-start"
                      onClick={() => handleSelectCategory(cat.categoryKey)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="my-2">
                          <strong>{cat.categoryTitle}</strong>
                          {/* <div className="text-muted small">{cat.categoryKey}</div> */}
                        </div>
                        <div><Badge bg="light" text="dark">{cat.pages?.length ?? 0}</Badge></div>
                      </div>
                    </Button>
                  ))}
                </div>
              </Col>

              {/* right: pages (tabs) + packages */}
              <Col xs={12} md={8} lg={9}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h4 className="mb-0">{currentCategoryTitle(categories, selectedCategoryKey)}</h4>
                    {/* <small className="text-muted">{selectedCategoryKey}</small> */}
                  </div>
                </div>

                {currentCategoryExists(categories, selectedCategoryKey) ? (
                  <>
                    <div className="mb-3">
                      <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        {currentCategoryPages(categories, selectedCategoryKey).map((page) => (
                          <button
                            key={page.pageName}
                            onClick={() => handleSelectPage(page.pageName)}
                            className={`btn me-2 ${page.pageName === selectedPageName ? 'btn-primary' : 'btn-outline-secondary'}`}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {page.pageName}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* packages grid for selected page */}
                    <div>
                      <Row className="g-4 ">
                        {currentPagePackages(categories, selectedCategoryKey, selectedPageName).length ? (
                          currentPagePackages(categories, selectedCategoryKey, selectedPageName).map(pkg => (
                            <Col key={pkg._id} xs={12} sm={6} md={6} lg={4}>
                              <CategoryPackageCard
                                pkg={pkg}
                                onEdit={() => handleOpenEditCategoryPkg({ categoryKey: selectedCategoryKey, pageName: selectedPageName, pkg })}
                                onDelete={() => handleDeleteCategoryPkg({ categoryKey: selectedCategoryKey, pageName: selectedPageName, pkg })}
                              />
                            </Col>
                          ))
                        ) : (
                          <Col xs={12}><p className="text-muted">No packages for this page.</p></Col>
                        )}
                      </Row>
                    </div>
                  </>
                ) : (
                  <p className="text-muted">Select a category to see its pages</p>
                )}
              </Col>
            </Row>
          )}
        </Tab>
      </Tabs>

      {/* Modals */}
      <CommonPackageModal
        show={commonModal.show}
        initial={commonModal.initial}
        onHide={handleCloseCommonModal}
        onSubmit={handleSubmitCommon}
      />

      <CategoryPackageModal
        show={categoryModal.show}
        initial={categoryModal.initial}
        categoryKey={categoryModal.categoryKey}
        pageName={categoryModal.pageName}
        onHide={handleCloseCategoryModal}
        onSubmit={handleSubmitCategory}
      />
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
