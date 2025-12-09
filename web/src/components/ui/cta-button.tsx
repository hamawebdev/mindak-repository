import React from 'react';

const Button = () => {
  return (
    <div className="relative inline-flex items-center justify-center gap-4 group">
      <div className="absolute inset-0 duration-1000 opacity-60 transition-all rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200" style={{ background: 'linear-gradient(90deg, rgba(113,255,123,1) 0%, rgba(31,139,255,1) 100%)' }} />
      <a role="button" className="group relative inline-flex items-center justify-center text-2xl rounded-xl bg-black px-14 py-6 text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5" style={{ '--hover-shadow-color': 'rgb(31,139,255)', fontFamily: "'Helvetica Neue', sans-serif" } as React.CSSProperties} href="/podcast"><span className="font-black text-xl md:text-2xl">let's get started</span><svg aria-hidden="true" viewBox="0 0 10 10" height={10} width={10} fill="none" className="mt-0.5 ml-2 -mr-1 stroke-white stroke-2">
        <path d="M0 5h7" className="transition opacity-0 group-hover:opacity-100" />
        <path d="M1 1l4 4-4 4" className="transition group-hover:translate-x-[3px]" />
      </svg>
      </a>
    </div> 
  );
}

export default Button;
