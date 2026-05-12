export default function Footer() {
  return (
    <footer className='bg-card'>
      <div className='mx-auto w-full max-w-screen-xl'>
        <div className='grid grid-cols-2 gap-8 px-4 py-6 lg:py-8 md:grid-cols-4'>
          <div>
            <h2 className='mb-6 text-sm font-semibold text-heading'>
              ABOUT BitBid
            </h2>
            <ul className='text-body font-medium'>
              <li className='mb-4'>
                <a href='#' className=' hover:underline'>
                  Auctions
                </a>
              </li>
              <li className='mb-4'>
                <a href='#' className='hover:underline'>
                  How Bidding Works
                </a>
              </li>
              <li className='mb-4'>
                <a href='#' className='hover:underline'>
                  How to Sell
                </a>
              </li>
              <li className='mb-4'>
                <a href='#' className='hover:underline'>
                  Pricing / Fees
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className='mb-6 text-sm font-semibold text-heading uppercase'>
              Account & Support
            </h2>
            <ul className='text-body font-medium'>
              <li className='mb-4'>
                <a href='#' className='hover:underline'>
                  Login / Sign up
                </a>
              </li>
              <li className='mb-4'>
                <a href='#' className='hover:underline'>
                  Help Center
                </a>
              </li>
              <li className='mb-4'>
                <a href='#' className='hover:underline'>
                  Contact Support
                </a>
              </li>
              <li className='mb-4'>
                <a href='#' className='hover:underline'>
                  Report an Issue
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className='mb-6 text-sm font-semibold text-heading uppercase'>
              Legal
            </h2>
            <ul className='text-body font-medium'>
              <li className='mb-4'>
                <a href='#' className='hover:underline'>
                  Terms of Service
                </a>
              </li>
              <li className='mb-4'>
                <a href='#' className='hover:underline'>
                  Privacy Policy
                </a>
              </li>
              <li className='mb-4'>
                <a href='#' className='hover:underline'>
                  Cookie Policy
                </a>
              </li>
              <li className='mb-4'>
                <a href='#' className='hover:underline'>
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className='px-20 py-8 bg-neutral-secondary-soft md:flex md:items-center md:justify-between border-t-1 border-outline'>
        <span className='text-xs text-grey text-body sm:text-center'>
          © 2026 BitBid, All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}
