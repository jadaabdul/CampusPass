const Category = require("../models/Category");
const Venue = require("../models/Venue");
const ApiError = require("../utils/ApiError");
const apiResponse = require("../utils/apiResponse");

/**
 * Helper to call Google Gemini API with valid models
 */
const callGeminiAPI = async (systemPrompt, userPrompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in backend .env");
  }

  // Active models supported by Google Gemini API
  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-3.6-flash",
  ];

  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${systemPrompt}\n\nUser Request: ${userPrompt}`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn(`Gemini API call warning for model ${model}:`, errData.error?.message || response.statusText);
        lastError = new Error(errData.error?.message || `Gemini API error (${response.status})`);
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (err) {
      console.warn(`Gemini API fetch error for model ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to connect to Google Gemini API");
};

/**
 * Intelligent Fallback Generator - Creates clear, structured event details
 */
const smartFallbackGenerate = (promptText, categories, venues) => {
  const text = promptText.toLowerCase();

  // 1. Title Extraction
  let title = promptText.trim();
  if (title.length > 60) {
    title = title.split(/[.,\n]/)[0].trim();
  }
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // 2. Category Matching
  let selectedCategory = categories[0];
  for (const cat of categories) {
    const catName = cat.name.toLowerCase();
    if (
      text.includes(catName) ||
      (catName.includes("tech") && (text.includes("code") || text.includes("hackathon") || text.includes("ai") || text.includes("data"))) ||
      (catName.includes("music") && (text.includes("band") || text.includes("song") || text.includes("concert"))) ||
      (catName.includes("sport") && (text.includes("match") || text.includes("tournament") || text.includes("football"))) ||
      (catName.includes("art") && (text.includes("paint") || text.includes("draw") || text.includes("craft")))
    ) {
      selectedCategory = cat;
      break;
    }
  }

  // 3. Venue Matching
  let selectedVenue = venues[0];
  for (const ven of venues) {
    const venName = ven.name.toLowerCase();
    if (
      text.includes(venName) ||
      (text.includes("auditorium") && venName.includes("auditorium")) ||
      (text.includes("hall") && venName.includes("hall")) ||
      (text.includes("lab") && venName.includes("lab")) ||
      (text.includes("ground") && venName.includes("ground"))
    ) {
      selectedVenue = ven;
      break;
    }
  }

  // 4. Date calculation
  const now = new Date();
  const startDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  startDate.setHours(10, 0, 0, 0);
  const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);

  const formatDate = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // 5. Price extraction
  let price = 0;
  const priceMatch = text.match(/(?:₹|rs\.?|inr|price of)\s*(\d+)/i) || text.match(/(\d+)\s*(?:rs|inr|rupees)/i);
  if (priceMatch) {
    price = parseInt(priceMatch[1], 10);
  }

  // 6. Capacity calculation
  let capacity = Math.min(100, selectedVenue.capacity || 100);
  const capMatch = text.match(/(\d+)\s*(?:seats|students|people|attendees|capacity)/i);
  if (capMatch) {
    capacity = Math.min(parseInt(capMatch[1], 10), selectedVenue.capacity || 500);
  }

  // 7. Clear & Structured Description (No marketing fluff)
  const description = `Event Overview:
${promptText.trim()}

Key Details & Agenda:
- Event: ${title}
- Category: ${selectedCategory.name}
- Campus Venue: ${selectedVenue.name} (${selectedVenue.collegeName || "Main Campus"})
- Ticket Price: ${price > 0 ? `₹${price}` : "Free Registration"}
- Seat Capacity: ${capacity} seats available

General Instructions:
- Please bring a valid Student ID card for check-in at the venue.
- Reach the venue at least 15 minutes before the event start time.`;

  // 8. Poster Generation URL
  const seed = Math.floor(Math.random() * 1000000);
  const posterUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    `Clean minimal event poster design for ${title}, professional typography, high resolution`
  )}?width=800&height=1000&seed=${seed}&nologo=true`;

  return {
    title,
    description,
    category: selectedCategory._id.toString(),
    categoryName: selectedCategory.name,
    venue: selectedVenue._id.toString(),
    venueName: selectedVenue.name,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    capacity,
    price,
    posterUrl,
  };
};

/**
 * Auto-fill event details using Google Gemini API (with clear description emphasis & smart fallback)
 */
const autofillEvent = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      throw new ApiError(400, "Please provide an event description or prompt");
    }

    // Fetch Categories and Venues directly from MongoDB models
    const categories = await Category.find({}).lean();
    const venues = await Venue.find({ isActive: true }).lean();

    if (categories.length === 0) {
      throw new ApiError(400, "No event categories found in backend database");
    }

    if (venues.length === 0) {
      throw new ApiError(400, "No active campus venues found in backend database");
    }

    const categoryList = categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
    }));

    const venueList = venues.map((v) => ({
      id: v._id.toString(),
      name: v.name,
      collegeName: v.collegeName,
      capacity: v.capacity,
    }));

    const now = new Date();
    const defaultStart = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    defaultStart.setHours(10, 0, 0, 0);
    const defaultEnd = new Date(defaultStart.getTime() + 4 * 60 * 60 * 1000);

    const formatDate = (d) => {
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const systemPrompt = `You are an AI assistant for CampusPass, a campus event management platform.
Your task is to take an organizer's input event idea/prompt and output structured JSON data for creating the event.

CRITICAL RULES FOR DESCRIPTION:
- Make the "description" field CLEAR, DIRECT, WELL-STRUCTURED, and EASY TO READ.
- Avoid flowery language, exaggerated marketing buzzwords, or clickbait fluff.
- Organize the description clearly with:
  1. Event Overview (What the event is about)
  2. Key Highlights / Agenda (Bulleted points of key activities)
  3. Participant Instructions (Entry requirements, what to bring)

CRITICAL RULES FOR CATEGORY AND VENUE SELECTION:
1. You MUST select the "category" ONLY from the following available Categories list:
${JSON.stringify(categoryList, null, 2)}

2. You MUST select the "venue" ONLY from the following available Venues list:
${JSON.stringify(venueList, null, 2)}

You MUST return a VALID JSON object matching EXACTLY this structure (raw JSON only):
{
  "title": "Clear concise event title",
  "description": "Clear, structured, informative description without hype.",
  "category": "ID string of the matching Category from the list above",
  "venue": "ID string of the matching Venue from the list above",
  "startDate": "${formatDate(defaultStart)}",
  "endDate": "${formatDate(defaultEnd)}",
  "capacity": 100,
  "price": 0,
  "posterPrompt": "Clean minimal event poster design for [event topic], graphic design, 8k"
}`;

    let result = null;

    try {
      const rawJsonText = await callGeminiAPI(systemPrompt, prompt.trim());
      const cleanedJsonText = rawJsonText
        .replace(/^```json/i, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

      const generatedData = JSON.parse(cleanedJsonText);

      // Validate returned category
      let selectedCategory = categories.find(
        (c) => c._id.toString() === generatedData.category
      );
      if (!selectedCategory) {
        selectedCategory =
          categories.find(
            (c) =>
              c.name.toLowerCase() === String(generatedData.category || "").toLowerCase()
          ) || categories[0];
      }

      // Validate returned venue
      let selectedVenue = venues.find(
        (v) => v._id.toString() === generatedData.venue
      );
      if (!selectedVenue) {
        selectedVenue =
          venues.find(
            (v) =>
              v.name.toLowerCase() === String(generatedData.venue || "").toLowerCase()
          ) || venues[0];
      }

      let finalCapacity = Number(generatedData.capacity) || 100;
      if (finalCapacity > selectedVenue.capacity) {
        finalCapacity = selectedVenue.capacity;
      }
      if (finalCapacity <= 0) {
        finalCapacity = 50;
      }

      const seed = Math.floor(Math.random() * 1000000);
      const posterPromptText =
        generatedData.posterPrompt ||
        `Clean poster design for campus event ${generatedData.title}`;

      const posterUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        posterPromptText
      )}?width=800&height=1000&seed=${seed}&nologo=true`;

      result = {
        title: generatedData.title || prompt,
        description: generatedData.description || prompt,
        category: selectedCategory._id.toString(),
        categoryName: selectedCategory.name,
        venue: selectedVenue._id.toString(),
        venueName: selectedVenue.name,
        startDate: generatedData.startDate || formatDate(defaultStart),
        endDate: generatedData.endDate || formatDate(defaultEnd),
        capacity: finalCapacity,
        price: Number(generatedData.price) >= 0 ? Number(generatedData.price) : 0,
        posterUrl,
      };
    } catch (geminiError) {
      console.warn("Google Gemini API call failed or rate-limited. Using smart fallback auto-fill generator:", geminiError.message);
      result = smartFallbackGenerate(prompt, categories, venues);
    }

    res.status(200).json(
      apiResponse(200, "Event auto-filled successfully", result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Standalone Poster Generator using AI
 */
const generatePoster = async (req, res, next) => {
  try {
    const { title, description, categoryName } = req.body;

    if (!title || !title.trim()) {
      throw new ApiError(400, "Event title is required to generate poster");
    }

    const promptText = `Modern high quality poster design for campus event titled "${title}", category: ${categoryName || "Campus Event"}, clean poster aesthetic, 4k`;
    const seed = Math.floor(Math.random() * 1000000);
    const posterUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      promptText
    )}?width=800&height=1000&seed=${seed}&nologo=true`;

    res.status(200).json(
      apiResponse(200, "Event poster generated successfully", { posterUrl })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  autofillEvent,
  generatePoster,
  callGeminiAPI,
};
