import React from "react";

const AboutPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-start px-4 py-10 w-full h-full">
      <h2 className="text-center text-4xl sm:text-5xl md:text-6xl font-bold text-[#ffdf31] mt-12 mb-10">
        SOBRE NOSOTROS
      </h2>

      <img
        src="/img/about.webp"
        alt="Sobre Enigma Casino"
        className="w-full max-w-[500px] rounded-[3rem] mb-10"
      />
    </div>
  );
};

export default AboutPage;
