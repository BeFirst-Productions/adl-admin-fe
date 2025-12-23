import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Table,
  Badge,
  Modal,
  Form,
  Tabs,
  Tab,
} from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { toast } from "react-toastify";
import {
  createFaq,
  deletefaq,
  editFaq,
  editFaqOrder,
  getFaqs,
} from "@/api/apis";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import PageMetaData from "@/components/PageTitle";

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("home");

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    isActive: true,
    section: "faqpage",
  });

  const [errors, setErrors] = useState({});
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewFaq, setViewFaq] = useState(null);

  const truncate = (text, len = 20) =>
    text?.length > len ? text.substring(0, len) + "..." : text || "";

  const handleViewFaq = (faq) => {
    setViewFaq(faq);
    setShowViewModal(true);
  };

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    setLoading(true);
    try {
      const response = await getFaqs();
      if (response?.success) {
        const sortedFaqs = (response.data || []).sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
        setFaqs(sortedFaqs);
      } else setFaqs([]);
    } catch {
      toast.error("Failed to load FAQs");
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const homeFaqs = faqs.filter((f) => f.section === "home");
  const faqPageFaqs = faqs.filter((f) => !f.section || f.section === "faqpage");
  const freezoneFaqs = faqs.filter((f) => f.section === "freezone");

  const HOME_LIMIT = 6;
  const FAQPAGE_LIMIT = 10;
  const FREEZONE_LIMIT = 5;

  const homeSectionLimitReached = homeFaqs.length >= HOME_LIMIT;
  const faqPageLimitReached = faqPageFaqs.length >= FAQPAGE_LIMIT;
  const freezoneLimitReached = freezoneFaqs.length >= FREEZONE_LIMIT;

  const handleShowModal = (faq) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        isActive: faq.isActive ?? true,
        section: faq.section || "faqpage",
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: "",
        answer: "",
        isActive: true,
        section:
          activeTab === "home"
            ? "home"
            : activeTab === "freezone"
            ? "freezone"
            : "faqpage",
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      isActive: true,
      section: "faqpage",
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSectionChange = async (faq, newSection) => {
    try {
      if (
        (newSection === "home" && homeSectionLimitReached && faq.section !== "home") ||
        (newSection === "faqpage" && faqPageLimitReached && faq.section !== "faqpage") ||
        (newSection === "freezone" && freezoneLimitReached && faq.section !== "freezone")
      ) {
        toast.error("Section limit reached");
        return;
      }

      const res = await editFaq(faq._id, { section: newSection });
      if (res?.success) {
        setFaqs((prev) =>
          prev.map((f) => (f._id === faq._id ? { ...f, section: newSection } : f))
        );
        toast.success("Moved successfully");
      }
    } catch {
      toast.error("Failed to update section");
    }
  };

  const validateForm = () => {
    const e = {};
    if (!formData.question.trim()) e.question = "Question required";
    else if (formData.question.trim().length < 10) e.question = "Min 10 characters";

    if (!formData.answer.trim()) e.answer = "Answer required";
    else if (formData.answer.trim().length < 20) e.answer = "Min 20 characters";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingFaq) {
        const res = await editFaq(editingFaq._id, formData);

        if (res?.success) {
          setFaqs((prev) =>
            prev.map((f) =>
              f._id === editingFaq._id ? { ...f, ...formData } : f
            )
          );
          toast.success("FAQ updated");
        }
      } else {
        const section = formData.section;
        if (
          (section === "home" && homeSectionLimitReached) ||
          (section === "faqpage" && faqPageLimitReached) ||
          (section === "freezone" && freezoneLimitReached)
        ) {
          toast.error("Section limit reached");
          return;
        }

        const sectionFaqs =
          section === "home"
            ? homeFaqs
            : section === "freezone"
            ? freezoneFaqs
            : faqPageFaqs;

        const maxOrder = sectionFaqs.reduce(
          (max, f) => Math.max(max, f.order || 0),
          0
        );

        const payload = {
          ...formData,
          order: maxOrder + 1,
        };

        const res = await createFaq(payload);

        if (res?.success) {
          setFaqs((prev) => [...prev, { ...res.data, ...payload }]);
          toast.success("FAQ added");
        }
      }

      handleCloseModal();
    } catch {
      toast.error("Failed to save FAQ");
    }
  };

  const handleDeleteClick = (faq) => {
    setFaqToDelete(faq);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deletefaq(faqToDelete._id);

      if (res?.success) {
        setFaqs((prev) => prev.filter((f) => f._id !== faqToDelete._id));
        toast.success("FAQ deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
    setShowDeleteModal(false);
  };

  const handleDragEnd = async (result, type) => {
    if (!result.destination) return;

    let list =
      type === "home"
        ? homeFaqs
        : type === "faqpage"
        ? faqPageFaqs
        : freezoneFaqs;

    const reordered = Array.from(list);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updated = [...faqs];

    reordered.forEach((faq, index) => {
      const idx = updated.findIndex((f) => f._id === faq._id);
      updated[idx].order = index + 1;
    });

    try {
      await Promise.all(
        reordered.map((faq) => editFaqOrder(faq._id, { order: faq.order }))
      );

      setFaqs(updated.sort((a, b) => (a.order || 0) - (b.order || 0)));
      toast.success("Order updated");
    } catch {
      toast.error("Failed to update order");
      loadFAQs();
    }
  };

  const isAddDisabled =
    (activeTab === "home" && homeSectionLimitReached) ||
    (activeTab === "faqpage" && faqPageLimitReached) ||
    (activeTab === "freezone" && freezoneLimitReached);

  return (
    <>
      <Row>
              <PageMetaData title="Faqs" />

        <Col xs={12}>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <h4>FAQ Management</h4>

                  <Badge bg="success" className="me-2">
                    Home: {homeFaqs.length}/6
                  </Badge>
                  <Badge bg="info" className="me-2">
                    FAQ Page: {faqPageFaqs.length}/10
                  </Badge>
                  <Badge bg="warning">
                    Freezone: {freezoneFaqs.length}/5
                  </Badge>
                </div>

                <Button
                  variant="success"
                  onClick={() => handleShowModal()}
                  disabled={isAddDisabled}
                >
                  <IconifyIcon icon="bx:plus" className="me-1" />
                  {activeTab === "home"
                    ? "Add Home FAQ"
                    : activeTab === "freezone"
                    ? "Add Freezone FAQ"
                    : "Add FAQ"}
                </Button>
              </div>

              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mt-3"
              >
                {/* HOME TAB */}
                <Tab eventKey="home" title="Home">
                  <DragDropContext onDragEnd={(e) => handleDragEnd(e, "home")}>
                    <Droppable droppableId="homeDroppable">
                      {(provided) => (
                        <Table
                        
                          className="mt-3"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Question</th>
                              <th>Answer</th>
                              <th>Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {homeFaqs.map((faq, index) => (
                              <Draggable
                                key={faq._id}
                                draggableId={faq._id}
                                index={index}
                              >
                                {(prov) => (
                                  <tr
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                  >
                                    <td>{index + 1}</td>
                                    <td>{faq.question}</td>
                                    <td>{truncate(faq.answer)}</td>
                                    <td>
                                      <Button
                                        size="sm"
                                        variant="outline-info"
                                        onClick={() => handleViewFaq(faq)}
                                        className="me-2"
                                      >
                                                      <IconifyIcon icon="mdi:eye-outline" className="fs-20" />

                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={() => handleShowModal(faq)}
                                        className="me-2"
                                      >
                                                      <IconifyIcon icon="bx:edit" className="fs-20" />

                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => handleDeleteClick(faq)}
                                      >
                                                      <IconifyIcon icon="bx:trash" className="fs-20" />

                                      </Button>
                                    </td>
                                  </tr>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </tbody>
                        </Table>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Tab>

                {/* FAQ PAGE TAB */}
                <Tab eventKey="faqpage" title="FAQ Page">
                  <DragDropContext
                    onDragEnd={(e) => handleDragEnd(e, "faqpage")}
                  >
                    <Droppable droppableId="faqpageDroppable">
                      {(provided) => (
                        <Table
                        
                          className="mt-3"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Question</th>
                              <th>Answer</th>
                              <th>Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {faqPageFaqs.map((faq, index) => (
                              <Draggable
                                key={faq._id}
                                draggableId={faq._id}
                                index={index}
                              >
                                {(prov) => (
                                  <tr
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                  >
                                    <td>{index + 1}</td>
                                    <td>{faq.question}</td>
                                    <td>{truncate(faq.answer)}</td>
                                    <td>
                                      <Button
                                        size="sm"
                                        variant="outline-info"
                                        className="me-2"
                                        onClick={() => handleViewFaq(faq)}
                                      >
                                                      <IconifyIcon icon="mdi:eye-outline" className="fs-20" />

                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-primary"
                                        className="me-2"
                                        onClick={() => handleShowModal(faq)}
                                      >
              <IconifyIcon icon="bx:edit" className="fs-20" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => handleDeleteClick(faq)}
                                      >
                                                      <IconifyIcon icon="bx:trash" className="fs-20" />

                                      </Button>
                                    </td>
                                  </tr>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </tbody>
                        </Table>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Tab>

                {/* FREEZONE TAB */}
                <Tab eventKey="freezone" title="Freezone">
                  <DragDropContext
                    onDragEnd={(e) => handleDragEnd(e, "freezone")}
                  >
                    <Droppable droppableId="freezoneDroppable">
                      {(provided) => (
                        <Table
                     
                          className="mt-3"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Question</th>
                              <th>Answer</th>
                              <th>Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {freezoneFaqs.map((faq, index) => (
                              <Draggable
                                key={faq._id}
                                draggableId={faq._id}
                                index={index}
                              >
                                {(prov) => (
                                  <tr
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                  >
                                    <td>{index + 1}</td>
                                    <td>{faq.question}</td>
                                    <td>{truncate(faq.answer)}</td>
                                    <td>
                                      <Button
                                        size="sm"
                                        variant="outline-info"
                                        className="me-2"
                                        onClick={() => handleViewFaq(faq)}
                                      >
                                                      <IconifyIcon icon="mdi:eye-outline" className="fs-20" />

                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-primary"
                                        className="me-2"
                                        onClick={() => handleShowModal(faq)}
                                      >
                                                      <IconifyIcon icon="bx:edit" className="fs-20" />

                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => handleDeleteClick(faq)}
                                      >
              <IconifyIcon icon="bx:trash" className="fs-20" />
                                      </Button>
                                    </td>
                                  </tr>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </tbody>
                        </Table>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* ADD/EDIT MODAL */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingFaq ? "Edit FAQ" : "Add FAQ"}</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Question</Form.Label>
              <Form.Control
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                isInvalid={!!errors.question}
              />
              <Form.Control.Feedback type="invalid">
                {errors.question}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
              <Form.Label>Answer</Form.Label>
              <Form.Control
                as="textarea"
                rows="4"
                name="answer"
                value={formData.answer}
                onChange={handleInputChange}
                isInvalid={!!errors.answer}
              />
              <Form.Control.Feedback type="invalid">
                {errors.answer}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Section</Form.Label>
              <Form.Select
                name="section"
                value={formData.section}
                onChange={handleInputChange}
              >
                <option value="home">Home</option>
                <option value="faqpage">FAQ Page</option>
                <option value="freezone">Freezone</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Check
                type="checkbox"
                label="Active"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingFaq ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* VIEW MODAL */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>FAQ Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {viewFaq && (
            <>
              <h5>Question</h5>
              <p>{viewFaq.question}</p>

              <h5>Answer</h5>
              <p>{viewFaq.answer}</p>

              <h6>Section</h6>
              <p>{viewFaq.section || "faqpage"}</p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* DELETE MODAL */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete FAQ</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FAQManagement;
