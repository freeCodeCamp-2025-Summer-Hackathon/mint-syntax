const Spinny = props => {
  return (
    <svg
      width='48'
      height='48'
      viewBox='0 0 100 100'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <defs>
        <linearGradient
          id='spinnerGradient'
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#6afb92' />
          <stop offset='100%' stopColor='#2c7873' />
        </linearGradient>
        <filter id='glassBlur' x='-20%' y='-20%' width='140%' height='140%'>
          <feGaussianBlur in='SourceGraphic' stdDeviation='1.5' />
        </filter>
      </defs>

      <circle
        cx='50'
        cy='50'
        r='40'
        stroke='url(#spinnerGradient)'
        strokeWidth='8'
        strokeLinecap='round'
        fill='none'
        strokeDasharray='188.5'
        strokeDashoffset='60'
        filter='url(#glassBlur)'
      >
        <animateTransform
          attributeName='transform'
          type='rotate'
          from='0 50 50'
          to='360 50 50'
          dur='1.1s'
          repeatCount='indefinite'
        />
      </circle>
    </svg>
  );
};

export default Spinny;
