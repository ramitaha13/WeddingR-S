import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "./components/home";
import Contact from "./components/contact";
import Login from "./components/login";
import Admin from "./components/admin";
import NewHall from "./components/newHall";
import NewSinger from "./components/newSinger";
import Newaccount from "./components/newaccount";
import AlltheAccount from "./components/Alltheaccount";
import APpointmentBooking from "./components/AppointmentBooking";
import Alltheevents from "./components/alltheevents";
import SingersPage from "./components/singersPage";
import BookingSinger from "./components/bookingSinger";
import Edithall from "./components/edithall";
import Editsinger from "./components/editsinger";
import DetailsPage from "./components/DetailsPage";
import Statistics from "./components/statistics";
import EditReservation from "./components/editreservation";
import Editbooksinger from "./components/editbooksinger";
import APpointmentBookinghall from "./components/APpointmentBookinghall";
import BookingSingerforSinger from "./components/bookingSingerforSinger";
import EditSingerforAdmin from "./components/editSingerforAdmin";
import Addinghallbookforadmin from "./components/addinghallbookforadmin";
import AddingSingerBookForAdmin from "./components/addingSingerBookForAdmin";
import Edithallforadmin from "./components/edithallforadmin";
import DateChecker from "./components/datacheker";
import DatachekerforSinger from "./components/datachekerforSinger";
import CheckTheDateOfHall from "./components/checkTheDateOfHall";
import CheckTheDateOfSinger from "./components/checkTheDateOfSinger";
import PaymentForm from "./components/PaymentForm";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Paymentisokey from "./components/paymentisokey";
import PaymentForSinger from "./components/PaymentForSinger";
import PaymentisokeySinger from "./components/paymentisokeySinger";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <Admin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/newHall",
    element: (
      <ProtectedRoute>
        <NewHall />
      </ProtectedRoute>
    ),
  },
  {
    path: "/newSinger",
    element: (
      <ProtectedRoute>
        <NewSinger />
      </ProtectedRoute>
    ),
  },
  {
    path: "/newaccount",
    element: (
      <ProtectedRoute>
        <Newaccount />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Alltheaccount",
    element: (
      <ProtectedRoute>
        <AlltheAccount />
      </ProtectedRoute>
    ),
  },
  {
    path: "/AppointmentBooking",
    element: <APpointmentBooking />,
  },
  {
    path: "/alltheevents",
    element: (
      <ProtectedRoute>
        <Alltheevents />
      </ProtectedRoute>
    ),
  },
  {
    path: "/singersPage",
    element: <SingersPage />,
  },
  {
    path: "/newaccount",
    element: (
      <ProtectedRoute>
        <Newaccount />
      </ProtectedRoute>
    ),
  },
  {
    path: "/bookingSinger",
    element: <BookingSinger />,
  },
  {
    path: "/admin/edit-hall/:hallId",
    element: (
      <ProtectedRoute>
        <Edithall />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/edit-singer/:singerName",
    element: (
      <ProtectedRoute>
        <Editsinger />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Login/:hallId",
    element: (
      <ProtectedRoute>
        <DetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/statistics",
    element: <Statistics />,
  },
  {
    path: "/editreservation/:hallId/:orderId",
    element: (
      <ProtectedRoute>
        <EditReservation />
      </ProtectedRoute>
    ),
  },
  {
    path: "/editBookSinger/:hallId/:orderId",
    element: (
      <ProtectedRoute>
        <Editbooksinger />
      </ProtectedRoute>
    ),
  },
  {
    path: "/APpointmentBookinghall/:hallId",
    element: (
      <ProtectedRoute>
        <APpointmentBookinghall />
      </ProtectedRoute>
    ),
  },
  {
    path: "/bookingSingerforSinger/:id",
    element: (
      <ProtectedRoute>
        <BookingSingerforSinger />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/editsingerforadmin/:bookingId",
    element: (
      <ProtectedRoute>
        <EditSingerforAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/addinghallbookforadmin",
    element: (
      <ProtectedRoute>
        <Addinghallbookforadmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/addingSingerBookForAdmin",
    element: (
      <ProtectedRoute>
        <AddingSingerBookForAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/edithallforadmin/:bookingId",
    element: (
      <ProtectedRoute>
        <Edithallforadmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/check-date/:hallId",
    element: <DateChecker />,
  },
  {
    path: "/datachekerforSinger/:hallId",
    element: (
      <ProtectedRoute>
        <DatachekerforSinger />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checkTheDateOfHall",
    element: <CheckTheDateOfHall />,
  },
  {
    path: "/checkTheDateOfSinger",
    element: <CheckTheDateOfSinger />,
  },
  {
    path: "/PaymentForm",
    element: <PaymentForm />,
  },
  {
    path: "/paymentisokey",
    element: <Paymentisokey />,
  },
  {
    path: "/PaymentForSinger",
    element: <PaymentForSinger />,
  },
  {
    path: "/paymentisokeySinger",
    element: <PaymentisokeySinger />,
  },
  {
    path: "*",
    element: <Home />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>,
);
