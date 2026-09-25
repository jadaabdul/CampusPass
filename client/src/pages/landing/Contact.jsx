import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

import InputField from "../../components/InputField";
import Button from "../../components/Button";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const api = (await import("../../api/axios")).default;
      const res = await api.post("/contact", formData);
      if (res.data.success) {
        toast.success("Thank you! Your message has been received.");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      value: "chandan7953@gmail.com",
    },
    {
      icon: Phone,
      title: "Phone Line",
      value: "+91 98765 43210",
    },
    {
      icon: MapPin,
      title: "HQ Address",
      value: "Sunbeam Institute of Information Technology, Hinjewadi, Pune, Maharashtra",
    },
    {
      icon: Clock,
      title: "Operating Hours",
      value: "Mon – Fri: 9:00 AM – 6:00 PM IST",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text">
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary">
            Get In Touch
          </span>

          <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">
            Contact <span className="text-primary">CampusPass Support</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-text-muted">
            Have questions about event registration, organizer verification, or ticket passes? We're here to help.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold">Reach Out Directly</h2>

            <p className="mt-3 text-sm leading-7 text-text-muted">
              Our campus support team is available during working hours to assist students, organizers, and campus
              administrators.
            </p>
          </div>

          <div className="space-y-5">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-text-muted">{item.title}</p>

                    <p className="mt-1 text-sm font-bold">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-8 shadow-md">
          <h2 className="text-2xl font-bold">Send Us a Message</h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <InputField
              label="Your Full Name *"
              name="name"
              placeholder="Aman Singh"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
            />

            <InputField
              label="Email Address *"
              name="email"
              type="email"
              placeholder="aman@gmail.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
            />

            <InputField
              label="Subject"
              name="subject"
              placeholder="Inquiry about organizer access"
              value={formData.subject}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  subject: e.target.value,
                })
              }
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-text">Message *</label>

              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    message: e.target.value,
                  })
                }
                placeholder="Type your message here..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="gap-2 bg-primary text-white shadow-lg shadow-primary/20 hover:-translate-y-1 hover:shadow-xl"
            >
              <Send size={16} />
              Submit Message
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Contact;
