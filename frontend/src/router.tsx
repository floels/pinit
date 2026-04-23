import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import PinDetailsPage from "./pages/PinDetailsPage";
import AccountDetailsPage from "./pages/AccountDetailsPage";
import BoardPage from "./pages/BoardPage";
import SearchPage from "./pages/SearchPage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/pin/:id",
        element: <PinDetailsPage />,
      },
      {
        path: "/pin-creation-tool",
        element: <div>Pin creation</div>,
      },
      {
        path: "/search/pins",
        element: <SearchPage />,
      },
      {
        path: "/:username",
        element: <AccountDetailsPage />,
      },
      {
        path: "/:username/:slug",
        element: <BoardPage />,
      },
    ],
  },
]);
