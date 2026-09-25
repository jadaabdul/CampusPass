import { useEffect, useState } from "react";

import { Building2, MapPin, Users, Plus, ArrowLeft } from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import toast from "react-hot-toast";

import api from "../../api/axios";

const CreateVenue = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    collegeName: "",
    capacity: "",
    facilities: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (isEditMode) {
      fetchVenue();
    }
  }, [id]);

  const fetchVenue = async () => {
    try {
      const res = await api.get(`/venues/${id}`);

      const venue = res.data.data;

      setFormData({
        name: venue.name || "",

        address: venue.address || "",

        collegeName: venue.collegeName || "",

        capacity: venue.capacity || "",

        facilities: venue.facilities ? venue.facilities.join(", ") : "",

        latitude: venue.latitude || "",

        longitude: venue.longitude || "",
      });
    } catch (error) {
      toast.error("Failed to load venue");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = {
        name: formData.name,

        address: formData.address,

        collegeName: formData.collegeName,

        capacity: Number(formData.capacity),

        facilities: formData.facilities
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),

        latitude: formData.latitude ? Number(formData.latitude) : undefined,

        longitude: formData.longitude ? Number(formData.longitude) : undefined,
      };

      if (isEditMode) {
        await api.put(`/venues/${id}`, data);

        toast.success("Venue updated successfully");
      } else {
        await api.post("/venues", data);

        toast.success("Venue created successfully");
      }

      navigate("/admin/venues");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
mx-auto
max-w-3xl
space-y-8
"
    >
      <button
        onClick={() => navigate(-1)}
        className="
flex
items-center
gap-2
rounded-2xl
border
border-border
bg-surface
px-4
py-2
text-sm
font-semibold
text-text-muted
hover:text-text
hover:bg-primary/10
transition
"
      >
        <ArrowLeft size={17} />
        Back
      </button>

      <div
        className="
flex
items-center
gap-4
"
      >
        <div
          className="
flex
h-12
w-12
items-center
justify-center
rounded-2xl
bg-primary/10
text-primary
"
        >
          <Building2 size={26} />
        </div>

        <div>
          <h1
            className="
text-3xl
font-extrabold
text-text
"
          >
            {isEditMode ? "Edit Venue" : "Create Venue"}
          </h1>

          <p
            className="
text-sm
text-text-muted
"
          >
            {isEditMode ? "Update venue details" : "Add new event location"}
          </p>
        </div>
      </div>

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
"
      >
        <Input
          icon={Building2}
          label="Venue Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Main Auditorium"
        />

        <Input
          icon={Building2}
          label="College Name"
          name="collegeName"
          value={formData.collegeName}
          onChange={handleChange}
          placeholder="ABC College"
        />

        <Input
          icon={MapPin}
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Pune Maharashtra"
        />

        <Input
          icon={Users}
          label="Capacity"
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={handleChange}
          placeholder="500"
        />

        <div>
          <label
            className="
mb-2
block
text-sm
font-semibold
text-text-muted
"
          >
            Facilities
          </label>

          <input
            name="facilities"
            value={formData.facilities}
            onChange={handleChange}
            placeholder="Parking, AC, Projector"
            className="
w-full
rounded-2xl
border
border-border
bg-background
px-4
py-3
text-sm
text-text
outline-none
placeholder:text-text-muted
focus:border-primary
focus:ring-4
focus:ring-primary/20
"
          />

          <p
            className="
mt-2
text-xs
text-text-muted
"
          >
            Separate facilities using commas
          </p>
        </div>

        <div
          className="
grid
gap-5
sm:grid-cols-2
"
        >
          <Input
            label="Latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="18.5204"
          />

          <Input
            label="Longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="73.8567"
          />
        </div>

        <button
          disabled={loading}
          className="
flex
w-full
items-center
justify-center
gap-2
rounded-2xl
bg-primary
py-3.5
font-bold
text-white
shadow-lg
shadow-primary/30
transition
hover:opacity-90
disabled:opacity-50
"
        >
          <Plus size={18} />

          {loading ? "Saving..." : isEditMode ? "Update Venue" : "Create Venue"}
        </button>
      </form>
    </div>
  );
};

const Input = ({ icon: Icon, label, ...props }) => {
  return (
    <div>
      <label
        className="
mb-2
block
text-sm
font-semibold
text-text-muted
"
      >
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="
absolute
left-3
top-3.5
text-text-muted
"
          />
        )}

        <input
          {...props}
          className="
w-full
rounded-2xl
border
border-border
bg-background
px-4
py-3
pl-10
text-sm
text-text
outline-none
placeholder:text-text-muted
focus:border-primary
focus:ring-4
focus:ring-primary/20
"
        />
      </div>
    </div>
  );
};

export default CreateVenue;
