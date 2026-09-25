import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";

const AddCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchCategory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getImageUrl = (iconData) => {
    if (!iconData) return "";

    if (typeof iconData === "string") {
      if (
        iconData.startsWith("http://") ||
        iconData.startsWith("https://") ||
        iconData.startsWith("blob:")
      ) {
        return iconData;
      }

      return `${api.defaults.baseURL}/${iconData.replace(/^\//, "")}`;
    }

    if (typeof iconData === "object") {
      if (iconData.url) {
        return getImageUrl(iconData.url);
      }

      if (iconData.secure_url) {
        return iconData.secure_url;
      }

      if (iconData.path) {
        return getImageUrl(iconData.path);
      }
    }

    return "";
  };

  const fetchCategory = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/categories/${id}`);

      const category = res.data.data;

      setName(category.name || "");

      const imageUrl = getImageUrl(category.icon);

      if (imageUrl) {
        setPreview(imageUrl);
        // Keep track that this is an existing image, not a new file
        setIcon(null); // Reset icon state since this is a URL, not a File object
      }
    } catch (error) {
      toast.error("Failed to fetch category");
      navigate("/admin/categories");
    } finally {
      setLoading(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG, JPG, WEBP, SVG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIcon(file);

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      processFile(file);
    }

    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files?.[0];

    if (file) {
      processFile(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIcon(null);
    setPreview("");

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", name.trim());

      // Only append icon if it's a File object (new upload)
      if (icon && icon instanceof File) {
        formData.append("icon", icon);
      }

      if (isEdit) {
        await api.put(`/categories/${id}`, formData);
        toast.success("Category updated successfully!");
      } else {
        await api.post("/categories", formData);
        toast.success("Category created successfully!");
      }

      navigate("/admin/categories");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (loading) {
    return (
      <div
        className="
        flex min-h-[400px]
        flex-col items-center
        justify-center space-y-4
      "
      >
        <div
          className="
            h-10 w-10
            animate-spin
            rounded-full
            border-4
            border-primary
            border-t-transparent
          "
        />

        <p
          className="
            text-sm
            font-semibold
            text-text-muted
          "
        >
          Loading Category...
        </p>
      </div>
    );
  }

  return (
    <div
      className="
      mx-auto
      max-w-3xl
      space-y-8
    "
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="
          inline-flex
          items-center
          gap-2
          rounded-2xl
          border
          border-border
          bg-surface
          px-4
          py-2
          text-xs
          font-bold
          text-text-muted
          transition
          hover:bg-surface-secondary
        "
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <PageHeader
        breadcrumb="CATEGORY BUILDER"
        title={isEdit ? "Edit Category" : "Add Event Category"}
        subtitle={
          isEdit
            ? "Update category label and icon graphic."
            : "Create a new tag for classifying campus events."
        }
      />

      <form
        onSubmit={handleSubmit}
        className="
          space-y-6
          rounded-3xl
          border
          border-border
          bg-surface/80
          p-6
          backdrop-blur-xl
          md:p-8
        "
      >
        <div>
          <label
            className="
              mb-2
              block
              text-xs
              font-semibold
              uppercase
              text-text-muted
            "
          >
            Category Name *
          </label>

          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="
              e.g. Hackathon, Cultural, Sports...
            "
            className="
              w-full
              rounded-2xl
              border
              border-border
              bg-surface-secondary
              px-4
              py-3.5
              text-sm
              text-text
              placeholder:text-text-muted
              outline-none
              focus:border-primary
            "
          />
        </div>

        <div>
          <label
            className="
              mb-2
              block
              text-xs
              font-semibold
              uppercase
              text-text-muted
            "
          >
            Category Graphic Icon
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {preview ? (
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                rounded-2xl
                border-2
                border-dashed
                border-primary/30
                bg-surface-secondary
                p-6
              "
            >
              <img
                src={preview}
                alt="Category Icon Preview"
                className="
                  h-28
                  w-28
                  rounded-2xl
                  border
                  border-border
                  object-cover
                  shadow-lg
                "
              />

              <p
                className="
                  mt-2
                  max-w-xs
                  truncate
                  text-xs
                  font-mono
                  text-text-muted
                "
              >
                {icon && icon instanceof File ? icon.name : "Current Icon"}
              </p>

              <div
                className="
                  mt-4
                  flex
                  gap-3
                "
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-xl
                    border
                    border-border
                    bg-surface
                    px-4
                    py-2
                    text-xs
                    font-bold
                    text-text-muted
                    transition
                    hover:bg-surface-secondary
                  "
                >
                  <Upload size={14} />
                  Change Icon
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-xl
                    border
                    border-danger/20
                    bg-danger/10
                    px-4
                    py-2
                    text-xs
                    font-bold
                    text-danger
                    transition
                    hover:bg-danger/20
                  "
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                flex
                min-h-[180px]
                cursor-pointer
                flex-col
                items-center
                justify-center
                rounded-2xl
                border-2
                border-dashed
                p-6
                transition

                ${
                  isDragging
                    ? `
                      border-primary
                      bg-primary/10
                    `
                    : `
                      border-border
                      bg-surface-secondary
                      hover:border-primary/50
                    `
                }
              `}
            >
              <div
                className="
                  pointer-events-none
                  space-y-2
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-primary/20
                    bg-primary/10
                    text-primary
                  "
                >
                  <ImageIcon size={28} />
                </div>

                <p
                  className="
                    text-sm
                    font-bold
                    text-text
                  "
                >
                  Click or drag image to upload
                </p>

                <p
                  className="
                    text-xs
                    text-text-muted
                  "
                >
                  PNG, SVG, WEBP or JPG (max 5MB)
                </p>
              </div>
            </div>
          )}
        </div>

        <div
          className="
            flex
            justify-end
            gap-3
            border-t
            border-border
            pt-4
          "
        >
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            className="
              rounded-2xl
              border
              border-border
              bg-surface-secondary
              px-6
              py-3
              text-xs
              font-bold
              text-text-muted
              transition
              hover:bg-surface
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              bg-primary
              px-6
              py-3
              text-xs
              font-bold
              text-white
              shadow-lg
              shadow-primary/30
              transition
              hover:bg-primary-hover
              hover:scale-105
              disabled:opacity-50
            "
          >
            <Save size={16} />

            <span>
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Category"
                  : "Save Category"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;
