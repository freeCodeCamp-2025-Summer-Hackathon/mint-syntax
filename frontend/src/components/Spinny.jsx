const Spinny = ({ className = '' }) => {
  return (
    <div className={`inline-spinner-wrapper ${className}`}>
      <svg
        width='32'
        height='32'
        viewBox='0 0 32 32'
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
      >
        <defs>
          <linearGradient
            id='gradient'
            x1='0'
            y1='0'
            x2='32'
            y2='32'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#6afb92' />
            <stop offset='1' stopColor='#2c7873' />
          </linearGradient>
        </defs>

        <circle
          cx='16'
          cy='16'
          r='12'
          stroke='url(#gradient)'
          strokeWidth='3'
          strokeLinecap='round'
          fill='none'
          strokeDasharray='60'
          strokeDashoffset='20'
        >
          <animateTransform
            attributeName='transform'
            type='rotate'
            from='0 16 16'
            to='360 16 16'
            dur='0.8s'
            repeatCount='indefinite'
          />
        </circle>
      </svg>
    </div>
  );
};

export default Spinny;
