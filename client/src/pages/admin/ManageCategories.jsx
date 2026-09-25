import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Tag, Search, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import { formatDate } from "../../utils/formatters";

const ManageCategories = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCategories: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const urlPage = Number(searchParams.get("page")) || 1;
    const urlSearch = searchParams.get("search") || "";

    setPage(urlPage);
    setSearch(urlSearch);
    setSearchText(urlSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();

      const res = await api.get("/categories", { params });
      const data = res.data.data;

      setCategories(
        Array.isArray(data.categories)
          ? data.categories
          : Array.isArray(data)
            ? data
            : [],
      );
      setPagination(
        data.pagination || {
          page: 1,
          limit: 10,
          totalCategories: data.length || 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const params = { page };
    if (search.trim()) params.search = search.trim();
    setSearchParams(params, { replace: true });
  }, [page, search, setSearchParams]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchText.trim());
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;
    try {
      setDeleting(true);
      await api.delete(`/categories/${deleteCategory._id}`);
      toast.success("Category deleted!");
      setDeleteCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

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
      if (iconData.url) return getImageUrl(iconData.url);
      if (iconData.secure_url) return iconData.secure_url;
      if (iconData.path) return getImageUrl(iconData.path);
    }
    return "";
  };

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumb="SYSTEM CATEGORIES"
        title="Event Categories"
        subtitle="Manage category tags used by organizers to classify campus events."
        action={
          <button
            onClick={() => navigate("/admin/categories/add")}
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              bg-primary
              px-6
              py-3
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-primary/30
              transition
              hover:bg-primary-hover
              hover:scale-[1.02]
            "
          >
            <Plus size={18} />
            <span>Add New Category</span>
          </button>
        }
      />

      {/* Search Input */}
      <div
        className="
          flex
          flex-col
          gap-4
          rounded-3xl
          border
          border-border
          bg-surface/80
          p-4
          backdrop-blur-xl
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search category name..."
            className="
              w-full
              rounded-2xl
              border
              border-border
              bg-surface-secondary
              py-2
              pl-9
              pr-4
              text-xs
              text-text
              placeholder:text-text-muted
              outline-none
              focus:border-primary
            "
          />
        </div>
        <button
          onClick={handleSearch}
          className="
            rounded-2xl
            bg-primary
            px-6
            py-2
            text-xs
            font-bold
            text-white
            shadow-lg
            shadow-primary/30
            transition
            hover:bg-primary-hover
            hover:scale-[1.02]
          "
        >
          Search
        </button>
      </div>

      {/* Categories Grid / List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 w-full animate-pulse rounded-3xl border border-border bg-surface/50"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          title="No Categories Found"
          description="Create your first event category to help organizers tag their fests."
          icon={Tag}
          action={
            <button
              onClick={() => navigate("/admin/categories/add")}
              className="
                rounded-2xl
                bg-primary
                px-6
                py-2.5
                text-xs
                font-bold
                text-white
                shadow-lg
                shadow-primary/30
                transition
                hover:bg-primary-hover
                hover:scale-[1.02]
              "
            >
              Add Category
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => {
            const iconUrl = getImageUrl(cat.icon);
            return (
              <div
                key={cat._id}
                className="
                  group
                  flex
                  items-center
                  justify-between
                  rounded-3xl
                  border
                  border-border
                  bg-surface/90
                  p-5
                  shadow-xl
                  backdrop-blur-xl
                  transition
                  hover:-translate-y-1
                  hover:border-primary/30
                "
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-2xl
                      border
                      border-border
                      bg-primary/10
                      font-bold
                      text-primary
                    "
                  >
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt={cat.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Tag size={20} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3
                      className="
                        truncate
                        text-sm
                        font-bold
                        text-text
                        transition-colors
                        group-hover:text-primary
                      "
                    >
                      {cat.name}
                    </h3>
                    <p className="font-mono text-[10px] text-text-muted">
                      Created {formatDate(cat.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      navigate(`/admin/categories/edit/${cat._id}`)
                    }
                    className="
                      rounded-xl
                      p-2
                      text-text-muted
                      transition
                      hover:bg-surface-secondary
                      hover:text-text
                    "
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => setDeleteCategory(cat)}
                    className="
                      rounded-xl
                      p-2
                      text-danger
                      transition
                      hover:bg-danger/10
                    "
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={Boolean(deleteCategory)}
        onClose={() => setDeleteCategory(null)}
        title="Delete Category"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Are you sure you want to delete{" "}
            <strong className="text-text">{deleteCategory?.name}</strong>?
          </p>
          <p className="text-xs text-danger">
            Events using this category tag may require updating.
          </p>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              onClick={() => setDeleteCategory(null)}
              className="
                rounded-2xl
                border
                border-border
                bg-surface-secondary
                px-5
                py-2.5
                text-xs
                font-bold
                text-text-muted
                transition
                hover:bg-surface
                hover:text-text
              "
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="
                rounded-2xl
                bg-danger
                px-5
                py-2.5
                text-xs
                font-bold
                text-white
                shadow-lg
                shadow-danger/30
                transition
                hover:bg-danger/90
                hover:scale-[1.02]
                disabled:opacity-50
              "
            >
              {deleting ? "Deleting..." : "Delete Category"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageCategories;
