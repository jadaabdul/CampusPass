// Date and currency formatting utilities


export const formatDate = (
  dateString,
  options = {}
) => {

  if (!dateString) return "TBD";


  const date = new Date(dateString);


  if (isNaN(date.getTime())) {
    return "TBD";
  }


  const defaultOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  };


  return new Intl.DateTimeFormat(
    "en-US",
    defaultOptions
  ).format(date);

};




export const formatTime = (dateString) => {

  if (!dateString) return "";


  const date = new Date(dateString);


  if (isNaN(date.getTime())) {
    return "";
  }


  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );

};





export const formatCurrency = (amount) => {

  const num = Number(amount) || 0;


  if (num === 0) {
    return "Free";
  }


  return `₹${num.toLocaleString("en-IN")}`;

};





export const getInitials = (name) => {

  if (!name) {
    return "CP";
  }


  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .substring(0,2)
    .toUpperCase();

};






export const getStatusStyle = (status) => {

  const normalized =
    (status || "")
      .toLowerCase()
      .trim();



  switch(normalized){


    // Success
    case "published":
    case "active":
    case "confirmed":
    case "approved":
    case "paid":

      return `
        bg-emerald-500/10
        text-emerald-500
        border-emerald-500/20
      `;



    // Warning
    case "draft":
    case "pending":

      return `
        bg-amber-500/10
        text-amber-500
        border-amber-500/20
      `;



    // Danger
    case "cancelled":
    case "rejected":
    case "blocked":
    case "failed":

      return `
        bg-rose-500/10
        text-rose-500
        border-rose-500/20
      `;



    // Information
    case "completed":

      return `
        bg-blue-500/10
        text-blue-500
        border-blue-500/20
      `;



    // Sold out / expired
    case "sold_out":
    case "expired":

      return `
        bg-orange-500/10
        text-orange-500
        border-orange-500/20
      `;



    // Inactive / default
    case "inactive":

      return `
        bg-gray-500/10
        text-gray-500
        border-gray-500/20
      `;



    default:

      return `
        bg-primary/10
        text-primary
        border-primary/20
      `;

  }

};