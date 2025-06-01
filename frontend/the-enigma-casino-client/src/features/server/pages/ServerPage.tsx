// src/pages/ServerPage.tsx
import { DEPLOY_ENV } from "../../../config";

const getDeployData = (env: string) => {
  switch (env) {
    case "development":
      return {
        label: "Desarrollo local",
        icon: "💻",
        color: "bg-blue-100 text-blue-800 border-blue-300",
      };
    case "vercel":
      return {
        label: "Vercel",
        img: "/img/vercel.webp",
        color: "bg-black text-white border-gray-700",
      };
    case "aws-frontend-1":
      return {
        label: "AWS Frontend",
        img: "/img/aws.webp",
        number: "#1",
        color: "bg-orange-100 text-orange-900 border-orange-400 font-mono",
        badge: "bg-orange-500 text-white",
      };
    case "aws-frontend-2":
      return {
        label: "AWS Frontend",
        img: "/img/aws.webp",
        number: "#2",
        color: "bg-gray-100 text-gray-900 border-gray-400 font-mono",
        badge: "bg-gray-600 text-white",
      };
    default:
      return {
        label: "Entorno desconocido",
        icon: "❓",
        color: "bg-gray-100 text-gray-800 border-gray-300",
      };
  }
};

const ServerPage = () => {
  const { label, icon, img, number, color, badge } = getDeployData(DEPLOY_ENV);

  return (
    <div className="mt-14 flex items-center justify-center bg-[var(--Background)] px-4">
      <div
        className={`transition-transform duration-300 ease-in-out transform hover:scale-105 w-full max-w-md border rounded-2xl shadow-2xl p-10 text-center ${color}`}
      >
        {img ? (
          <img
            src={img}
            alt="Logo"
            className="max-w-[80px] max-h-[80px] mx-auto mb-4 object-contain"
          />
        ) : (
          <div className="text-7xl mb-4 font-black tracking-tight">{icon}</div>
        )}

        {number && (
          <div className="text-5xl font-black tracking-wider mb-2">
            {number}
          </div>
        )}

        <h1 className="text-3xl font-bold mb-2">{label}</h1>
        <p className="text-sm text-gray-500 mt-2">({DEPLOY_ENV})</p>

        {badge && (
          <div
            className={`mt-4 inline-block px-4 py-1 rounded-full text-sm font-semibold ${badge}`}
          >
            Amazon Web Services
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerPage;
