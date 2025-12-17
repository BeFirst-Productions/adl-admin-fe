import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import TextAreaFormInput from '@/components/form/TextAreaFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import { Col, Row } from 'react-bootstrap';
import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';

const metaDataFormSchema = yup.object({
  title: yup.string().required('Meta title is required'),
  keywords: yup.string().required("At least 1 keyword is required"),
  description: yup.string().required('Meta description is required'),
  canonical: yup
    .string()
    .url('Please enter a valid URL')
    .required("Canonical URL is required"),
});

const MetaDataForm = forwardRef(({ updateBlogData, blogData }, ref) => {
  const [keywordList, setKeywordList] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');

  const {
    control,
    trigger,
    reset,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(metaDataFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: blogData.metaTitle || '',
      description: blogData.metaDescription || '',
      canonical: blogData.canonical || '',
      keywords: blogData.metaKeywords || '',
    },
  });

  // Load data on edit mode once
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current || !blogData || !blogData.metaTitle) return;

    const list =
      blogData.metaKeywords
        ?.split(',')
        .map((x) => x.trim())
        .filter(Boolean) || [];

    setKeywordList(list);
    setKeywordInput(blogData.metaKeywords || '');

    reset({
      title: blogData.metaTitle,
      description: blogData.metaDescription,
      canonical: blogData.canonical || '',
      keywords: blogData.metaKeywords || '',
    });

    initialised.current = true;
  }, [blogData, reset]);

  // Expose validation to parent
  useImperativeHandle(ref, () => ({
    validateMetaStep: async () => {
      const isValid = await trigger();
      return isValid;
    },
  }));

  // Sync to parent
  useEffect(() => {
    const subscription = watch((values) => {
      updateBlogData({
        metaTitle: values.title || '',
        metaDescription: values.description || '',
        canonical: values.canonical || '',
        metaKeywords: values.keywords || '',
      });
    });

    return () => subscription.unsubscribe && subscription.unsubscribe();
  }, [watch, updateBlogData]);

  // Handle keyword input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setKeywordInput(value);

    const parts = value
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

    setKeywordList(parts);

    const keywordStr = parts.join(',');

    setValue('keywords', keywordStr, { shouldValidate: true });
    updateBlogData({ metaKeywords: keywordStr });
  };

  const removeKeyword = (kw) => {
    const updated = keywordList.filter((k) => k !== kw);
    const updatedStr = updated.join(',');

    setKeywordList(updated);
    setKeywordInput(updatedStr);

    setValue('keywords', updatedStr, { shouldValidate: true });
    updateBlogData({ metaKeywords: updatedStr });
  };

  return (
    <form>
      <h5 className="mb-3 mt-0">Fill all metadata below</h5>

      <Row>
        {/* META TITLE */}
        <Col md={6}>
          <TextFormInput
            control={control}
            name="title"
            label="Meta Title"
            placeholder="Enter Meta Title"
            containerClassName="mb-1"
          />

        </Col>

        {/* KEYWORDS */}
        {/* KEYWORDS FIELD */}
        <Col md={6}>
          <label className="form-label">Meta Keywords</label>

          <input
            type="text"
            className="form-control"
            placeholder="keyword1, keyword2"
            value={keywordInput}
            {...register("keywords")}
            onChange={handleInputChange}
          />

          <div className="d-flex gap-2 flex-wrap mt-2">
            {keywordList.map((kw, i) => (
              <span key={i} className="badge bg-primary"                     style={{ fontSize: "14px", padding: "8px 12px", borderRadius: "8px" }}
>
                {kw}
                <button
                  type="button"
                  onClick={() => removeKeyword(kw)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    marginLeft: '5px',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {errors.keywords && (
            <p className="text-danger small mt-1">{errors.keywords.message}</p>
          )}
        </Col>

      </Row>

      {/* CANONICAL URL */}
      <Row>
        <Col md={12}>
          <TextFormInput
            control={control}
            name="canonical"
            label="Canonical URL"
            placeholder="https://example.com/blog-post"
            containerClassName="mt-2"
          />


        </Col>
      </Row>

      {/* META DESCRIPTION */}
      <TextAreaFormInput
        control={control}
        name="description"
        label="Meta Description"
        placeholder="Enter SEO Meta Description"
      />

    </form>
  );
});

export default MetaDataForm;
