import { createBrowserRouter } from "react-router-dom";
import Main from "./pages/Main";
import WebMon from "./pages/WebMon";
import Shielding from "./pages/Shielding";
import About from "./pages/About";
import Documentation from "./pages/Documentation";

const router = createBrowserRouter([
    { path: '/' ,element: <Main/> },
    { path: '/full-traffic-report' , element: <WebMon/> },
    {path: '/shielding' , element: <Shielding/> },
    {path: '/about', element: <About/>},
    {path: '/documentation' , element: <Documentation/>},
]);

export default router;