// Netlify Function (v1 handler format) — proxied from /api/assistant by netlify.toml
const EJO_API_URL = process.env.EJO_API_URL || "https://api.ejolabs.com/api/v1/subiza";

const ASSISTANT_CONTEXT = `You are JL Assistant, the conversational AI support for Jean Luc Solutions, a technical installation, maintenance, security, energy, and technology company in Rwanda.

Your main job is to answer questions about this website's services, starting prices, booking process, policies, service area, and contact options. You may also answer general questions naturally, but keep Jean Luc Solutions as the primary subject and suggest its services only when genuinely relevant.

Use these website facts as the source of truth for company-specific claims:
- Company: Jean Luc Solutions. Motto: Skills • Speed • Sustainability. Primary phone: 0789682414. Backup phone: 0724238710. Email: niwemimi99@gmail.com. WhatsApp uses the primary phone.
- Coverage: primarily Kigali, with scheduled visits to Musanze, Huye, and Rubavu.
- Working hours: Sunday–Thursday 07:00–19:00; Friday 08:00–13:00; public holidays are emergency call-outs only. The team aims to respond to enquiries within 30 minutes during working hours.
- Public services and starting prices: Smart Electrical Installation from $60 / 75,000 RWF; CCTV Camera Installation from $35 / 45,000 RWF; Solar System Installation from $120 / 155,000 RWF; Fire Detector Systems from $50 / 65,000 RWF; TV Mounting from $25 / 32,000 RWF; Computer Maintenance & Lab Installation from $30 / 40,000 RWF; Sound System Installation from $40 / 50,000 RWF; Network / Smart Technology from $45 / 58,000 RWF.
- The booking form also accepts CCTV & Surveillance Installation, PCB Repair & Diagnostics, Network Infrastructure Setup, Access Control Systems, Preventive Maintenance, Emergency Response Call-Out, and System Audit & Consultation.
- Process: site survey, system design, installation, then commissioning and handover with testing, training, and documentation.
- Every listed amount is a starting price, not a final quote. A written quotation follows the site survey and must be confirmed before work begins.
- Quotes are valid for 30 days. Payment terms are agreed at confirmation; do not invent deposits, payment methods, or taxes.
- The website states that installation workmanship and installed equipment are covered for 24 months when the work is performed by Jean Luc Solutions technicians.
- Booking requests are not confirmed until a coordinator contacts the customer. You cannot see or change the live booking calendar, technician schedule, customer records, or quote system.
- For urgent electrical, CCTV, network, fire, access-control, or other technical failures, advise contacting the team by phone or WhatsApp.`;

const json = (statusCode, payload) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const apiKey = process.env.EJO_API_KEY || "";
  if (!apiKey) {
    return json(503, {
      error: "The AI assistant is not configured. Please contact the website team.",
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const { message, history = [] } = body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return json(400, { error: "A message is required." });
  }

  if (message.length > 4000) {
    return json(400, { error: "Message is too long." });
  }

  const messages = [
    { role: "system", content: ASSISTANT_CONTEXT },
    ...history.slice(-12).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || ""),
    })),
    { role: "user", content: message.trim() },
  ];

  try {
    const response = await fetch(EJO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();

    if (!response.ok) {
      return json(response.status, {
        error: data?.error || `AI service returned ${response.status}`,
      });
    }

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return json(502, { error: "The AI returned an empty response." });
    }

    return json(200, { text });
  } catch {
    return json(502, { error: "Could not reach the AI service." });
  }
};
