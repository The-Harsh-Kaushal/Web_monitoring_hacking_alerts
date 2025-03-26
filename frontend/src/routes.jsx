import { createBrowserRouter } from "react-router-dom";
import Main from "./pages/Main";
import WebMon from "./pages/WebMon";

const router = createBrowserRouter([
    { path: '/' ,element: <Main/> },
    { path: '/full-traffic-report' , element: <WebMon/> },
]);

export default router;