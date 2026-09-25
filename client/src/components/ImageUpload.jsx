// components/ImageUpload.jsx
import { useState } from "react";

const ImageUpload = ({ onChange, initialPreview = null }) => {
  const [preview, setPreview] = useState(initialPreview);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        e.target.value = "";
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size should be less than 2MB");
        e.target.value = "";
        return;
      }

      setPreview(URL.createObjectURL(file));

      // send file to parent component
      if (onChange) {
        onChange(file);
      }
    }
  };

  const removeImage = () => {
    setPreview(null);
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="border p-2 rounded"
      />

      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="preview"
            className="w-40 h-40 object-cover rounded border"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
