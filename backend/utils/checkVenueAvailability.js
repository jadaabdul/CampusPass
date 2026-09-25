const Event = require("../models/Event");

/**
 * Check if a venue is available for a given time range.
 *
 * @param {string} venueId - The venue ID to check
 * @param {Date|string} startDate - Event start date
 * @param {string} startTime - Event start time (HH:MM) or ""
 * @param {Date|string} endDate - Event end date
 * @param {string} endTime - Event end time (HH:MM) or ""
 * @param {string|null} excludeEventId - Exclude this event from the check (for updates)
 * @returns {Promise<{available: boolean, conflictingEvent?: object}>}
 */
const checkVenueAvailability = async (
  venueId,
  startDate,
  startTime,
  endDate,
  endTime,
  excludeEventId = null
) => {
  // Build datetime objects combining date + time for precision
  const buildDateTime = (date, time) => {
    const d = new Date(date);
    if (time && /^\d{2}:\d{2}$/.test(time)) {
      const [hours, minutes] = time.split(":").map(Number);
      d.setHours(hours, minutes, 0, 0);
    } else {
      // No time provided — use start/end of day for safe checking
      d.setHours(0, 0, 0, 0);
    }
    return d;
  };

  const reqStart = buildDateTime(startDate, startTime);
  const reqEnd = buildDateTime(endDate, endTime || "23:59");

  const filter = {
    venue: venueId,
    status: { $in: ["pending", "approved"] },
  };

  if (excludeEventId) {
    filter._id = { $ne: excludeEventId };
  }

  // Find all events at this venue that could possibly overlap
  const existingEvents = await Event.find(filter).select(
    "title startDate endDate startTime endTime"
  );

  for (const evt of existingEvents) {
    const evtStart = buildDateTime(evt.startDate, evt.startTime);
    const evtEnd = buildDateTime(evt.endDate, evt.endTime || "23:59");

    // Overlap condition: two intervals [a,b] and [c,d] overlap if a < d && c < b
    const overlaps = reqStart < evtEnd && evtStart < reqEnd;

    if (overlaps) {
      return { available: false, conflictingEvent: evt };
    }
  }

  return { available: true };
};

module.exports = checkVenueAvailability;
