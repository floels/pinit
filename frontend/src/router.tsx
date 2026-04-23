import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import PinDetailsPage from "./pages/PinDetailsPage";
import AccountPage from "./pages/AccountPage";
import BoardPage from "./pages/BoardPage";
import SearchPage from "./pages/SearchPage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <div>Home</div>,
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
        element: <AccountPage />,
      },
      {
        path: "/:username/:slug",
        element: <BoardPage />,
      },
    ],
  },
]);
