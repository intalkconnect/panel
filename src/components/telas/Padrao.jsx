// src/components/TotemNaoConfigurado.jsx
import React from "react";

const Padrao = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
      <img
        src="https://onyedkfjdkplbaxpetln.supabase.co/storage/v1/object/public/zapediu//zapediuB_original.png"
        alt="Zapediu Background"
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};

export default Padrao;
