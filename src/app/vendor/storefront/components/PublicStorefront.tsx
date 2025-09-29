'use client';

import React, { useEffect } from 'react';

interface PublicStorefrontProps {
    storefrontData: any;

    isPreview: boolean;
}

const PublicStorefront: React.FC<PublicStorefrontProps> = ({ 
  isPreview
}) => {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.warn('Placeholder: PublicStorefront is not implemented yet.');
  }, []);
  return (
    <>
      {/* PublicStorefront */}
    </>
  );
};

export default PublicStorefront;
