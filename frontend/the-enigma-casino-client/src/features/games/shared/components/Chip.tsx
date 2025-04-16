type Props = {
  value: number;
};

export const Chip = ({ value }: Props) => {
  const bgColor = {
    5: 'bg-white',
    10: 'bg-lime-400',
    25: 'bg-orange-400',
    50: 'bg-red-500',
    100: 'bg-purple-500',
  }[value];

  return (
    <div
      className={`w-12 h-12 rounded-full border-4 border-black shadow-sm flex items-center justify-center text-sm font-bold text-black ${bgColor}`}
    >
      {value}
    </div>
  );
};
