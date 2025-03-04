





function Coins() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-Background-Overlay rounded-3xl p-10 shadow-lg text-center w-[35rem] h-[rem] flex flex-col items-center justify-center">
                <img
                    src="/img/pack1.webp"
                    alt="pack"
                    className="w-[20rem] h-[20rem] object-cover rounded-lg"
                />
                <p className="text-Coins font-bold mt-6 text-5xl">
                    100 Fichas
                </p>
                <div className="border-4 border-green-800 bg-gray-800 text-white px-8 py-3 rounded-full mt-6">
                    <p className="text-4xl font-bold">
                        100 €
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Coins;






