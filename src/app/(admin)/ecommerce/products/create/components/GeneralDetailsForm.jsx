import { yupResolver } from '@hookform/resolvers/yup';
import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle
} from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import TextFormInput from '@/components/form/TextFormInput';
import { Col, Row } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const generalFormSchema = yup.object({
  name: yup.string().required('Blog title is required'),
  reference: yup.string().required('Excerpt is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  subCategory: yup.string().required('Sub Category is required'),
});

const categories = [
  {
    id: "service",
    name: "Services",
    subcategories: [
      "Company Formation",
      "Golden Visa",
      "PRO Services",
      "Local Sponsorship",
      "Visa Services",
      "ISO Certification & Trademark Registration",
      "Virtual Office",
      "Company Liquidation",
      "Document Attestation",
      "Legal Translation",
      "Insurance & VAT Services",
      "Bank Account Opening",
      "Typing Services",
      "UAE Government Approvals",
      "Medical & Emirates ID Services",
      "FREEZONE",
      "Dubai Court Services",
      "Online MOA & POA Services"
    ],
  },
  {
    id: "visa",
    name: "Visa",
    subcategories: [
      "Employment Visa",
      "Investor Visa",
      "Family Visa",
      "Golden Visa",
      "Freelance Visa",
      "Green Visa",
      "Blue Visa"
    ],
  },
  {
    id: "license",
    name: "License",
    subcategories: [
      "Commercial License",
      "Professional License",
      "Industrial License",
      "Tourism License",
      "E-Trader License",
      "Freelance Permit"
    ],
  },
  {
    id: "freezone",
    name: "Freezone",
    subcategories: [
      "Ifza Freezone Dubai",
      "Jafza Freezone Dubai",
      "Meydan Freezone Dubai",
      "Dubai South Freezone",
      "Dafza Freezone Dubai",
      "Dubai Media Internet D3 Difc",
      "Adgm Abu Dhabi",
      "Kizad Abu Dhabi",
      "Masdar City Freezone Abu Dhabi",
      "Twofour54 Abu Dhabi",
      "Saif Zone Sharjah",
      "Hamriyah Free Zone Sharjah",
      "Shams Sharjah",
      "Spcfz Sharjah Publishing City",
      "Rakez Ras Al Khaimah",
      "Rak Maritime City",
      "Afz Ajman",
      "Ajman Media City",
      "Fujairah Free Zone",
      "Fujairah Creative City",
      "Uaq Free Trade Zone"
    ],
  }
];

const GeneralDetailsForm = forwardRef(({ updateBlogData, blogData }, ref) => {
  const initialLoad = useRef(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    register,
    trigger,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(generalFormSchema),
    defaultValues: {
      name: "",
      reference: "",
      description: "",
      category: "",
      subCategory: ""
    }
  });

  const [productDescriptionContent, setProductDescriptionContent] = useState("");

  // Expose validateStep() to parent
  useImperativeHandle(ref, () => ({
    validateStep: async () => {
      const isValid = await trigger();  // triggers Yup + RHF validation
      return isValid;
    }
  }));

  // Load initial data (edit mode)
  useEffect(() => {
    if (blogData.title && !initialLoad.current) {
      reset({
        name: blogData.title || "",
        reference: blogData.excerpt || "",
        description: blogData.description || "",
        category: blogData.category || "",
        subCategory: blogData.subCategory || ""
      });

      setProductDescriptionContent(blogData.description || "");
      initialLoad.current = true;
    }
  }, [blogData, reset]);

  // Sync parent data from form fields except description
  useEffect(() => {
    const sub = watch((values) => {
      updateBlogData({
        title: values.name,
        excerpt: values.reference,
        category: values.category,
        subCategory: values.subCategory,
      });
    });

    return () => sub.unsubscribe && sub.unsubscribe();
  }, [watch, updateBlogData]);

  // Reset subcategory when category changes
  useEffect(() => {
    const sub = watch((_, detail) => {
      if (detail.name === "category") {
        setValue("subCategory", "");
      }
    });

    return () => sub.unsubscribe && sub.unsubscribe();
  }, [watch, setValue]);

  const selectedCategory = watch("category");
  const selectedSubcategory = watch("subCategory");

  return (
    <form noValidate>

      <input type="hidden" {...register("description")} />

      {/* Title + Excerpt */}
      <Row>
        <Col lg={6}>
          <TextFormInput
            control={control}
            label="Blog Title"
            placeholder="Enter blog title"
            containerClassName="mb-3"
            id="blog-title"
            name="name"
          />
        </Col>

        <Col lg={6}>
          <TextFormInput
            control={control}
            name="reference"
            placeholder="Enter excerpt"
            label="Excerpt"
            containerClassName="mb-3"
          />
        </Col>
      </Row>

      {/* CATEGORY */}
      <Row>
        <Col lg={6}>
          <label className="form-label fw-bold">Category</label>

          <div className="d-flex gap-3 flex-wrap mb-3">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;

              return (
                <label
                  key={cat.id}
                  className={`p-2 px-3 rounded border ${isSelected ? "bg-primary text-white" : "bg-light text-muted"}`}
                  style={{ cursor: "pointer" }}
                >
                  <input type="radio" {...register("category")} value={cat.id} className="me-2" />
                  {cat.name}
                </label>
              );
            })}
          </div>

          {errors.category && <p className="text-danger small">{errors.category.message}</p>}
        </Col>

        {/* SUBCATEGORY */}
        <Col lg={6}>
  <label className="form-label fw-bold">Sub Category</label>

  <select
    className={`form-select mb-3 ${errors.subCategory ? 'is-invalid' : ''}`}
    {...register("subCategory")}
    disabled={!selectedCategory}
  >
    <option value="">Select Sub Category</option>

    {selectedCategory &&
      categories
        .find(cat => cat.id === selectedCategory)
        ?.subcategories.map(sub => (
          <option key={sub} value={sub}>{sub}</option>
        ))}
  </select>

  {errors.subCategory && (
    <p className="text-danger small">{errors.subCategory.message}</p>
  )}
</Col>

      </Row>

      {/* Selected Subcategory */}
      {selectedSubcategory && (
        <Row className="mt-2">
          <Col lg={12}>
            <label className="form-label fw-bold">Selected subCategory</label>
            <input type="text" className="form-control" value={selectedSubcategory} readOnly />
          </Col>
        </Row>
      )}

      {/* DESCRIPTION */}
      <Row>
        <Col lg={12}>
          <div className="mb-5 mt-3">
            <label className="form-label">Blog Description</label>

            <ReactQuill
              theme="snow"
              style={{ height: 195 }}
              value={productDescriptionContent}
              onChange={(val) => {
                setProductDescriptionContent(val);
                setValue("description", val, { shouldValidate: true });
                updateBlogData({ description: val });
              }}
            />

          </div>
          {errors.description && <p className="text-danger small mt-1">{errors.description.message}</p>}
        </Col>
      </Row>
    </form>
  );
});

export default GeneralDetailsForm;
