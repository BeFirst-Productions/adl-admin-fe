import { Button, Card, CardBody, CardHeader, CardTitle, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import { colorVariants } from '@/context/constants';
import cardImg from '@/assets/images/small/img-1.jpg';
import cardImg2 from '@/assets/images/small/img-2.jpg';
import cardImg3 from '@/assets/images/small/img-3.jpg';
import cardImg4 from '@/assets/images/small/img-4.jpg';
import cardImg5 from '@/assets/images/small/img-5.jpg';
import { useEffect, useState } from 'react';
import ImageUpload from '../../gallery/Product';
import { deleteGalleryImage, getGallery } from '@/api/apis';
import { Icon } from '@iconify/react';
import useToggle from '@/hooks/useToggle';
import ComponentContainerCard from '@/components/ComponentContainerCard';
import { toast } from 'react-toastify';
const CardWithImage = () => {
  return <Card className="mb-3 mb-xl-0">
    <img className="card-img-top img-fluid" src={cardImg} alt="img-1" />
    <CardBody>
      <CardTitle as={'h5'} className="mb-2">
        Card title
      </CardTitle>
      <p className="card-text text-muted">
        Some quick example text to build on the card title and make up the bulk of the card&apos;s content. With supporting text below as a natural
        lead-in to additional content.
      </p>
      <Link to="" className="btn btn-primary">
        Button
      </Link>
    </CardBody>
  </Card>;
};
const CardWithImage2 = () => {
  return <Card className="mb-3">
    <img className="card-img-top img-fluid" src={cardImg2} alt="img-2" />
    <CardBody>
      <CardTitle as={'h5'} className="mb-2">
        Card title
      </CardTitle>
      <p className="card-text text-muted">Some quick example text to build on the card title.</p>
    </CardBody>
    <ul className="list-group list-group-flush text-muted">
      <li className="list-group-item text-muted">Dapibus ac facilisis in</li>
    </ul>
    <CardBody>
      <Link to="" className="card-link text-primary">
        Card link
      </Link>
      <Link to="" className="card-link text-primary">
        Another link
      </Link>
    </CardBody>
  </Card>;
};
const CardWithImage3 = () => {
  return <Card className="mb-3 mb-xl-0">
    <img className="card-img-top img-fluid" src={cardImg4} alt="img-4" />
    <CardBody>
      <p className="card-text text-muted">
        Some quick example text to build on the card title and make up the bulk of the card&apos;s content. With supporting text below as a natural
        lead-in to additional content.
      </p>
      <Link to="" className="btn btn-primary">
        Button
      </Link>
    </CardBody>
  </Card>;
};
const CardWithTitleAndImage = () => {
  return <Card className="mb-3 mb-xl-0">
    <CardBody>
      <h5 className="card-title mb-0">Card title</h5>
    </CardBody>
    <img className="img-fluid" src={cardImg5} alt="img-5" />
    <CardBody>
      <p className="card-text text-muted">Some quick example text to build on the card title.</p>
      <Link to="" className="card-link text-primary">
        Card link
      </Link>
      <Link to="" className="card-link text-primary">
        Another link
      </Link>
    </CardBody>
  </Card>;
};
const CardWithSpecialTitle = () => {
  return <Card className="card-body">
    <CardTitle as={'h5'} className="mb-1">
      Special title treatment
    </CardTitle>
    <p className="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    <Link to="" className="btn btn-primary">
      Go somewhere
    </Link>
  </Card>;
};
const CardWithHeader = () => {
  return <Card>
    <CardHeader>Featured</CardHeader>
    <CardBody>
      <CardTitle as={'h5'} className="mb-1">
        Special title treatment
      </CardTitle>
      <p className="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      <Link to="" className="btn btn-primary">
        Go somewhere
      </Link>
    </CardBody>
  </Card>;
};
const CardWithHeaderAndQuote = () => {
  return <Card>
    <CardHeader>Quote</CardHeader>
    <CardBody>
      <blockquote>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>
        <footer>
          Someone famous in
          <cite>Source Title</cite>
        </footer>
      </blockquote>
    </CardBody>
  </Card>;
};
const CardWithHeaderAndFooter = () => {
  return <Card>
    <CardHeader>Featured</CardHeader>
    <CardBody>
      <Link to="" className="btn btn-primary">
        Go somewhere
      </Link>
    </CardBody>
    <div className="card-footer text-muted">2 days ago</div>
  </Card>;
};
const ColorCards = () => {
  return <Row>
    <Col md={4}>
      <div className="card text-bg-primary">
        <CardBody>
          <h5 className="card-title text-white mb-2">Special title treatment</h5>
          <p className="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <Link to="" className="btn btn-light btn-sm">
            Button
          </Link>
        </CardBody>
      </div>
    </Col>
    {colorVariants.slice(1, 6).map((color, idx) => <Col md={4} key={idx}>
      <div className={`card bg-${color} text-white`}>
        <CardBody>
          <blockquote>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>
            <footer>
              Someone famous in&nbsp;
              <cite title="Source Title">Source Title</cite>
            </footer>
          </blockquote>
        </CardBody>
      </div>
    </Col>)}
  </Row>;
};
const BorderedCards = () => {
  return <Row>
    {colorVariants.slice(0, 3).map((color, idx) => <Col md={4} key={idx}>
      <Card className={`border-${color} border`}>
        <CardBody>
          <h5 className={`card-title text-${color} mb-2`}>Special title treatment</h5>
          <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
          <Link to="#" className={`btn btn-${color} btn-sm`}>
            Button
          </Link>
        </CardBody>
      </Card>
    </Col>)}
  </Row>;
};
const HorizontalCards = () => {
  return <Row>
    <Col lg={6}>
      <Card>
        <Row className="g-0">
          <Col md={4}>
            <img src={cardImg} className="img-fluid rounded-start h-100" alt="img-1" />
          </Col>
          <Col md={8}>
            <CardBody>
              <CardTitle as={'h5'} className="mb-2">
                Card title
              </CardTitle>
              <p className="card-text">
                This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.
              </p>
              <p className="card-text">
                <small className="text-muted">Last updated 3 mins ago</small>
              </p>
            </CardBody>
          </Col>
        </Row>
      </Card>
    </Col>
    <Col lg={6}>
      <Card>
        <Row className="g-0">
          <Col md={8}>
            <CardBody>
              <CardTitle as={'h5'} className="mb-2">
                Card title
              </CardTitle>
              <p className="card-text">
                This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.
              </p>
              <p className="card-text">
                <small className="text-muted">Last updated 3 mins ago</small>
              </p>
            </CardBody>
          </Col>
          <Col md={4}>
            <img src={cardImg2} className="img-fluid rounded-end h-100" alt="img-2" />
          </Col>
        </Row>
      </Card>
    </Col>
  </Row>;
};
const CardWithStretchedLink = () => {
  return <>
    <Col md={6} lg={3}>
      <Card>
        <img src={cardImg} height={205} className="card-img-top" alt="img-1" />
        <CardBody>
          <CardTitle as={'h5'} className="mb-2">
            Card with stretched link
          </CardTitle>
          <Link to="" className="btn btn-primary mt-2 stretched-link">
            Go somewhere
          </Link>
        </CardBody>
      </Card>
    </Col>
    <Col md={6} lg={3}>
      <Card>
        <img src={cardImg2} height={205} className="card-img-top" alt="img-2" />
        <CardBody>
          <CardTitle as={'h5'} className="mb-2">
            <Link to="" className="text-primary stretched-link">
              Card with stretched link
            </Link>
          </CardTitle>
          <p className="card-text">Some quick example text to build on the card up the bulk of the card&apos;s content.</p>
        </CardBody>
      </Card>
    </Col>
    <Col md={6} lg={3}>
      <Card>
        <img src={cardImg3} height={205} className="card-img-top" alt="img-3" />
        <CardBody>
          <CardTitle as={'h5'} className="mb-2">
            Card with stretched link
          </CardTitle>
          <Link to="" className="btn btn-primary mt-2 stretched-link">
            Go somewhere
          </Link>
        </CardBody>
      </Card>
    </Col>
    <Col md={6} lg={3}>
      <Card>
        <img src={cardImg4} height={205} className="card-img-top" alt="img-4" />
        <CardBody>
          <CardTitle as={'h5'} className="mb-2">
            <Link to="" className="stretched-link">
              Card with stretched link
            </Link>
          </CardTitle>
          <p className="card-text">Some quick example text to build on the card up the bulk of the card&apos;s content.</p>
        </CardBody>
      </Card>
    </Col>
  </>;
};
const CardDecks = () => {
  return <Row className="row-cols-1 row-cols-md-3 g-3">
    {[cardImg4, cardImg3, cardImg2].map((image, idx) => <div className="col" key={idx}>
      <Card>
        <img src={image} className="card-img-top" height={278} alt="img-4" />
        <CardBody>
          <CardTitle as={'h5'} className="mb-2">
            Card title
          </CardTitle>
          <p className="card-text">
            This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.
          </p>
          <p className="card-text">
            <small className="text-muted">Last updated 3 mins ago</small>
          </p>
        </CardBody>
      </Card>
    </div>)}
  </Row>; ``
};


const ConfirmDeleteModal = ({ show, onClose, onConfirm, deleteImage }) => {
  return (
    <Modal show={show} onHide={onClose} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Confirmation</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-0">Are you sure you want to delete this item?</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>

        {!deleteImage ? <Button
          variant="danger"
          onClick={onConfirm}
        >
          Yes, Delete
        </Button> : <Button variant="danger" disabled className="me-1">
          <Spinner color="white" className="spinner-border-sm me-1" />
          Deleting...
        </Button>}
      </Modal.Footer>
    </Modal>
  );
};

const CardWithGroup = ({ item, onDelete }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleting, setDeleting] = useState(false)
  const openConfirm = () => setShowConfirmModal(true);
  const closeConfirm = () => setShowConfirmModal(false);

  const handleConfirmDelete = async () => {
    setDeleting(true)
    await onDelete(item._id);
    setShowConfirmModal(false);
    setDeleting(false)
  };

  return (
    <>
      <Card className="d-block position-relative image-card">

        {/* 🔥 DELETE BUTTON */}
        <button className="delete-btn" onClick={openConfirm}>
          <Icon icon="mdi:trash-can-outline" width="20" height="20" />
        </button>

        {/* 🖼 IMAGE BOX */}
        <div className="image-wrapper" onClick={() => setShowImageModal(true)}>
          <img
            src={item.image}
            alt="gallery"
            className="gallery-img"
          />
        </div>

        {/* CSS */}
        <style jsx>{`
          /* FIXED CARD SIZE */
          .image-card {
            width: 260px;
            height: 260px;
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 20px;
            position: relative;
          }

          .image-wrapper {
            width: 100%;
            height: 100%;
            cursor: pointer;
          }

          .gallery-img {
            width: 100%;
            height: 100%;
            object-fit: cover;   /* Ensures uniform crop */
            border-radius: 12px;
          }

          /* DELETE BUTTON */
          .delete-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(6px);
            border: none;
            color: #ff3b3b;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: all 0.25s ease;
            z-index: 10;
          }

          .delete-btn:hover {
            background: #ff3b3b;
            color: white;
            transform: scale(1.12);
            box-shadow: 0 6px 18px rgba(255, 59, 59, 0.4);
          }
        `}</style>
      </Card>

      {/* ENLARGE IMAGE MODAL */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered size="lg">
        <Modal.Body className="text-center p-0">
          <img
            src={item.image}
            alt="enlarged"
            className="img-fluid"
            style={{
              width: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
              borderRadius: "10px"
            }}
          />
        </Modal.Body>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        show={showConfirmModal}
        onClose={closeConfirm}
        onConfirm={handleConfirmDelete}
        deleteImage={deleting}
      />
    </>
  );
};

const Cards = () => {
  const [galleryData, setGalleryData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchGallery = async (currentPage = 1) => {
    const res = await getGallery(currentPage, 88);
    if (res.success) {
      setGalleryData(res.data);
      setTotalPages(res.totalPages);
    }
  };

  useEffect(() => {
    fetchGallery(page);
  }, [page]);

  const handleDelete = async (id) => {
    try {
      const res = await deleteGalleryImage(id);
      if (res.success) {
        toast.success(res.message);
        fetchGallery(page);
      }
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const [addImage, setAddImage] = useState(false);
  const handleImage = () => {
    setAddImage(!addImage);
    fetchGallery(page);
  };

  return (
    <>
      <PageMetaData title="Gallery" />

      <Row className="align-items-center mb-3">
        <Col xs={6}>
          <CardTitle as={'h5'}>Gallery</CardTitle>
        </Col>

        <Col xs={6} className="text-end">
          <Button
            variant={addImage ? "danger" : "primary"}
            onClick={() => setAddImage(!addImage)}
          >
            {!addImage ? 'Add Image' : 'Cancel'}
          </Button>
        </Col>
      </Row>

      {!addImage && (
        <>
          <Row>
            <Col xs={12}>
              {galleryData.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted mb-0">No images found</h5>
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-3">
                  {galleryData.map((item) => (
                    <CardWithGroup
                      key={item._id}
                      item={item}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </Col>
          </Row>


          {/* Pagination */}
          {galleryData.length > 0 && <Row className="mt-4">
            <Col className="d-flex justify-content-center gap-2">
              <Button
                variant="outline-primary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </Button>

              {[...Array(totalPages).keys()].map((num) => (
                <Button
                  key={num}
                  variant={page === num + 1 ? "primary" : "outline-primary"}
                  onClick={() => setPage(num + 1)}
                >
                  {num + 1}
                </Button>
              ))}

              <Button
                variant="outline-primary"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </Col>
          </Row>}
        </>
      )}

      {addImage && <ImageUpload handleImage={handleImage} />}
    </>
  );
};

export default Cards;