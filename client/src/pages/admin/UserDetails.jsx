import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, UserCog } from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";

import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";

const UserDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/admin/users/${id}`);

      const userData = res.data.data;

      setUser(userData);

      setRole(userData.role);
    } catch (error) {
      toast.error("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    try {
      setSaving(true);

      await api.patch(`/admin/users/${id}/role`, { role });

      toast.success("User role updated!");

      fetchUser();
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const handleBlockToggle = async () => {
    try {
      setSaving(true);

      const endpoint = user.status === "blocked" ? `/admin/users/${id}/unblock` : `/admin/users/${id}/block`;

      await api.patch(endpoint);

      toast.success(user.status === "blocked" ? "User unblocked" : "User blocked");

      fetchUser();
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="
        flex
        min-h-[400px]
        flex-col
        items-center
        justify-center
        gap-4
      "
      >
        <div
          className="
          h-10
          w-10
          animate-spin
          rounded-full
          border-4
          border-blue-500
          border-t-transparent
        "
        />

        <p
          className="
          text-sm
          font-semibold
          text-gray-400
        "
        >
          Loading User Profile...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="
      mx-auto
      max-w-4xl
      space-y-8
    "
    >
      {/* Back Button */}

      <button
        onClick={() => navigate(-1)}
        className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-white/10
          bg-white/5
          px-4
          py-2
          text-xs
          font-bold
          text-gray-300
          transition
          hover:bg-white/10
        "
      >
        <ArrowLeft size={16} />
        Back to Users List
      </button>

      <PageHeader breadcrumb="USER DETAILS" title={user.fullName} subtitle={`Account Management for ${user.email}`} />

      {/* Profile Card */}

      <div
        className="
        space-y-6
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        backdrop-blur-xl
        md:p-8
      "
      >
        <div
          className="
          flex
          flex-col
          items-center
          gap-6
          sm:flex-row
        "
        >
          <div
            className="
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-3xl
            bg-blue-600
            text-2xl
            font-black
            text-white
          "
          >
            {user.fullName?.substring(0, 2).toUpperCase()}
          </div>

          <div
            className="
            min-w-0
            flex-1
            space-y-2
            text-center
            sm:text-left
          "
          >
            <h2
              className="
              text-2xl
              font-extrabold
              text-white
            "
            >
              {user.fullName}
            </h2>

            <p
              className="
              font-mono
              text-xs
              text-gray-400
            "
            >
              {user.email}
            </p>

            <div
              className="
              flex
              justify-center
              gap-2
              pt-1
              sm:justify-start
            "
            >
              <StatusBadge status={user.role} />

              <StatusBadge status={user.status === "blocked" ? "blocked" : "active"} />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}

      <div
        className="
        space-y-6
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        backdrop-blur-xl
      "
      >
        <h3
          className="
          flex
          items-center
          gap-2
          border-b
          border-white/10
          pb-3
          text-lg
          font-bold
          text-white
        "
        >
          <UserCog
            size={18}
            className="
              text-blue-400
            "
          />
          Admin Moderation Controls
        </h3>

        <div
          className="
          grid
          gap-6
          md:grid-cols-2
        "
        >
          {/* Role */}

          <div
            className="
            space-y-3
          "
          >
            <label
              className="
              text-xs
              font-semibold
              uppercase
              text-gray-300
            "
            >
              Change Account Role
            </label>

            <div
              className="
              flex
              gap-2
            "
            >
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/20
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  focus:border-blue-500
                "
              >
                <option value="student">Student</option>

                <option value="organizer">Organizer</option>
              </select>

              <button
                onClick={handleRoleUpdate}
                disabled={saving}
                className="
                  rounded-2xl
                  bg-blue-600
                  px-5
                  text-xs
                  font-bold
                  text-white
                  hover:bg-blue-700
                  disabled:opacity-50
                "
              >
                Save
              </button>
            </div>
          </div>

          {/* Status */}

          <div
            className="
            space-y-3
          "
          >
            <label
              className="
              text-xs
              font-semibold
              uppercase
              text-gray-300
            "
            >
              Account Status Action
            </label>

            <button
              onClick={handleBlockToggle}
              disabled={saving}
              className={`
                w-full
                rounded-2xl
                py-3
                text-xs
                font-bold
                transition
                disabled:opacity-50

                ${
                  user.status === "blocked"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                }
              `}
            >
              {user.status === "blocked" ? "Unblock Account Access" : "Block User Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
