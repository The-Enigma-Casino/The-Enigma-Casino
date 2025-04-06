import { ChipStack } from './ChipStack';

type Props = {
  name: string;
  coins: number;
  avatarUrl: string;
  isCurrent?: boolean;
};

export const PlayerHUD = ({ name, coins, avatarUrl, isCurrent = false }: Props) => {
  return (
    <div className="flex flex-col items-center gap-1 relative">
      {isCurrent && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-black animate-ping" />
      )}
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      </div>

      <div className="text-sm text-green-500 font-bold">${coins}</div>
      <div className="text-xs font-semibold text-center">{name}</div>
      <ChipStack coins={coins} />
    </div>
  );
};