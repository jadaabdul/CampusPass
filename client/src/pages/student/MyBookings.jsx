import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Calendar,
  Ticket,
  MapPin,
  QrCode,
  CreditCard,
  XCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";

import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";

import {
  formatDate,
  formatCurrency,
} from "../../utils/formatters";



const MyBookings = () => {


  const navigate = useNavigate();



  const [loading,setLoading] = useState(true);


  const [bookings,setBookings] = useState([]);



  const [activeTab,setActiveTab] = useState("all");




  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await api.get("/bookings/my-bookings");
        setBookings(res.data.data || []);
      } catch (_error) {
        toast.error("Failed to load your bookings");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);





  const filteredBookings = bookings.filter(
    (booking)=>{


      if(activeTab==="all")
        return true;


      return (
        booking.bookingStatus
        ?.toLowerCase()
        === activeTab
      );


    }
  );






  const counts = bookings.reduce(
    (acc,item)=>{


      const status =
      item.bookingStatus
      ?.toLowerCase()
      ||
      "pending";


      acc[status] =
      (acc[status] || 0)+1;


      return acc;


    },
    {}
  );







  const stats = [

    {
      title:"Total Passes",
      value:bookings.length,
      icon:Ticket
    },


    {
      title:"Confirmed",
      value:counts.confirmed || 0,
      icon:CheckCircle
    },


    {
      title:"Pending",
      value:counts.pending || 0,
      icon:Clock
    },


    {
      title:"Cancelled",
      value:counts.cancelled || 0,
      icon:XCircle
    }


  ];





  return (

    <div className="space-y-8">





      <PageHeader

        breadcrumb="MY EXPERIENCE"

        title="My Bookings & Passes"

        subtitle="
        Manage your event reservations,
        payments and digital QR tickets.
        "

      />







      {/* Stats */}


      <div
      className="
      grid
      grid-cols-2
      lg:grid-cols-4
      gap-5
      "
      >


      {
        stats.map((item)=>{


          const Icon=item.icon;


          return(

            <div

            key={item.title}

            className="
            rounded-3xl
            border
            border-border
            bg-surface
            p-5
            transition
            hover:-translate-y-1
            hover:border-primary/40
            "

            >


              <div
              className="
              flex
              items-center
              justify-between
              "
              >


                <div
                className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-primary/10
                text-primary
                "
                >

                  <Icon size={22}/>

                </div>


              </div>




              <p
              className="
              mt-4
              text-3xl
              font-black
              text-text
              "
              >

                {item.value}

              </p>



              <p
              className="
              text-xs
              font-semibold
              text-text-muted
              "
              >

                {item.title}

              </p>



            </div>


          );


        })

      }


      </div>









      {/* Tabs */}


      <div
      className="
      flex
      gap-3
      overflow-x-auto
      pb-2
      "
      >


      {
        [

          {
            key:"all",
            label:`All (${bookings.length})`
          },

          {
            key:"pending",
            label:`Pending (${counts.pending || 0})`
          },


          {
            key:"confirmed",
            label:`Confirmed (${counts.confirmed || 0})`
          },


          {
            key:"cancelled",
            label:`Cancelled (${counts.cancelled || 0})`
          }


        ].map(tab=>(


          <button

          key={tab.key}

          onClick={()=>
            setActiveTab(tab.key)
          }


          className={`
            whitespace-nowrap
            rounded-2xl
            px-5
            py-3
            text-xs
            font-black
            transition
            ${
              activeTab === tab.key
                ? "bg-primary text-background shadow-lg shadow-primary/20"
                : "border border-border bg-surface text-text-muted hover:text-text"
            }
          `}

          >

            {tab.label}


          </button>



        ))

      }


      </div>









      {
        loading ?


        (

          <div
          className="
          grid
          md:grid-cols-2
          gap-6
          "
          >

          {
            [1,2].map(i=>(

              <div

              key={i}

              className="
              h-56
              rounded-3xl
              bg-surface
              border
              border-border
              animate-pulse
              "

              />

            ))
          }


          </div>


        )



        :



        filteredBookings.length===0



        ?


        (

          <EmptyState

          title="No Bookings Found"

          description="
          You have not booked any campus events yet.
          Explore events and reserve your pass.
          "

          icon={Ticket}


          action={

            <button

            onClick={()=>
              navigate("/browse")
            }

            className="
            rounded-2xl
            bg-primary
            px-6
            py-3
            text-xs
            font-black
            text-background
            "

            >

              Explore Events

            </button>

          }

          />


        )



        :



        (

          <div
          className="
          grid
          md:grid-cols-2
          gap-6
          "
          >



          {
            filteredBookings.map(
              (booking)=>{


              const event =
              booking.eventId || {};



              const paid =
              booking.paymentStatus==="paid";


              const status =
              booking.bookingStatus;



              return(


              <div

              key={
                booking._id ||
                booking.id
              }


              className="
              group
              rounded-3xl
              border
              border-border
              bg-surface
              p-6
              transition
              hover:-translate-y-1
              hover:border-primary/40
              "

              >





                <div
                className="
                flex
                justify-between
                gap-4
                "
                >


                  <div>

                    <StatusBadge
                    status={status || "pending"}
                    />


                    <h3
                    className="
                    mt-3
                    text-lg
                    font-black
                    text-text
                    "
                    >

                    {event.title || "Campus Event"}

                    </h3>


                  </div>



                  <div
                  className="
                  rounded-xl
                  bg-primary/10
                  px-3
                  py-2
                  text-xs
                  font-black
                  text-primary
                  "
                  >

                    {booking.quantity || 1}
                    {" "}
                    Seat

                  </div>


                </div>







                <div
                className="
                my-5
                space-y-3
                border-y
                border-border
                py-4
                text-sm
                text-text-muted
                "
                >


                  <p className="flex gap-2">

                    <Calendar
                    size={16}
                    className="text-primary"
                    />

                    {formatDate(event.startDate)}

                  </p>




                  <p className="flex gap-2">

                    <MapPin
                    size={16}
                    className="text-primary"
                    />

                    {event.venue?.name ||
                    "Campus Venue"}

                  </p>



                </div>







                <div
                className="
                flex
                items-center
                justify-between
                "
                >



                  <div>

                    <p
                    className="
                    text-[10px]
                    uppercase
                    text-text-muted
                    "
                    >

                      Amount

                    </p>


                    <p
                    className="
                    font-black
                    text-text
                    "
                    >

                    {formatCurrency(
                      booking.totalAmount ||
                      event.price ||
                      0
                    )}

                    </p>


                  </div>






                  {
                    status==="confirmed"
                    &&
                    paid


                    ?


                    (

                    <button

                    onClick={()=>
                      navigate(
                      `/ticket/${booking._id}`
                      )
                    }


                    className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    bg-primary
                    px-5
                    py-3
                    text-xs
                    font-black
                    text-background
                    "

                    >

                      <QrCode size={16}/>

                      QR Pass

                    </button>

                    )



                    :



                    status==="pending"


                    ?


                    (

                    <button

                    onClick={()=>
                      navigate(
                      `/payment/${booking._id}`
                      )
                    }


                    className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    bg-primary
                    px-5
                    py-3
                    text-xs
                    font-black
                    text-background
                    "

                    >

                      <CreditCard size={16}/>

                      Pay Now

                    </button>

                    )



                    :



                    (

                    <span
                    className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-red-500/30
                    bg-red-500/10
                    px-4
                    py-3
                    text-xs
                    font-bold
                    text-red-400
                    "
                    >

                      <XCircle size={15}/>

                      Cancelled

                    </span>

                    )


                  }





                </div>





              </div>



              )


              }

            )

          }



          </div>


        )

      }




    </div>

  );

};


export default MyBookings;