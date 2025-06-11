const InstallPage = () => {
  return (
    <div className="bg-Background-Page text-white py-16 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 2xl:px-48 max-w-screen-2xl mx-auto font-reddit">
      <div className="p-10">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-center text-Principal mb-16 tracking-tight">
          Instalar The Enigma Casino
        </h1>

        <div className="space-y-12 text-lg sm:text-xl md:text-2xl leading-loose">
          {/* Introducción */}
          <section>
            <h2 className="text-3xl font-bold text-Principal mb-3 border-l-4 border-Principal pl-4">
              🧭 Introducción
            </h2>
            <p>
              Bienvenido a{" "}
              <strong className="text-white">The Enigma Casino</strong>. Esta
              guía te ayudará a instalar nuestra aplicación en tu dispositivo
              para que puedas acceder de forma rápida y cómoda. No necesitas
              descargar nada desde tiendas oficiales. Solo sigue los pasos y
              podrás usar el casino como si fuera una app instalada.
            </p>
          </section>

          {/* Móviles */}
          <section>
            <h2 className="text-3xl font-bold text-Principal mb-4 border-l-4 border-Principal pl-4">
              📱 Instalar en tu móvil
            </h2>
            <p className="mb-6">
              Puedes instalar The Enigma Casino en tu teléfono para abrirlo como
              si fuera una app, sin tener que usar el navegador cada vez.
            </p>

            {/* Android */}
            <div className="mb-10">
              <h3 className="text-2xl font-semibold mb-2 flex items-center gap-3">
                <span className="w-8 h-8 p-1 bg-green-700 rounded-full">
                  <img
                    src="/svg/android.svg"
                    alt="Android"
                    aria-label="Icono de Android"
                    className="w-full h-full object-contain"
                  />
                </span>
                En Android (Chrome, Edge, Brave...)
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-200 ml-4">
                <li>Abre la página desde el navegador de tu móvil.</li>
                <li>
                  Toca el icono de los tres puntos (⋮) en la esquina superior
                  derecha.
                </li>
                <li>
                  Selecciona <strong>“Añadir a pantalla de inicio”</strong> o{" "}
                  <strong>“Instalar aplicación”</strong>.
                </li>
                <li>Confirma y se creará el acceso directo.</li>
              </ol>
            </div>

            {/* iPhone */}
            <div>
              <h3 className="text-2xl font-semibold mb-2 flex items-center gap-3">
                <span className="w-8 h-8 p-1 bg-blue-600 rounded-full">
                  <img
                    src="/svg/ios.svg"
                    alt="iOS"
                    aria-label="Icono de iOS"
                    className="w-full h-full object-contain"
                  />
                </span>
                En iPhone / iPad (Safari)
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-200 ml-4">
                <li>Abre la página desde Safari.</li>
                <li>
                  Toca el botón de compartir (cuadro con flecha hacia arriba).
                </li>
                <li>
                  Desliza y selecciona{" "}
                  <strong>“Añadir a pantalla de inicio”</strong>.
                </li>
                <li>
                  Ponle un nombre si quieres, y pulsa <strong>“Añadir”</strong>.
                </li>
              </ol>
            </div>
          </section>

          {/* Ordenador */}
          <section>
            <h2 className="text-3xl font-bold text-Principal mb-4 border-l-4 border-Principal pl-4">
              Instalar en tu ordenador
            </h2>
            <p className="mb-6">
              También puedes instalar The Enigma Casino en tu ordenador para
              abrirlo directamente desde el escritorio.
            </p>

            <div>
              <h3 className="text-2xl font-semibold mb-2 flex items-center gap-3">
                <span className="w-8 h-8 p-1 bg-yellow-600 rounded-full">
                  <img
                    src="/svg/desktop.svg"
                    alt="Desktop"
                    aria-label="Icono de Desktop"
                    className="w-full h-full object-contain"
                  />
                </span>
                En Windows o macOS (Chrome, Edge...)
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-200 ml-4">
                <li>Abre la página desde tu navegador habitual.</li>
                <li>
                  Si ves este icono:
                  <img
                    src="/svg/install.svg"
                    alt="Icono instalar"
                    className="w-8 h-8 inline-block mx-1 align-text-bottom"
                  />
                  haz clic en él.
                </li>
                <li>
                  Confirma la instalación. Se abrirá como una app independiente.
                </li>
                <li>
                  Se añadirá un acceso directo al escritorio o al menú de
                  inicio.
                </li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InstallPage;
