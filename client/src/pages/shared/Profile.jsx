import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  KeyRound,
  Save,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Camera,
  ShieldCheck,
  CalendarDays,
  Ticket,
  Edit3,
  Loader2,
} from "lucide-react";

import toast from "react-hot-toast";
import api from "../../api/axios";

import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";

import { loginSuccess } from "../../redux/authSlice";

import { getInitials } from "../../utils/formatters";

import { useTheme } from "../../utils/ThemeContext";

const Profile = () => {
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);

  const { isDark, toggleTheme } = useTheme();

  const avatarInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [imgError, setImgError] = useState(false);

  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({ eventsCount: 0, ticketsCount: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === "student") {
          const res = await api.get("/users/bookings");
          const bookings = res.data.data || [];
          setStats({
            eventsCount: new Set(
              bookings.map((b) => b.eventId?._id || b.eventId)
            ).size,
            ticketsCount: bookings.reduce(
              (sum, b) => sum + (b.seatsCount || b.quantity || 1),
              0
            ),
          });
        } else if (user?.role === "organizer") {
          const res = await api.get("/events/organizer/my-events");
          const events = res.data.data || [];
          setStats({
            eventsCount: events.length,
            ticketsCount: events.reduce(
              (sum, e) => sum + (e.bookedSeats || 0),
              0
            ),
          });
        } else if (user?.role === "admin") {
          const res = await api.get("/events/admin/all");
          const events = res.data.data || [];
          setStats({
            eventsCount: events.length,
            ticketsCount: events.reduce(
              (sum, e) => sum + (e.bookedSeats || 0),
              0
            ),
          });
        }
      } catch {
        // Fallback silently if stats endpoint fails
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const getImageUrl = (imageData) => {
    if (!imageData) return "";
    if (typeof imageData === "string") {
      if (
        imageData.startsWith("http://") ||
        imageData.startsWith("https://") ||
        imageData.startsWith("blob:")
      ) {
        return imageData;
      }
      return `${api.defaults.baseURL}/${imageData.replace(/^\//, "")}`;
    }
    if (typeof imageData === "object") {
      if (imageData.url) return getImageUrl(imageData.url);
      if (imageData.secure_url) return imageData.secure_url;
      if (imageData.path) return getImageUrl(imageData.path);
    }
    return "";
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP)");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      e.target.value = "";
      return;
    }

    try {
      setUploadingAvatar(true);
      setImgError(false);

      const formData = new FormData();
      formData.append("profileImage", file);

      const res = await api.patch("/users/profile-image", formData);
      const updatedUser = res.data.data;

      dispatch(
        loginSuccess({
          token,
          user: updatedUser,
        })
      );

      toast.success("Profile picture updated successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update profile picture"
      );
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };



  const [profileForm,setProfileForm] = useState({

    fullName:
      user?.fullName || "",

    mobile:
      user?.mobile || "",

  });



  const [passwordForm,setPasswordForm] =
  useState({

    currentPassword:"",

    newPassword:"",

  });



  const [showPassword,setShowPassword] =
  useState({

    current:false,

    new:false,

  });



  const passwordStrength =
  passwordForm.newPassword.length === 0
  ? ""
  :
  passwordForm.newPassword.length < 6
  ? "Weak"
  :
  passwordForm.newPassword.length < 10
  ? "Medium"
  :
  "Strong";



  const handleProfileSubmit =
  async(e)=>{

    e.preventDefault();


    try{

      setSaving(true);


      const res =
      await api.put(
        "/users/profile",
        profileForm
      );


      const updatedUser =
      res.data.data;


      dispatch(
        loginSuccess({
          token,
          user:updatedUser,
        })
      );


      toast.success(
        "Profile updated successfully"
      );


      setEditing(false);


    }
    catch(error){

      toast.error(
        error.response?.data?.message ||
        "Profile update failed"
      );

    }
    finally{

      setSaving(false);

    }

  };



  const handlePasswordSubmit =
  async(e)=>{

    e.preventDefault();


    if(
      !passwordForm.currentPassword ||
      !passwordForm.newPassword
    ){

      toast.error(
        "Enter both passwords"
      );

      return;

    }



    try{

      setSaving(true);


      await api.put(
        "/users/change-password",
        passwordForm
      );


      toast.success(
        "Password changed successfully"
      );


      setPasswordForm({

        currentPassword:"",
        newPassword:"",

      });


    }
    catch(error){

      toast.error(
        error.response?.data?.message ||
        "Password update failed"
      );

    }
    finally{

      setSaving(false);

    }

  };



  const initials =
  getInitials(
    user?.fullName
  );



  return (

    <div className="space-y-8 max-w-5xl mx-auto">


      <PageHeader

        breadcrumb="ACCOUNT SETTINGS"

        title="My Profile"

        subtitle=
        "Manage your identity, security and preferences."

      />


      {/* Profile Banner */}

      <div className="
        rounded-3xl
        border
        border-border
        bg-surface
        p-8
        relative
        overflow-hidden
      ">


        <div className="
          flex
          flex-col
          md:flex-row
          items-center
          gap-6
        ">


          {/* Avatar */}
          <div className="relative group">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />

            <div
              onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
              className="
                h-28
                w-28
                cursor-pointer
                overflow-hidden
                rounded-3xl
                bg-primary
                flex
                items-center
                justify-center
                text-4xl
                font-black
                text-background
                shadow-xl
                relative
                transition
                hover:opacity-90
              "
            >
              {user?.profileImage && !imgError ? (
                <img
                  src={getImageUrl(user.profileImage)}
                  alt={user?.fullName || "User Avatar"}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}

              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => !uploadingAvatar && avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="
                absolute
                bottom-0
                right-0
                h-9
                w-9
                rounded-xl
                bg-background
                border
                border-border
                flex
                items-center
                justify-center
                hover:scale-110
                transition
                shadow-lg
              "
              title="Change Profile Picture"
            >
              <Camera size={16} className="text-primary" />
            </button>
          </div>



          <div className="
            flex-1
            text-center
            md:text-left
          ">


            <div className="
              flex
              justify-center
              md:justify-start
              items-center
              gap-3
              flex-wrap
            ">

              <h2 className="
                text-3xl
                font-black
                text-text
              ">
                {user?.fullName}
              </h2>


              <StatusBadge
                status={
                  user?.role ||
                  "student"
                }
              />


            </div>


            <p className="
              text-sm
              text-text-muted
              mt-2
            ">
              {user?.email}
            </p>


            <div className="
              flex
              gap-6
              justify-center
              md:justify-start
              mt-5
            ">


              <div>
                <p className="text-xl font-black text-text">
                  {stats.eventsCount}
                </p>
                <p className="text-xs text-text-muted">
                  Events
                </p>
              </div>

              <div>
                <p className="text-xl font-black text-text">
                  {stats.ticketsCount}
                </p>
                <p className="text-xs text-text-muted">
                  Tickets
                </p>
              </div>



            </div>


          </div>



          <button

            onClick={()=>setEditing(!editing)}

            className="
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-border
            px-5
            py-3
            text-sm
            font-bold
            text-text
            hover:bg-primary/10
            transition
            "

          >

            <Edit3 size={16}/>

            {
              editing
              ?
              "Cancel"
              :
              "Edit Profile"
            }


          </button>


        </div>


      </div>
            {/* Main Content Grid */}

      <div className="grid gap-8 lg:grid-cols-2">


        {/* Personal Information */}

        <div className="
          rounded-3xl
          border
          border-border
          bg-surface
          p-6
          space-y-6
        ">


          <h3 className="
            flex
            items-center
            gap-2
            text-lg
            font-black
            text-text
            border-b
            border-border
            pb-4
          ">

            <User
              size={20}
              className="text-primary"
            />

            Personal Information

          </h3>



          <form
            onSubmit={handleProfileSubmit}
            className="space-y-5"
          >



            {/* Full Name */}

            <div>

              <label className="
                text-xs
                font-bold
                text-text-muted
              ">
                Full Name
              </label>


              <input

                disabled={!editing}

                value={
                  profileForm.fullName
                }

                onChange={(e)=>
                  setProfileForm({

                    ...profileForm,

                    fullName:e.target.value

                  })
                }


                className="
                mt-2
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
                focus:border-primary
                disabled:opacity-60
                transition
                "

              />

            </div>



            {/* Email */}

            <div>


              <label className="
                text-xs
                font-bold
                text-text-muted
              ">
                Email Address
              </label>



              <input

                disabled

                value={
                  user?.email || ""
                }

                className="
                mt-2
                w-full
                rounded-2xl
                border
                border-border
                bg-background
                px-4
                py-3
                text-sm
                text-text-muted
                opacity-60
                "

              />

            </div>




            {/* Mobile */}

            <div>


              <label className="
                text-xs
                font-bold
                text-text-muted
              ">
                Mobile Number
              </label>



              <input


                disabled={!editing}


                value={
                  profileForm.mobile
                }


                onChange={(e)=>
                  setProfileForm({

                    ...profileForm,

                    mobile:e.target.value

                  })
                }


                placeholder="Enter mobile number"


                className="
                mt-2
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
                focus:border-primary
                disabled:opacity-60
                "

              />


            </div>




            {
              editing &&

              <button

                disabled={saving}

                className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-primary
                py-3
                text-sm
                font-black
                text-background
                hover:opacity-90
                transition
                disabled:opacity-50
                "

              >

                <Save size={18}/>

                {
                  saving
                  ?
                  "Saving..."
                  :
                  "Save Profile"
                }


              </button>

            }


          </form>


        </div>





        {/* Right Side */}

        <div className="space-y-8">



          {/* Appearance */}


          <div className="
            rounded-3xl
            border
            border-border
            bg-surface
            p-6
            space-y-6
          ">


            <h3 className="
              flex
              items-center
              gap-2
              text-lg
              font-black
              text-text
              border-b
              border-border
              pb-4
            ">


              {
                isDark

                ?

                <Moon
                  size={20}
                  className="text-primary"
                />

                :

                <Sun
                  size={20}
                  className="text-primary"
                />

              }


              Appearance


            </h3>



            <div className="
              flex
              items-center
              justify-between
            ">


              <div>

                <p className="
                  font-bold
                  text-text
                ">
                  Dark Mode
                </p>


                <p className="
                  text-xs
                  text-text-muted
                ">
                  Customize application theme
                </p>


              </div>




              <button

                onClick={toggleTheme}

                className={`
                  h-7
                  w-14
                  rounded-full
                  p-1
                  transition
                  ${
                    isDark
                    ?
                    "bg-primary"
                    :
                    "bg-gray-400"
                  }
                `}

              >


                <div

                  className={`
                    h-5
                    w-5
                    rounded-full
                    bg-background
                    shadow
                    transition
                    ${
                      isDark
                      ?
                      "translate-x-7"
                      :
                      "translate-x-0"
                    }
                  `}

                />

              </button>


            </div>


          </div>





          {/* Account Status */}


          <div className="
            rounded-3xl
            border
            border-border
            bg-surface
            p-6
          ">


            <h3 className="
              flex
              items-center
              gap-2
              text-lg
              font-black
              text-text
              mb-5
            ">


              <ShieldCheck
                size={20}
                className="text-primary"
              />

              Account Security


            </h3>



            <div className="
              space-y-4
            ">


              <div className="
                flex
                items-center
                justify-between
                rounded-2xl
                bg-background
                p-4
              ">


                <span className="
                  text-sm
                  text-text-muted
                ">
                  Verification
                </span>


                <span className="
                  text-sm
                  font-bold
                  text-green-500
                ">
                  Verified
                </span>


              </div>



              <div className="
                flex
                items-center
                justify-between
                rounded-2xl
                bg-background
                p-4
              ">


                <span className="
                  text-sm
                  text-text-muted
                ">
                  Account Type
                </span>


                <span className="
                  text-sm
                  font-bold
                  text-text
                ">
                  {user?.role}
                </span>


              </div>


            </div>


          </div>

                {/* Change Password */}

          <div className="
            rounded-3xl
            border
            border-border
            bg-surface
            p-6
            space-y-6
          ">


            <h3 className="
              flex
              items-center
              gap-2
              text-lg
              font-black
              text-text
              border-b
              border-border
              pb-4
            ">

              <KeyRound
                size={20}
                className="text-primary"
              />

              Change Password

            </h3>



            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-5"
            >



              {/* Current Password */}

              <div className="relative">

                <label className="
                  text-xs
                  font-bold
                  text-text-muted
                ">
                  Current Password
                </label>


                <input

                  type={
                    showPassword.current
                    ?
                    "text"
                    :
                    "password"
                  }


                  value={
                    passwordForm.currentPassword
                  }


                  onChange={(e)=>
                    setPasswordForm({

                      ...passwordForm,

                      currentPassword:e.target.value

                    })
                  }


                  placeholder="Enter current password"


                  className="
                  mt-2
                  w-full
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  px-4
                  py-3
                  pr-12
                  text-sm
                  text-text
                  outline-none
                  focus:border-primary
                  "

                />



                <button

                  type="button"

                  onClick={()=>
                    setShowPassword({

                      ...showPassword,

                      current:
                      !showPassword.current

                    })
                  }


                  className="
                  absolute
                  right-4
                  bottom-3
                  text-text-muted
                  hover:text-primary
                  "

                >

                  {
                    showPassword.current

                    ?

                    <EyeOff size={18}/>

                    :

                    <Eye size={18}/>

                  }

                </button>


              </div>





              {/* New Password */}

              <div className="relative">


                <label className="
                  text-xs
                  font-bold
                  text-text-muted
                ">
                  New Password
                </label>



                <input


                  type={
                    showPassword.new
                    ?
                    "text"
                    :
                    "password"
                  }


                  value={
                    passwordForm.newPassword
                  }


                  onChange={(e)=>
                    setPasswordForm({

                      ...passwordForm,

                      newPassword:e.target.value

                    })
                  }



                  placeholder="Create new password"


                  className="
                  mt-2
                  w-full
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  px-4
                  py-3
                  pr-12
                  text-sm
                  text-text
                  outline-none
                  focus:border-primary
                  "

                />



                <button

                  type="button"

                  onClick={()=>
                    setShowPassword({

                      ...showPassword,

                      new:
                      !showPassword.new

                    })
                  }


                  className="
                  absolute
                  right-4
                  bottom-3
                  text-text-muted
                  hover:text-primary
                  "

                >

                  {
                    showPassword.new

                    ?

                    <EyeOff size={18}/>

                    :

                    <Eye size={18}/>

                  }


                </button>



              </div>





              {/* Password Strength */}


              {
                passwordStrength &&

                <div className="space-y-2">


                  <div className="
                    flex
                    justify-between
                    text-xs
                    font-bold
                  ">


                    <span className="text-text-muted">
                      Password Strength
                    </span>


                    <span

                      className={`
                      ${
                        passwordStrength==="Weak"
                        &&
                        "text-red-500"
                      }

                      ${
                        passwordStrength==="Medium"
                        &&
                        "text-yellow-500"
                      }

                      ${
                        passwordStrength==="Strong"
                        &&
                        "text-green-500"
                      }
                      `}

                    >

                      {passwordStrength}

                    </span>


                  </div>




                  <div className="
                    h-2
                    rounded-full
                    bg-background
                    overflow-hidden
                  ">


                    <div

                      className={`
                        h-full
                        transition-all
                        ${
                          passwordStrength==="Weak"
                          &&
                          "w-1/3 bg-red-500"
                        }

                        ${
                          passwordStrength==="Medium"
                          &&
                          "w-2/3 bg-yellow-500"
                        }

                        ${
                          passwordStrength==="Strong"
                          &&
                          "w-full bg-green-500"
                        }
                      `}

                    />

                  </div>


                </div>

              }




              <button

                disabled={saving}

                className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-primary
                py-3
                text-sm
                font-black
                text-primary
                hover:bg-primary/10
                transition
                disabled:opacity-50
                "

              >

                <KeyRound size={18}/>

                {
                  saving
                  ?
                  "Updating..."
                  :
                  "Update Password"
                }


              </button>



            </form>


          </div>



        </div>


      </div>





      {/* Activity Overview */}


      <div className="
        rounded-3xl
        border
        border-border
        bg-surface
        p-6
      ">


        <h3 className="
          text-xl
          font-black
          text-text
          mb-6
        ">

          Account Activity

        </h3>




        <div className="
          grid
          gap-5
          sm:grid-cols-3
        ">


          <div className="rounded-2xl bg-background p-5">
            <CalendarDays className="text-primary mb-3" />
            <p className="text-2xl font-black text-text">
              {stats.eventsCount}
            </p>
            <p className="text-xs text-text-muted">
              {user?.role === "organizer"
                ? "Events Created"
                : user?.role === "admin"
                ? "Total Events"
                : "Events Joined"}
            </p>
          </div>

          <div className="rounded-2xl bg-background p-5">
            <Ticket className="text-primary mb-3" />
            <p className="text-2xl font-black text-text">
              {stats.ticketsCount}
            </p>
            <p className="text-xs text-text-muted">
              {user?.role === "organizer"
                ? "Tickets Sold"
                : user?.role === "admin"
                ? "Total Bookings"
                : "Tickets Purchased"}
            </p>
          </div>

          <div className="rounded-2xl bg-background p-5">
            <ShieldCheck className="text-primary mb-3" />
            <p className="text-2xl font-black text-text capitalize">
              {user?.status || "Active"}
            </p>
            <p className="text-xs text-text-muted">
              Account Status
            </p>
          </div>



        </div>


      </div>


    </div>

  );

};


export default Profile;