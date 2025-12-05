import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";
import { addGallery } from "@/api/apis";

const ImageUpload = ({ handleImage }) => {
    const fileInputRef = useRef();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setImage(null);
        setPreview("");
        fileInputRef.current.value = "";
    };

    // ⭐ API SUBMIT FUNCTION ADDED HERE ⭐
    const handleSubmit = async () => {
        if (!image) return;

        try {
            setIsSubmitting(true);

            const formData = new FormData();
            formData.append("image", image);

            const res = await addGallery(formData)

            if (res.success) {
                toast.success(res.message || "Image uploaded successfully!");
                handleImage()
            }


            // Reset state after successful upload
            removeImage();

        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <label className="fs-14 mb-1">Upload Image</label>

            {!preview && (
                <div className="upload-box" onClick={() => fileInputRef.current.click()}>
                    <Icon icon="bx:cloud-upload" width="48" height="48" className="upload-icon" />
                    <p className="upload-text">Drop file here or click to browse</p>
                    <p className="upload-help">(Only one image allowed)</p>

                    <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageSelect}
                    />
                </div>
            )}

            {preview && (
                <div className="preview-wrapper mt-2">
                    <button className="remove-btn" onClick={removeImage}>
                        <Icon icon="mdi:close" width="18" height="18" />
                    </button>

                    <img src={preview} className="uploaded-image" alt="preview" />
                </div>
            )}

            {/* SUBMIT BUTTON */}
            <div className="mt-3">
                <button
                    className="btn btn-primary"
                    disabled={!image || isSubmitting}
                    onClick={handleSubmit}
                >
                    {isSubmitting ? "Uploading..." : "Submit Image"}
                </button>
            </div>

            {/* Styles */}
            <style jsx>{`
        .upload-box {
          width: 100%;
          padding: 35px;
          border: 2px dashed #b9b9b9;
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: 0.3s ease;
        }
        .upload-box:hover {
          border-color: #5a5ad1;
        }
        .upload-icon {
          color: #5a5ad1;
          margin-bottom: 10px;
        }
        .upload-text {
          font-size: 15px;
          font-weight: 600;
          margin: 0;
          color: #8d8f8e;
        }
        .upload-help {
          font-size: 13px;
          color: #888;
          margin-top: 4px;
        }
        .preview-wrapper {
          position: relative;
          width: 140px;
        }
        .uploaded-image {
          width: 140px;
          height: 140px;
          border-radius: 10px;
          object-fit: cover;
          border: 1px solid #ddd;
        }
        .remove-btn {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #ff4d4d;
          border: none;
          color: white;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0;
        }
      `}</style>
        </div>
    );
};

export default ImageUpload;
