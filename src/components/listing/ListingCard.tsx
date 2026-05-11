type ListingCardProps = {
  title: string;
  currentBid: number;
  bidCount: number;
  endTime: Date;
  imageSrc: string;
};

function formatCurrency(amount: number) {
  const number = new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 0,
  }).format(amount);

  return `${number}\u00A0TL`;
}

function getTimeLeft(endTime: Date) {
  const diff = new Date(endTime).getTime() - Date.now();

  if (diff <= 0) {
    return { d: '00', h: '00', m: '00', s: '00' };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return {
    d: String(d).padStart(2, '0'),
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
  };
}

export default function ListingCard({
  title,
  currentBid,
  bidCount,
  endTime,
  imageSrc,
}: ListingCardProps) {
  const timeLeft = getTimeLeft(endTime);

  return (
    <div className='w-66 shrink-0 md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)] xl:w-[calc((100%-6rem)/5)] bg-foreground rounded-md p-4 flex flex-col text-white border border-outline relative overflow-hidden group'>
      <div className='absolute inset-0 bg-gradient-to-b to-transparent pointer-events-none rounded-md'></div>

      <div className='relative w-full aspect-square rounded-md flex items-center justify-center mb-4 overflow-hidden'>
        <img
          src={imageSrc}
          alt={title}
          className='w-full h-full object-contain drop-shadow-2xl rounded-md'
        />
        <div className='absolute bottom-3 left-3 bg-[#121418]/80 backdrop-blur-md border border-gray-700 text-white text-2xs font-bold px-2.5 py-1.5 rounded-md flex items-center gap-2'>
          <span className='relative flex h-2.5 w-2.5'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75'></span>
            <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600'></span>
          </span>
          LIVE
        </div>
      </div>

      <h3 className='text-sm font-medium leading-snug mb-3 line-clamp-2 text-white'>
        {title}
      </h3>

      <div className='flex flex-col mb-4'>
        <div className='flex items-baseline gap-2'>
          <span className='text-[#e2b054] text-xs font-semibold tracking-wider'>
            CURRENT BID:
          </span>
          <span className='text-[#e2b054] text-xl font-bold'>
            {formatCurrency(currentBid)}
          </span>
        </div>
        <span className='text-grey text-xs mt-0.5'>{bidCount} Bids</span>
      </div>

      <div className='text-grey textxs mb-5 flex items-center gap-1.5 text-xs'>
        <span className='tracking-wide uppercase'>Ends in:</span>
        <div className='flex gap-1 font-mono text-sm'>
          <span className='text-white font-semibold'>
            {timeLeft.d}
            <span className='text-grey text-3xs'>d</span>
          </span>
          <span className='text-white font-semibold'>
            {timeLeft.h}
            <span className='text-grey text-3xs'>h</span>
          </span>
          <span className='text-white font-semibold'>
            {timeLeft.m}
            <span className='text-grey text-3xs'>m</span>
          </span>
          <span className='text-white font-semibold'>
            {timeLeft.s}
            <span className='text-grey text-3xs'>s</span>
          </span>
        </div>
      </div>

      <button className='w-full bg-gradient-to-r from-[#ff8c00] to-[#ffaa00] hover:from-[#ff9900] hover:to-[#ffb732] text-white font-bold py-3.5 rounded-md transition-all duration-200 active:scale-[0.98] shadow-[0_0_15px_rgba(255,140,0,0.2)] hover:shadow-[0_0_20px_rgba(255,140,0,0.4)] relative overflow-hidden'>
        <div className='absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-xl'></div>
        PLACE BID
      </button>
    </div>
  );
}
