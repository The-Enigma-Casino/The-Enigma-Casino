import React from "react";
import { TEAM_MEMBERS } from "../data/team";
import TeamCard from "../components/TeamCard";

const AboutPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-start px-4 py-10 w-full h-full">
      <h2 className="text-center text-4xl sm:text-6xl md:text-7xl font-bold text-[#ffdf31] mt-12 mb-10">
        SOBRE NOSOTROS
      </h2>

      <img
        src="/img/about.webp"
        alt="Sobre Enigma Casino"
        className="w-full max-w-[400px] rounded-[3rem] mb-10"
      />

      <p className="max-w-3xl px-4 sm:px-0 text-white text-lg sm:text-2xl leading-relaxed mb-6">
        Enigma Casino es una plataforma online multijugador desarrollada como
        Trabajo de Fin de Grado del Ciclo Formativo de Desarrollo de
        Aplicaciones Web en el CPIFP Alan Turing durante el curso 2024-2025.
      </p>
      <p className="max-w-3xl px-4 sm:px-0 text-white text-lg sm:text-2xl leading-relaxed mb-10">
        Este proyecto tiene como objetivo ofrecer una experiencia de casino
        moderna, inmersiva y completamente en tiempo real, permitiendo a los
        usuarios disfrutar de juegos clásicos como Blackjack, Póker y Ruleta,
        además de incorporar mini juegos originales.
      </p>
      <p className="max-w-3xl px-4 sm:px-0 text-white text-lg sm:text-2xl leading-relaxed mb-10">
        A través de una arquitectura cliente-servidor basada en WebSockets, los
        jugadores pueden interactuar entre sí de forma fluida y dinámica, como
        si estuvieran en una mesa real.
      </p>
      <p className="max-w-3xl px-4 sm:px-0 text-white text-lg sm:text-2xl leading-relaxed mb-10">
        Este proyecto ha sido ideado, programado y perfeccionado por: Alejandro
        Barrionuevo Rosado, Raquel López Bermúdez y José Molina Meléndez.
      </p>
      <p className="max-w-3xl px-4 sm:px-0 text-white text-lg sm:text-2xl leading-relaxed mb-6">
        Enigma Casino es mucho más que un proyecto: es una demostración de
        esfuerzo, trabajo en equipo y pasión por el desarrollo web y los retos.
      </p>

      <h2 className="text-center text-3xl sm:text-4xl font-bold text-[#ffdf31] mt-16 mb-8">
        TEAM ENIGMA
      </h2>

      <div className="flex flex-wrap justify-center gap-6 mb-10">
        {TEAM_MEMBERS.map((member) => (
          <TeamCard key={member.name} {...member} />
        ))}
      </div>
    </div>
  );
};

export default AboutPage;
