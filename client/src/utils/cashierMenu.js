import { FaCoins } from "react-icons/fa";
import { TiShoppingCart } from "react-icons/ti";
import { RiAnticlockwiseFill } from "react-icons/ri";

export const cashierItems = [
    {
        icon: <TiShoppingCart size={20} />,
        path: '/',
        label: "Sotuv"
    },
    {
        icon: <RiAnticlockwiseFill size={20} />,
        path: '/return',
        label: "Tovarni qaytarish"
    },
    {
        icon: <FaCoins size={20} />,
        path: '/debt',
        label: "Qarzdorlar"
    }
];
