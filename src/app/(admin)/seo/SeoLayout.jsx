import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import TextAreaFormInput from '@/components/form/TextAreaFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import { Col, Row, Card, Button } from 'react-bootstrap';
import { forwardRef, useState, useEffect } from 'react';
import { getSeo, saveSeo } from '@/api/apis';
import { toast } from 'react-toastify';

// =============================
// SERVICES LIST (already done earlier)
// =============================
const SERVICES_LIST = [
    { label: "Service Page", value: "Service Page" },
  { label: "Company Formation", value: "company-formation-dubai" },
  { label: "Golden Visa", value: "golden-visa-services-dubai" },
  { label: "PRO Services", value: "pro-services-dubai" },
  { label: "Local Sponsorship", value: "local-sponsorship-dubai" },
  { label: "Visa Services", value: "visa-services-dubai" },
  { label: "ISO & Trademark Services", value: "iso-and-trademark-services-dubai" },
  { label: "Company Liquidation", value: "company-liquidation-dubai" },
  { label: "Document Attestation", value: "document-attestation-dubai" },
  { label: "Legal Translation", value: "legal-translation-dubai" },
  { label: "Insurance & VAT Services", value: "insurance-vat-services-dubai" },
  { label: "Corporate Bank Account Opening", value: "corporate-bank-account-opening-dubai" },
  { label: "Typing Services", value: "typing-services-dubai" },
  { label: "UAE Government Approvals", value: "uae-government-approvals-services" },
  { label: "Medical & Emirates ID Services", value: "medical-emirates-id-services-dubai" },
  { label: "Freezone Company Setup", value: "freezone-company-setup-dubai" },
  { label: "Dubai Court Services", value: "dubai-court-services" },
  { label: "Online MOA & POA Services", value: "online-moa-poa-services-dubai" },
  { label: "Virtual Office", value: "virtual-office-dubai" },
];

// =============================
// FREEZONE LIST
// =============================
const FREEZONE_LIST = [
  { label: "Freezone Page", value: "uae-freezone-business-setup" },
  { label: "IFZA Freezone Dubai", value: "ifza-freezone-dubai" },
  { label: "JAFZA Freezone Dubai", value: "jafza-freezone-dubai" },
  { label: "Meydan Freezone Dubai", value: "meydan-freezone-dubai" },
  { label: "Dubai South Freezone", value: "dubai-south-freezone" },
  { label: "DAFZA Freezone Dubai", value: "dafza-freezone-dubai" },
  { label: "Dubai Media Internet D3 DIFC", value: "dubai-media-internet-d3-difc" },
  { label: "ADGM Abu Dhabi", value: "adgm-abu-dhabi" },
  { label: "KIZAD Abu Dhabi", value: "kizad-abu-dhabi" },
  { label: "Masdar City Freezone Abu Dhabi", value: "masdar-city-freezone-abu-dhabi" },
  { label: "Twofour54 Abu Dhabi", value: "twofour54-abu-dhabi" },
  { label: "SAIF Zone Sharjah", value: "saif-zone-sharjah" },
  { label: "Hamriyah Free Zone Sharjah", value: "hamriyah-free-zone-sharjah" },
  { label: "Shams Sharjah", value: "shams-sharjah" },
  { label: "SPCFZ Sharjah Publishing City", value: "spcfz-sharjah-publishing-city" },
  { label: "RAKEZ Ras Al Khaimah", value: "rakez-ras-al-khaimah" },
  { label: "RAK Maritime City", value: "rak-maritime-city" },
  { label: "AFZ Ajman", value: "afz-ajman" },
  { label: "Ajman Media City", value: "ajman-media-city" },
  { label: "Fujairah Free Zone", value: "fujairah-free-zone" },
  { label: "Fujairah Creative City", value: "fujairah-creative-city" },
  { label: "UAQ Free Trade Zone", value: "uaq-free-trade-zone" },
];

// =============================
// LICENSE LIST
// =============================
const LICENSE_LIST = [
  { label: "Commercial License", value: "commercial-license" },
  { label: "Professional License", value: "professional-license" },
  { label: "Industrial License", value: "industrial-license" },
  { label: "Tourism License", value: "tourism-license" },
  { label: "E-Trader License", value: "e-trader-license" },
  { label: "Freelance Permit", value: "freelance-permit" },
];

// =============================
// VISA LIST
// =============================
const VISA_LIST = [
  { label: "Golden Visa", value: "golden-visa" },
  { label: "Green Visa", value: "green-visa" },
  { label: "Employment Visa", value: "employment-visa" },
  { label: "Family Visa", value: "family-visa" },
  { label: "Investor Visa", value: "investor-visa" },
  { label: "Freelance Visa", value: "freelance-visa" },
  { label: "Blue Visa", value: "blue-visa" },
];

// =============================
// PAGE OPTIONS (FINAL)
// =============================
const PAGE_OPTIONS = {
  home: [],
  about: [],
  services: SERVICES_LIST,
  freezone: FREEZONE_LIST,
  visa: VISA_LIST,
  license: LICENSE_LIST,
  mainland: [],
  gallery: [],
  blog: [],
  contact: [],
  offshore: [],
  privacy: [],
  terms:[],
  faqs:[]
};

// =============================
// VALIDATION SCHEMA
// =============================
const metaDataFormSchema = yup.object({
  page: yup.string().required("Please select a page"),
  innerPage: yup.string().when("page", {
    is: (page) => PAGE_OPTIONS[page]?.length > 0,
    then: (schema) => schema.required("Please select an inner page"),
    otherwise: (schema) => schema.notRequired(),
  }),
  title: yup.string().required('Meta title is required'),
  keywords: yup.string().required("At least 1 keyword is required"),
  description: yup.string().required('Meta description is required'),
  canonical: yup.string().url('Please enter a valid URL').required("Canonical URL is required"),
});

// =============================
// MAIN COMPONENT
// =============================
const SeoLayout = forwardRef((props, ref) => {

  const [innerPages, setInnerPages] = useState([]);
  const [keywordList, setKeywordList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(metaDataFormSchema),
    mode: "onChange",
    defaultValues: {
      page: "home",
      innerPage: "",
      title: "",
      keywords: "",
      description: "",
      canonical: "",
    },
  });

  const selectedPage = watch("page");
  const selectedInnerPage = watch("innerPage");

  // Load inner pages for default page
  useEffect(() => {
    setInnerPages(PAGE_OPTIONS["home"]);
  }, []);

  const addKeywords = (value) => {
    const keywords = value
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    setKeywordList(keywords);
  };

  const removeKeyword = (kw) => {
    const updated = keywordList.filter((k) => k !== kw);
    setKeywordList(updated);
    setValue("keywords", updated.join(", "));
  };

  const clearSeoFields = () => {
    setValue("title", "");
    setValue("keywords", "");
    setValue("description", "");
    setValue("canonical", "");
    setKeywordList([]);
  };

  const handlePageChange = (e) => {
    const page = e.target.value;

    setValue("page", page);
    setInnerPages(PAGE_OPTIONS[page] || []);

    setValue("innerPage", "");
    clearSeoFields();
  };

  const handleInnerPageChange = (e) => {
    const inner = e.target.value;

    setValue("innerPage", inner);
    clearSeoFields();
  };

  // Load SEO based on page + innerPage
  useEffect(() => {
    if (!selectedPage) return;

    const loadSeo = async () => {
      try {
        const res = await getSeo(selectedPage, selectedInnerPage);

        if (res?.success) {
          const seo = res.data;

          setValue("title", seo.title);
          setValue("keywords", seo.keywords.join(", "));
          setValue("description", seo.description);
          setValue("canonical", seo.canonical);
          setKeywordList(seo.keywords);
        }
      } catch {
        console.log("No SEO found for this page/subpage");
      }
    };

    loadSeo();
  }, [selectedPage, selectedInnerPage]);

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);

      const formattedData = {
        ...data,
        keywords: data.keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k.length > 0)
      };

      const res = await saveSeo(formattedData);

      if (res) {
        toast.success(res.message);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      {/* PAGE SELECTION */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-3">Page Selection</h5>

          <Row>
            <Col md={6}>
              <label className="form-label fw-bold">Select Page</label>
              <select
                className={`form-select ${errors.page ? "is-invalid" : ""}`}
                {...register("page")}
                onChange={handlePageChange}
              >
                <option value="">Select Page</option>
                {Object.keys(PAGE_OPTIONS).map((page) => (
                  <option key={page} value={page}>
                    {page.charAt(0).toUpperCase() + page.slice(1)}
                  </option>
                ))}
              </select>
              {errors.page && <p className="text-danger small">{errors.page.message}</p>}
            </Col>

            <Col md={6}>
              <label className="form-label fw-bold">Inner Page</label>
              <select
                className={`form-select ${errors.innerPage ? "is-invalid" : ""}`}
                {...register("innerPage")}
                disabled={innerPages.length === 0}
                onChange={handleInnerPageChange}
              >
                <option value="">Select Inner Page</option>
                {innerPages.map((inner, i) => (
                  <option key={i} value={inner.value}>
                    {inner.label}
                  </option>
                ))}
              </select>
              {errors.innerPage && <p className="text-danger small">{errors.innerPage.message}</p>}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* SEO FIELDS */}
      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="mb-3">SEO Meta Information</h5>

          <Row>
            <Col md={6}>
              <TextFormInput
                control={control}
                name="title"
                label="Meta Title"
                placeholder="Enter Meta Title"
              />
            </Col>

            <Col md={6}>
              <label className="form-label">Meta Keywords</label>
              <input
                type="text"
                className={`form-control ${errors.keywords ? "is-invalid" : ""}`}
                placeholder="keyword1, keyword2"
                {...register("keywords")}
                onChange={(e) => {
                  setValue("keywords", e.target.value);
                  addKeywords(e.target.value);
                }}
              />

              <div className="d-flex gap-2 flex-wrap mt-2">
                {keywordList.map((kw, i) => (
                  <span
                    key={i}
                    className="badge bg-primary"
                    style={{ fontSize: "14px", padding: "8px 12px", borderRadius: "8px" }}
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "white",
                        marginLeft: "5px",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {errors.keywords && <p className="text-danger small">{errors.keywords.message}</p>}
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={12}>
              <TextFormInput
                control={control}
                name="canonical"
                label="Canonical URL"
                placeholder="https://example.com/page"
              />
            </Col>
          </Row>

          <TextAreaFormInput
            control={control}
            name="description"
            label="Meta Description"
            placeholder="Enter SEO Meta Description"
            containerClassName="mt-3"
          />

        </Card.Body>
      </Card>

      {/* SUBMIT */}
      <div className="d-flex justify-content-end mt-3">
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save SEO Data"}
        </Button>
      </div>

    </form>
  );
});

export default SeoLayout;
