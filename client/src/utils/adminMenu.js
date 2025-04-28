import { TbPackageImport, TbUserUp, TbUserDown } from "react-icons/tb";
import { FaCoins } from "react-icons/fa";
import { TiShoppingCart } from "react-icons/ti";
import { AiFillProduct } from "react-icons/ai";
import { RiAnticlockwiseFill } from "react-icons/ri";

export const adminItems = [
    {
        icon: <AiFillProduct size={20} />,
        path: '/',
        label: "Tovar"
    },
    {
        icon: <TbPackageImport size={20} />,
        path: '/import',
        label: "Import"
    },
    {
        icon: <TiShoppingCart size={20} />,
        path: '/sale',
        label: "Sotuv"
    },
    {
        icon: <FaCoins size={20} />,
        path: '/debt',
        label: "Qarzdorlar"
    },
    {
        icon: <RiAnticlockwiseFill  size={20} />,
        path: '/return',
        label: "Tovarni qaytarish"
    },
    {
        icon: <TbUserDown size={20} />,
        path: '/suppliers',
        label: "Yetkazib beruvchilar"
    },
    {
        icon: <TbUserUp size={20} />,
        path: '/customers',
        label: "Xaridorlar"
    },
];
