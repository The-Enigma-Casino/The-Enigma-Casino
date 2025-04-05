import { splitCoinsIntoChips } from '../utils/chipUtils';
import { Chip } from './Chip';

type Props = {
  coins: number;
};

export const ChipStack = ({ coins }: Props) => {
  const chips = splitCoinsIntoChips(coins);

  const stackHeight = chips.length * 4 + 40; // altura base + margen entre fichas

  return (
    <div className="relative" style={{ height: `${stackHeight}px`, width: '48px' }}>
      {chips.map((value, index) => (
        <div
          key={index}
          className="absolute left-0"
          style={{ bottom: `${index * 4}px` }}
        >
          <Chip value={value} />
        </div>
      ))}
    </div>
  );
};
