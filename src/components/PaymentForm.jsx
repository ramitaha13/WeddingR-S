import { useLocation, useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state || {};

  // Convert ILS to USD since PayPal requires USD for some merchant accounts
  const ilsAmount = 300;
  const usdAmount = (ilsAmount / 3.6).toFixed(2); // Using approximate conversion rate

  const style = {
    container: {
      maxWidth: "500px",
      margin: "50px auto",
      padding: "20px",
      backgroundColor: "white",
      borderRadius: "10px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    header: {
      textAlign: "center",
      marginBottom: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    backButton: {
      backgroundColor: "#f0f0f0",
      border: "1px solid #ddd",
      padding: "8px 15px",
      borderRadius: "5px",
      cursor: "pointer",
    },
    amount: {
      textAlign: "center",
      fontSize: "24px",
      marginBottom: "20px",
    },
  };

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div style={style.container}>
      <div style={style.header}>
        <button style={style.backButton} onClick={handleBack}>
          ← Back
        </button>
        <h2>Complete Your Purchase</h2>
        <div style={{ width: "100px" }}></div> {/* Spacer for symmetry */}
      </div>
      <div style={style.amount}>
        <strong>Total: ₪{ilsAmount.toFixed(2)}</strong>
        <div style={{ fontSize: "14px", color: "#666" }}>
          (Approximately ${usdAmount})
        </div>
      </div>

      <PayPalScriptProvider
        options={{
          "client-id":
            "AVrgbOvrrmD1H5_sET2OnP2CD0Hq46nucdcRyFRtQccmulHLVPzZVs8KCcLWt6DFU3rYoERG1CNTeQs-",
          currency: "ILS",
        }}
      >
        <PayPalButtons
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: ilsAmount.toString(),
                    currency_code: "ILS",
                  },
                },
              ],
              application_context: {
                shipping_preference: "NO_SHIPPING",
              },
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then((details) => {
              navigate("/paymentisokey", { state: bookingData });
              console.log("Transaction completed:", details);
            });
          }}
          onError={(err) => {
            alert("Payment failed. Please try again.");
            console.error("PayPal Error:", err);
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default Checkout;
