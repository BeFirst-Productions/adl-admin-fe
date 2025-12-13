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
  category: yup.string().required('Page is required'),

  subCategory: yup.string().when("category", {
is: (val) => val !== "blog" ,
    then: (schema) => schema.required("Innerpage is required"),
    otherwise: (schema) => schema.optional(),
  }),

  url: yup
    .string()
    .required("URL is required")
    .matches(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed"),
});


const categories = [
  // ✅ SERVICES
  {
    id: "service",
    name: "Services",
    subcategories: [
      { name: "Company Formation", path: "/company-formation-dubai" },
      { name: "Golden Visa", path: "/golden-visa-services-dubai" },
      { name: "PRO Services", path: "/pro-services-dubai" },
      { name: "Local Sponsorship", path: "/local-sponsorship-dubai" },
      { name: "Visa Services", path: "/visa-services-dubai" },
      { name: "ISO Certification & Trademark Registration", path: "/iso-and-trademark-services-dubai" },
      { name: "Virtual Office", path: "/virtual-office-dubai" },
      { name: "Company Liquidation", path: "/company-liquidation-dubai" },
      { name: "Document Attestation", path: "/document-attestation-dubai" },
      { name: "Legal Translation", path: "/legal-translation-dubai" },
      { name: "Insurance & VAT Services", path: "/insurance-vat-services-dubai" },
      { name: "Bank Account Opening", path: "/corporate-bank-account-opening-dubai" },
      { name: "Typing Services", path: "/typing-services-dubai" },
      { name: "UAE Government Approvals", path: "/uae-government-approvals-services" },
      { name: "Medical & Emirates ID Services", path: "/medical-emirates-id-services-dubai" },
      { name: "FREEZONE", path: "/freezone-company-setup-dubai" },
      { name: "Dubai Court Services", path: "/dubai-court-services" },
      { name: "Online MOA & POA Services", path: "/online-moa-poa-services-dubai" },
    ],
  },

  // ✅ LICENSE
  {
    id: "license",
    name: "License",
    subcategories: [
      { name: "Commercial License", path: "/commercial-license" },
      { name: "Professional License", path: "/professional-license" },
      { name: "Industrial License", path: "/industrial-license" },
      { name: "Tourism License", path: "/tourism-license" },
      { name: "E-Trader License", path: "/e-trader-license" },
      { name: "Freelance Permit", path: "/freelance-permit" },
    ],
  },

  // ✅ VISA  
  {
    id: "visa",
    name: "Visa",
    subcategories: [
      { name: "Employment Visa", path: "/employment-visa" },
      { name: "Investor Visa", path: "/investor-visa" },
      { name: "Family Visa", path: "/family-visa" },
      { name: "Golden Visa", path: "/golden-visa" },
      { name: "Freelance Visa", path: "/freelance-visa" },
      { name: "Green Visa", path: "/green-visa" },
      { name: "Blue Visa", path: "/blue-visa" },
    ],
  },

  {
    id: "freezone",
    name: "Freezone",
    subcategories: [ { name: "Freezone Page", path: "/freezone" },]

    // [
    //   { name: "Ifza Freezone Dubai", path: "/ifza-freezone-dubai" },
    //   { name: "Jafza Freezone Dubai", path: "/jafza-freezone-dubai" },
    //   { name: "Meydan Freezone Dubai", path: "/meydan-freezone-dubai" },
    //   { name: "Dubai South Freezone", path: "/dubai-south-freezone" },
    //   { name: "Dafza Freezone Dubai", path: "/dafza-freezone-dubai" },
    //   { name: "Dubai Media Internet D3 Difc", path: "/dubai-media-internet-d3-difc" },
    //   { name: "Adgm Abu Dhabi", path: "/adgm-abu-dhabi" },
    //   { name: "Kizad Abu Dhabi", path: "/kizad-abu-dhabi" },
    //   { name: "Masdar City Freezone Abu Dhabi", path: "/masdar-city-freezone-abu-dhabi" },
    //   { name: "Twofour54 Abu Dhabi", path: "/twofour54-abu-dhabi" },
    //   { name: "Saif Zone Sharjah", path: "/saif-zone-sharjah" },
    //   { name: "Hamriyah Free Zone Sharjah", path: "/hamriyah-free-zone-sharjah" },
    //   { name: "Shams Sharjah", path: "/shams-sharjah" },
    //   { name: "Spcfz Sharjah Publishing City", path: "/spcfz-sharjah-publishing-city" },
    //   { name: "Rakez Ras Al Khaimah", path: "/rakez-ras-al-khaimah" },
    //   { name: "Rak Maritime City", path: "/rak-maritime-city" },
    //   { name: "Afz Ajman", path: "/afz-ajman" },
    //   { name: "Ajman Media City", path: "/ajman-media-city" },
    //   { name: "Fujairah Free Zone", path: "/fujairah-free-zone" },
    //   { name: "Fujairah Creative City", path: "/fujairah-creative-city" },
    //   { name: "Uaq Free Trade Zone", path: "/uaq-free-trade-zone" },
    // ]

  },

  {
    id: "blog",
    name: "Blog",
    subcategories: [],
  },
];


const GeneralDetailsForm = forwardRef(({ updateBlogData, blogData,formErrors }, ref) => {
  const initialLoad = useRef(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    register,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(generalFormSchema),
    defaultValues: {
      name: "",
      reference: "",
      description: "",
      category: "",
      subCategory: "",
      url: ""
    },
  });

  const [productDescriptionContent, setProductDescriptionContent] = useState("");

  // Expose validateStep() to parent
  useImperativeHandle(ref, () => ({
    validateStep: async () => {
      const isValid = await trigger();
      return isValid;
    },
  }));

  // Load initial data (edit mode)
  useEffect(() => {
    if (blogData.title && !initialLoad.current) {
      reset({
        name: blogData.title || "",
        reference: blogData.excerpt || "",
        description: blogData.description || "",
        category: blogData.category || "",
        subCategory: blogData.subCategory || "",
        url: blogData.url || ""   // ✅ INCLUDED IN RESET
      });

      setProductDescriptionContent(blogData.description || "");
      initialLoad.current = true;
    }
  }, [blogData, reset]);

  // Sync parent data from form fields except description (handled separately)
  useEffect(() => {
    const sub = watch((values) => {
      updateBlogData({
        title: values.name,
        excerpt: values.reference,
        category: values.category,
        subCategory: values.subCategory,
        url: values.url,   // ✅ INCLUDED IN SYNC
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

      {/* URL NAME FIELD */}
      <Row>
        <Col lg={6}>
          <TextFormInput
            control={control}
            name="url"
            placeholder="Enter URL "
            label="URL Name"
            containerClassName="mb-3"
            id="url-name"
          />

        {formErrors?.url && (
  <p className="text-danger small">{formErrors.url}</p>
)}
        </Col>

      </Row>

      {/* CATEGORY */}
      <Row>
        <Col lg={6}>
          <label className="form-label fw-bold">Pages</label>

          <div className="d-flex gap-3 flex-wrap mb-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;

              return (
                <label
                  key={cat.id}
                  className={`p-2 px-3 rounded border ${isSelected ? "bg-primary text-white" : "bg-light text-muted"
                    }`}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="radio"
                    {...register("category")}
                    value={cat.id}
                    className="me-2"
                  />
                  {cat.name}
                </label>
              );
            })}
          </div>
          {errors.category && (
            <p className="text-danger small">{errors.category.message}</p>
          )}

        </Col>

        {/* SUBCATEGORY */}
        <Col lg={6}>
          <label className="form-label fw-bold">Innerpages</label>
          <select
            className={`form-select mb-3 ${errors.subCategory ? "is-invalid" : ""}`}
            {...register("subCategory")}
            disabled={!selectedCategory}
          >
            <option value="">Select Sub Category</option>

            {selectedCategory &&
              categories
                .find((cat) => cat.id === selectedCategory)
                ?.subcategories.map((sub) => (
                  <option key={sub.path} value={sub.path}>
                    {sub.name}
                  </option>
                ))}
          </select>


          {errors.subCategory && (
            <p className="text-danger small">
              {errors.subCategory.message}
            </p>
          )}
          {formErrors?.subCategory && (
  <p className="text-danger small">{formErrors.subCategory}</p>
)}
        </Col>
      </Row>

      {/* Selected Subcategory */}
      {selectedSubcategory && (
        <Row className="mt-2">
          <Col lg={12}>
            <label className="form-label fw-bold">Selected Sub Category</label>
            <input
              type="text"
              className="form-control"
              value={selectedSubcategory}
              readOnly
            />
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

          {errors.description && (
            <p className="text-danger small mt-1">
              {errors.description.message}
            </p>
          )}
        </Col>
      </Row>
    </form>
  );
});

export default GeneralDetailsForm;
