import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Home</div>,
  },
  {
    path: "/pin/:id",
    element: <div>Pin details</div>,
  },
  {
    path: "/pin-creation-tool",
    element: <div>Pin creation</div>,
  },
  {
    path: "/search/pins",
    element: <div>Search</div>,
  },
  {
    path: "/:username",
    element: <div>Account</div>,
  },
  {
    path: "/:username/:slug",
    element: <div>Board</div>,
  },
]);
