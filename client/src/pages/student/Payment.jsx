import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { CheckCircle2, ShieldCheck, CreditCard, Lock, Sparkles, Ticket } from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";

import PageHeader from "../../components/PageHeader";

import { formatCurrency } from "../../utils/formatters";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

const Payment = () => {
  const { bookingId } = useParams();

  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);

  const [loading, setLoading] = useState(true);

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);

        const data = res.data.data;

        if (data.paymentStatus === "paid") {
          navigate(`/ticket/${bookingId}`, {
            replace: true,
          });

          return;
        }

        setBooking(data);
      } catch (error) {
        toast.error("Unable to load booking");

        navigate("/bookings", {
          replace: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const startPayment = async () => {
    try {
      setProcessing(true);

      const loaded = await loadRazorpay();

      if (!loaded) throw new Error("Payment gateway failed to load");

      const orderResponse = await api.post("/payments/create-order", {
        bookingId,
      });

      const order = orderResponse.data.data;

      const key = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!key) throw new Error("Payment configuration missing");

      const event = booking.eventId || {};

      const options = {
        key,

        amount: order.amount,

        currency: order.currency,

        name: "CampusPass",

        description: event.title || "Campus Event Ticket",

        order_id: order.id,

        handler: async (response) => {
          try {
            await api.post("/payments/verify", response);

            toast.success("Payment successful! Ticket generated.");

            navigate(`/ticket/${bookingId}`, {
              replace: true,
            });
          } catch (error) {
            toast.error(error.response?.data?.message || "Payment verification failed");
          } finally {
            setProcessing(false);
          }
        },

        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },

        theme: {
          color: "#22c55e",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Payment failed");

      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div
        className="
      flex
      min-h-[400px]
      items-center
      justify-center
      "
      >
        <div
          className="
        flex
        flex-col
        items-center
        gap-4
        "
        >
          <div
            className="
          h-12
          w-12
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
            Loading secure checkout...
          </p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const event = booking.eventId || {};

  const amount = booking.totalAmount || 0;

  return (
    <div
      className="
    mx-auto
    max-w-5xl
    space-y-8
    "
    >
      <PageHeader
        breadcrumb="SECURE CHECKOUT"
        title="Complete Your Payment"
        subtitle="
        Your event pass will be generated instantly after successful payment.
        "
      />

      <div
        className="
      grid
      gap-8
      lg:grid-cols-5
      "
      >
        {/* Security Section */}

        <section
          className="
        lg:col-span-3
        rounded-3xl
        border
        border-border
        bg-surface
        p-8
        space-y-6
        "
        >
          <div
            className="
          flex
          items-center
          gap-3
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
              <Lock size={22} />
            </div>

            <div>
              <h3
                className="
              text-xl
              font-black
              text-text
              "
              >
                Secure Payment
              </h3>

              <p
                className="
              text-xs
              text-text-muted
              "
              >
                Protected checkout powered by Razorpay
              </p>
            </div>
          </div>

          <div
            className="
          grid
          sm:grid-cols-2
          gap-4
          "
          >
            {[
              {
                icon: ShieldCheck,
                title: "Encrypted",
                text: "Your payment data stays protected",
              },

              {
                icon: CreditCard,
                title: "Multiple Options",
                text: "UPI, Cards, Wallets & Net Banking",
              },

              {
                icon: Ticket,
                title: "Instant Ticket",
                text: "QR pass after confirmation",
              },

              {
                icon: Sparkles,
                title: "Easy Experience",
                text: "Fast and reliable checkout",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  p-4
                  "
                >
                  <Icon size={20} className="text-primary" />

                  <p
                    className="
                    mt-3
                    text-sm
                    font-black
                    text-text
                    "
                  >
                    {item.title}
                  </p>

                  <p
                    className="
                    mt-1
                    text-xs
                    text-text-muted
                    "
                  >
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Summary */}

        <aside
          className="
        lg:col-span-2
        rounded-3xl
        border
        border-border
        bg-surface
        p-7
        space-y-6
        "
        >
          <h3
            className="
          text-xl
          font-black
          text-text
          "
          >
            Order Summary
          </h3>

          <div
            className="
          rounded-2xl
          border
          border-border
          bg-background
          p-5
          "
          >
            <p
              className="
            font-black
            text-text
            "
            >
              {event.title || "Campus Event"}
            </p>

            <p
              className="
            mt-2
            text-xs
            text-text-muted
            "
            >
              {booking.quantity || 1} Ticket(s)
            </p>
          </div>

          <div
            className="
          flex
          justify-between
          border-t
          border-border
          pt-5
          "
          >
            <span
              className="
            font-bold
            text-text-muted
            "
            >
              Total
            </span>

            <span
              className="
            text-xl
            font-black
            text-primary
            "
            >
              {formatCurrency(amount)}
            </span>
          </div>

          <button
            onClick={startPayment}
            disabled={processing}
            className="
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-2xl
          bg-primary
          py-4
          text-sm
          font-black
          text-background
          shadow-lg
          shadow-primary/20
          transition
          hover:scale-[1.02]
          disabled:opacity-50
          "
          >
            <CheckCircle2 size={18} />

            {processing ? "Opening Payment..." : `Pay ${formatCurrency(amount)}`}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Payment;
