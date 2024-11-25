import express from "express";
import paypal from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());

// CORS Middleware
app.use(cors({ origin: "https://wedding-r-s.vercel.app/" })); // Match your frontend's origin

// PayPal SDK Setup
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_SECRET,
);
const client = new paypal.core.PayPalHttpClient(environment);

// Create Order Endpoint
app.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "ILS", // Change to Israeli Shekel
          value: amount.toString(), // Use the dynamic amount from the request
        },
      },
    ],
  });

  try {
    const order = await client.execute(request);
    res.json({ id: order.result.id }); // Return the PayPal order ID
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({ error: "Error creating order" });
  }
});

// Capture Order Endpoint
app.post("/capture-order", async (req, res) => {
  const { orderId } = req.body;

  if (!orderId || typeof orderId !== "string") {
    return res.status(400).json({ error: "Invalid or missing order ID" });
  }

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    res.json(capture.result); // Return the capture result to the frontend
  } catch (error) {
    console.error("Error capturing order:", error.message);
    res.status(500).json({ error: "Error capturing order" });
  }
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
