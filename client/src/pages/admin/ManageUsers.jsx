import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronRight,
  User,
  ShieldCheck,
  Building2,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";

const ManageUsers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const [role, setRole] = useState("all");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const urlPage = Number(searchParams.get("page")) || 1;
    const urlRole = searchParams.get("role") || "all";
    const urlSearch = searchParams.get("search") || "";

    setPage(urlPage);
    setRole(urlRole);
    setSearch(urlSearch);
    setSearchText(urlSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: 10,
      };

      if (search.trim()) params.search = search.trim();
      if (role !== "all") params.role = role;

      const res = await api.get("/admin/users", { params });
      const data = res.data.data;

      setUsers(Array.isArray(data.users) ? data.users : []);
      setPagination(
        data.pagination || {
          page: 1,
          limit: 10,
          totalUsers: 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [page, role, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const params = {
      page,
      role,
    };

    if (search.trim()) params.search = search.trim();

    setSearchParams(params, {
      replace: true,
    });
  }, [page, role, search, setSearchParams]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchText.trim());
  };

  const handleFilter = (selectedRole) => {
    setRole(selectedRole);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumb="USER MANAGEMENT"
        title="User Management"
        subtitle="Manage students, organizers, and administrative accounts."
      />

      {/* Filters */}
      <div
        className="
          flex
          flex-col
          gap-5
          rounded-3xl
          border
          border-border
          bg-surface/80
          p-5
          backdrop-blur-xl
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div className="flex flex-wrap gap-3">
          {[
            {
              label: "All Users",
              value: "all",
              icon: Users,
            },
            {
              label: "Students",
              value: "student",
              icon: User,
            },
            {
              label: "Organizers",
              value: "organizer",
              icon: Building2,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.value}
                onClick={() => handleFilter(item.value)}
                className={`
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  transition
                  ${
                    role === item.value
                      ? `
                        bg-primary
                        text-white
                        shadow-lg
                        shadow-primary/30
                        hover:bg-primary-hover
                        hover:scale-[1.02]
                      `
                      : `
                        border
                        border-border
                        bg-surface-secondary
                        text-text-muted
                        hover:bg-surface
                        hover:text-text
                      `
                  }
                `}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 lg:max-w-xs">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search users..."
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
      </div>

      {/* Users List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-3xl border border-border bg-surface/50"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="No Users Found"
          description="There are no user accounts matching your criteria."
          icon={User}
        />
      ) : (
        <div
          className="
            overflow-hidden
            rounded-3xl
            border
            border-border
            bg-surface/80
            backdrop-blur-xl
          "
        >
          <div className="divide-y divide-border/50">
            {users.map((user) => (
              <div
                key={user._id}
                onClick={() => navigate(`/admin/users/${user._id}`)}
                className="
                  group
                  flex
                  cursor-pointer
                  items-center
                  justify-between
                  gap-4
                  p-5
                  transition
                  hover:bg-surface-secondary/50
                "
              >
                {/* User Info */}
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-border
                      bg-primary/10
                      text-primary
                    "
                  >
                    {user.role === "organizer" ? (
                      <Building2 size={20} />
                    ) : user.role === "admin" ? (
                      <ShieldCheck size={20} />
                    ) : (
                      <User size={20} />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="
                          truncate
                          text-sm
                          font-extrabold
                          text-text
                          transition
                          group-hover:text-primary
                        "
                      >
                        {user.fullName}
                      </h3>

                      <StatusBadge status={user.role} />
                    </div>

                    <p className="truncate text-xs text-text-muted">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                  <StatusBadge
                    status={user.status === "blocked" ? "blocked" : "active"}
                  />

                  <ChevronRight
                    size={18}
                    className="
                      text-text-muted
                      transition
                      group-hover:translate-x-1
                      group-hover:text-text
                    "
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={(newPage) => {
            setPage(newPage);
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        />
      )}
    </div>
  );
};

export default ManageUsers;
