'use client'

import React, { useEffect } from 'react';

interface StorefrontPreviewProps {
    storefrontData: any;
}

const StorefrontPreview: React.FC<StorefrontPreviewProps> = ({ 
  storefrontData
}) => {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.warn('Placeholder: StorefrontPreview is not implemented yet.');
  }, []);
  return (
    <>
      {/* StorefrontPreview */}
    </>
  );
};

export default StorefrontPreview;