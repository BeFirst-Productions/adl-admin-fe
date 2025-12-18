import { useState, useEffect } from "react";
import { Card, CardBody, Form, Button, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { getHeroSection, updateHeroSection } from "@/api/apis";

const HeroSectionManagement = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHeroSectionData();
  }, []);

  const loadHeroSectionData = async () => {
    try {
      const res = await getHeroSection();
      if (res?.success && res.data) {
        setFormData(res.data);
      }
    } catch (error) {
      toast.error("Failed to load hero section data");
    }
  };

  // -------------------------
  // Helpers
  // -------------------------
  const getCharCount = (text) => (text || "").length;

  // -------------------------
  // Field validation
  // -------------------------
  const validateField = (name, value) => {
    const safeValue = String(value ?? "").trim();
    let error = "";

    if (!safeValue) {
      error = "This field is required";
    }

    if (name === "title") {
      if (safeValue.length < 5)
        error = "Title must be at least 5 characters";
      if (safeValue.length > 60)
        error = "Title cannot exceed 60 characters";
    }

    if (name === "description") {
      if (safeValue.length < 30)
        error = "Description must be at least 30 characters";
      if (safeValue.length > 140)
        error = "Description cannot exceed 140 characters";
    }

    if (name === "buttonText") {
      if (safeValue.length < 2 || safeValue.length > 20)
        error = "Button text must be between 2 and 20 characters";
    }

    if (name === "buttonUrl") {
  if (
    safeValue &&
    !/^(#|\/|https?:\/\/)/.test(safeValue)
  ) {
    error = "Enter a valid URL (relative, absolute, or #)";
  }
}


    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return !error;
  };

  // -------------------------
  // On change handler
  // -------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    validateField(name, value);
  };

  // -------------------------
  // Full form validation
  // -------------------------
  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      const value = String(formData[key] ?? "").trim();
      let error = "";

      if (!value) error = "This field is required";

      if (key === "title") {
        if (value.length < 5)
          error = "Title must be at least 5 characters";
        if (value.length > 60)
          error = "Title cannot exceed 60 characters";
      }

      if (key === "description") {
        if (value.length < 30)
          error = "Description must be at least 30 characters";
        if (value.length > 140)
          error = "Description cannot exceed 140 characters";
      }

      if (key === "buttonText") {
        if (value.length < 2 || value.length > 20)
          error = "Button text must be 2–20 characters";
      }

      if (key === "buttonUrl") {
  if (
    value &&
    !/^(#|\/|https?:\/\/)/.test(value)
  ) {
    error = "Enter a valid URL";
  }
}


      if (error) valid = false;
      newErrors[key] = error;
    });

    setErrors(newErrors);
    return valid;
  };

  // -------------------------
  // Submit handler
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await updateHeroSection(formData);
      if (res?.success) {
        toast.success("Hero Section Updated Successfully!");
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      toast.error("Failed to update hero section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row>
      <Col md={12}>
        <Card>
          <CardBody>
            <h4>Hero Section Management</h4>
            <p className="text-muted">
              Update homepage hero section content
            </p>

            <Form onSubmit={handleSubmit} noValidate>
              {/* Title */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Title{" "}
                  <small className="text-muted">
                    ({getCharCount(formData.title)}/60)
                  </small>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  isInvalid={!!errors.title}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Description */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Description{" "}
                  <small className="text-muted">
                    ({getCharCount(formData.description)}/140)
                  </small>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  isInvalid={!!errors.description}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Button Text */}
              <Form.Group className="mb-3">
                <Form.Label>
                  Button Text{" "}
                  <small className="text-muted">
                    ({getCharCount(formData.buttonText)}/20)
                  </small>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleChange}
                  isInvalid={!!errors.buttonText}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.buttonText}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Button URL */}
              <Form.Group className="mb-3">
                <Form.Label>Button URL</Form.Label>
                <Form.Control
                  type="text"
                  name="buttonUrl"
                  value={formData.buttonUrl}
                  onChange={handleChange}
                  isInvalid={!!errors.buttonUrl}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.buttonUrl}
                </Form.Control.Feedback>
              </Form.Group>

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default HeroSectionManagement;
