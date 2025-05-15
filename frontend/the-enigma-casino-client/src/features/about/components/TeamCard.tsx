import React from "react";

interface TeamCardProps {
  name: string;
  role: string;
  image: string;
  github?: string;
  linkedin?: string;
}

const TeamCard: React.FC<TeamCardProps> = ({
  name,
  role,
  image,
  github,
  linkedin,
}) => {
  return (
    <div className="flex flex-col items-center text-center border-2 border-[#74c410] rounded-[2rem] p-4 w-[100px] h-[180px] sm:w-[200px] sm:h-[280px] shadow-xl flex-shrink-0">
      <a href={github} target="_blank" rel="noopener noreferrer">
        <img
          src={image}
          alt={name}
          className="object-cover rounded-full border-2 border-[#74c410] mb-4 hover:scale-105 transition-transform"
        />
      </a>

      <h3 className="text-[#74c410] text-2xl font-bold mb-1 leading-tight">
        {name}
      </h3>
      <p className="hidden sm:block text-white text-lg leading-snug">{role}</p>

      <div className="mt-auto flex gap-6 justify-center">
        {github && (
          <a href={github} target="_blank" rel="noopener noreferrer">
            <img
              src="/svg/github.svg"
              alt="GitHub"
              className="w-6 h-6 sm:w-10 sm:h-10 hover:scale-110 transition-transform"
            />
          </a>
        )}
        {linkedin && (
          <a href={linkedin} target="_blank" rel="noopener noreferrer">
            <img
              src="/svg/linkedin.svg"
              alt="LinkedIn"
              className="w-6 h-6 sm:w-12 sm:h-12 hover:scale-110 transition-transform"
            />
          </a>
        )}
      </div>
    </div>
  );
};

export default TeamCard;
