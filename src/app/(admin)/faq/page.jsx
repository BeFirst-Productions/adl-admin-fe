// components/FAQManagement.tsx
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
  FormCheck,
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
  editHomeFaq,
  getFaqs,
} from "@/api/apis";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("all");

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  // NEW — View modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewFaq, setViewFaq] = useState(null);

  const truncate = (text, len = 20) =>
    text?.length > len ? text.substring(0, len) + "..." : text;

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
      if (response.success) {
        const sortedFaqs = response.data.sort((a, b) => a.order - b.order);
        setFaqs(sortedFaqs);
      }
    } catch (error) {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  const homeFaqs = faqs.filter((f) => f.home);
  const nonHomeFaqs = faqs.filter((f) => !f.home);

  const homeSectionLimitReached = homeFaqs.length >= 6;
  const faqPageLimitReached = nonHomeFaqs.length >= 10;

  const handleShowModal = (faq) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        isActive: faq.isActive,
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: "",
        answer: "",
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      isActive: true,
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleHomeSectionToggle = async (faq) => {
    if (!faq.home && homeSectionLimitReached) {
      toast.error("Home section limit reached (max 6)");
      return;
    }
    if (faq.home && faqPageLimitReached) {
      toast.error("FAQ Page limit reached (max 10)");
      return;
    }

    try {
      const updatedFaq = { ...faq, home: !faq.home };
      let response = await editHomeFaq(faq._id, {
        home: !faq.home,
      });

      if (response.success) {
        setFaqs((prev) =>
          prev.map((f) => (f._id === faq._id ? updatedFaq : f))
        );
        toast.success(
          updatedFaq.home ? "Added to Homepage" : "Moved to FAQ Page"
        );
      }
    } catch {
      toast.error("Failed to update FAQ");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.question.trim())
      newErrors.question = "Question required";
    else if (formData.question.trim().length < 10)
      newErrors.question = "Min 10 characters";

    if (!formData.answer.trim())
      newErrors.answer = "Answer required";
    else if (formData.answer.trim().length < 20)
      newErrors.answer = "Min 20 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingFaq) {
        const res = await editFaq(editingFaq._id, formData);
        if (res.success) {
          setFaqs((prev) =>
            prev.map((f) =>
              f._id === editingFaq._id ? { ...editingFaq, ...formData } : f
            )
          );
          toast.success("FAQ updated");
        }
      } else {
        const targetSection = activeTab === "home" ? "home" : "faqpage";

        if (targetSection === "home" && homeSectionLimitReached) {
          toast.error("Cannot add more: Home limit reached");
          return;
        }
        if (targetSection === "faqpage" && faqPageLimitReached) {
          toast.error("Cannot add more: FAQ Page limit reached");
          return;
        }

        const maxOrder = faqs.reduce(
          (max, f) => Math.max(max, f.order || 0),
          0
        );

        const payload = {
          ...formData,
          order: maxOrder + 1,
          home: targetSection === "home",
        };

        const res = await createFaq(payload);

        if (res.success) {
          const newFaq = {
            ...res.data,
            order: maxOrder + 1,
            home: targetSection === "home",
          };
          setFaqs((prev) => [...prev, newFaq]);
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
      if (res.success) {
        setFaqs((prev) => prev.filter((f) => f._id !== faqToDelete._id));
        toast.success("FAQ deleted");
      }
    } catch {
      toast.error("Failed to delete FAQ");
    }
    setShowDeleteModal(false);
  };

  const handleDragEnd = async (result, type) => {
    if (!result.destination) return;

    const list = type === "home" ? homeFaqs : nonHomeFaqs;

    const reordered = Array.from(list);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updatedFaqs = [...faqs];
    reordered.forEach((faq, index) => {
      const realIndex = updatedFaqs.findIndex((f) => f._id === faq._id);
      if (realIndex !== -1) {
        updatedFaqs[realIndex] = {
          ...updatedFaqs[realIndex],
          order: index + 1,
        };
      }
    });

    try {
      const sectionIds = new Set(reordered.map((f) => f._id));
      const sectionFaqs = updatedFaqs.filter((f) =>
        sectionIds.has(f._id)
      );

      await Promise.all(
        sectionFaqs.map((faq) =>
          editFaqOrder(faq._id, { order: faq.order })
        )
      );

      setFaqs(updatedFaqs.sort((a, b) => a.order - b.order));
      toast.success("Order updated!");
    } catch {
      toast.error("Failed to update order");
      loadFAQs();
    }
  };

  const isAddDisabled =
    (activeTab === "home" && homeSectionLimitReached) ||
    ((activeTab === "faqpage" || activeTab === "all") &&
      faqPageLimitReached);

  const addButtonLabel =
    activeTab === "home"
      ? "Add Home FAQ"
      : activeTab === "faqpage"
      ? "Add FAQ Page FAQ"
      : "Add FAQ";

  return (
    <>
      <Row>
        <Col xs={12}>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h4>FAQ Management</h4>

                  <div className="mt-1">
                    <Badge
                      bg={
                        homeSectionLimitReached ? "primary" : "success"
                      }
                    >
                      Home: {homeFaqs.length}/6
                    </Badge>

                    <Badge
                      bg={faqPageLimitReached ? "primary" : "info"}
                      className="ms-2"
                    >
                      FAQ Page: {nonHomeFaqs.length}/10
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="success"
                  onClick={() => handleShowModal()}
                  disabled={isAddDisabled}
                >
                  <IconifyIcon icon="bx:plus" className="me-1" />
                  {addButtonLabel}
                </Button>
              </div>

              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || "all")}
                className="mt-3"
              >
                {/* ALL FAQs */}
                <Tab eventKey="all" title="All FAQs">
                  <Table responsive striped className="mt-3">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Question</th>
                        <th>Answer</th>
                        <th>Home</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center">
                            Loading...
                          </td>
                        </tr>
                      ) : faqs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-muted">
                            No FAQs found
                          </td>
                        </tr>
                      ) : (
                        faqs.map((faq, i) => (
                          <tr key={faq._id}>
                            <td>{i + 1}</td>
                            <td>{faq.question}</td>
                            <td>{truncate(faq.answer)}</td>
                            <td>
                              <FormCheck
                                type="switch"
                                checked={faq.home}
                                onChange={() =>
                                  handleHomeSectionToggle(faq)
                                }
                                disabled={
                                  (!faq.home && homeSectionLimitReached) ||
                                  (faq.home && faqPageLimitReached)
                                }
                              />
                            </td>
                            <td>
                              <Button
                                size="sm"
                                variant="outline-info"
                                className="me-2"
                                onClick={() => handleViewFaq(faq)}
                              >
                                View
                              </Button>

                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleShowModal(faq)}
                              >
                                Edit
                              </Button>

                              <Button
                                size="sm"
                                variant="outline-danger"
                                className="ms-2"
                                onClick={() => handleDeleteClick(faq)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </Tab>

                {/* HOMEPAGE TAB */}
                <Tab eventKey="home" title="Homepage">
                  <DragDropContext
                    onDragEnd={(res) => handleDragEnd(res, "home")}
                  >
                    <Droppable droppableId="homeFaqs">
                      {(provided) => (
                        <Table
                          responsive
                          striped
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
                            {homeFaqs.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="text-center text-muted"
                                >
                                  No Home FAQs
                                </td>
                              </tr>
                            ) : (
                              homeFaqs.map((faq, index) => (
                                <Draggable
                                  key={faq._id}
                                  draggableId={faq._id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <tr
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        cursor: "grab",
                                        ...provided.draggableProps.style,
                                      }}
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
                                          View
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant="outline-primary"
                                          onClick={() =>
                                            handleShowModal(faq)
                                          }
                                        >
                                          Edit
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant="outline-danger"
                                          className="ms-2"
                                          onClick={() =>
                                            handleDeleteClick(faq)
                                          }
                                        >
                                          Delete
                                        </Button>
                                      </td>
                                    </tr>
                                  )}
                                </Draggable>
                              ))
                            )}
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
                    onDragEnd={(res) => handleDragEnd(res, "faqpage")}
                  >
                    <Droppable droppableId="pageFaqs">
                      {(provided) => (
                        <Table
                          responsive
                          striped
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
                            {nonHomeFaqs.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="text-center text-muted"
                                >
                                  No FAQ Page FAQs
                                </td>
                              </tr>
                            ) : (
                              nonHomeFaqs.map((faq, index) => (
                                <Draggable
                                  key={faq._id}
                                  draggableId={faq._id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <tr
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        cursor: "grab",
                                        ...provided.draggableProps.style,
                                      }}
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
                                          View
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant="outline-primary"
                                          onClick={() =>
                                            handleShowModal(faq)
                                          }
                                        >
                                          Edit
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant="outline-danger"
                                          className="ms-2"
                                          onClick={() =>
                                            handleDeleteClick(faq)
                                          }
                                        >
                                          Delete
                                        </Button>
                                      </td>
                                    </tr>
                                  )}
                                </Draggable>
                              ))
                            )}
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
                placeholder="Enter question (min 10 characters)"
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
                rows={4}
                name="answer"
                value={formData.answer}
                placeholder="Enter answer (min 20 characters)"
                onChange={handleInputChange}
                isInvalid={!!errors.answer}
              />
              <Form.Control.Feedback type="invalid">
                {errors.answer}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingFaq ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>FAQ Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewFaq && (
            <>
              <h5>Question</h5>
              <p>{viewFaq.question}</p>

              <h5 className="mt-3">Answer</h5>
              <p>{viewFaq.answer}</p>
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
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete FAQ</Modal.Title>
        </Modal.Header>

        <Modal.Body>Are you sure you want to delete this FAQ?</Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
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
