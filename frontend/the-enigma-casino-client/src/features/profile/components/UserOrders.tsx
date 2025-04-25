import { formatDate, payModes } from "../helpers/helpers";
import Pagination from "../ui/Pagination";
import { BASE_URL } from "../../../config";
interface Order {
  id: number;
  paidDate: string;
  image: string;
  price: number;
  coins: number;
  payMode: number;
  orderType: number;
  ethereumPrice: number;
}

interface OrdersTableProps {
  orders: Order[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const UserOrders: React.FC<OrdersTableProps> = ({ orders, page, totalPages, onPageChange }) => {



  return (
    <div className="bg-Background-Page text-white flex flex-col items-center px-4 py-6 font-sans text-xl sm:text-2xl md:text-3xl">
      {/* Tabla */}
      <div className="w-full max-w-6xl border border-Green-lines rounded-md overflow-hidden">
        {/* Encabezado */}
        <div className="grid grid-cols-6 bg-Principal text-black font-bold text-2xl text-center py-4">
          <div>FECHA</div>
          <div>IMAGEN</div>
          <div>FICHAS</div>
          <div>MODO</div>
          <div>CANTIDAD</div>
          <div>TIPO</div>
        </div>

        {/* Filas */}
        {orders.map(order => {
          const isWithdrawal = order.orderType === 1;

          const imageSrc = order.image
            ? `${BASE_URL}${order.image}`
            : "/svg/user.svg";

          return (
            <div
              key={order.id}
              className="grid grid-cols-6 items-center bg-Background-Overlay text-center text-white py-4 px-2 sm:px-4"
            >
              {/* Fecha */}
              <div>{formatDate(order.paidDate)}</div>

              {/* Imagen */}
              <div className="flex justify-center">
                <img
                  src={`${imageSrc}`}
                  alt="pack"
                  className="w-14 h-14 object-contain"
                />
              </div>

              {/* Fichas */}
              <div className="text-yellow-400 font-bold">
                {order.coins}
              </div>

              {/* Modo pago */}
              <div className="text-white">
                {payModes[order.payMode]}
              </div>

              {/* Pago/recibido */}
              <div className="flex items-center justify-center gap-2 text-white">

                <span>
                  {isWithdrawal
                    ? `${order.ethereumPrice.toFixed(3)}`
                    : order.payMode === 1
                      ? `${order.price}`
                      : `${order.ethereumPrice.toFixed(3)}`}
                </span>
                <img
                  src={order.payMode === 1 ? "/svg/euro.svg" : "/svg/ethereum.svg"}
                  alt={order.payMode === 1 ? "Tarjeta" : "Ethereum"}
                  className="w-6 h-6"
                />
              </div>

              {/* Tipo */}
              <div className={isWithdrawal ? "text-red-500 font-bold" : "text-green-400 font-bold"}>
                {isWithdrawal ? "RETIRO" : "COMPRA"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginacion */}
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
};

export default UserOrders;
