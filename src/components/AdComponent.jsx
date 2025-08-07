import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const AdComponent = ({ clientId, slotId, format = 'auto', className = '' }) => {
  useEffect(() => {
    // Load ads in all environments after the AdSense script is ready
    if (typeof window !== 'undefined') {
      const pushAd = () => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.error('AdSense error:', e);
        }
      };

      // Check if AdSense script is loaded every 300ms
      const interval = setInterval(() => {
        if (window.adsbygoogle) {
          pushAd();
          clearInterval(interval);
        }
      }, 300);

      // Cleanup interval on component unmount
      return () => clearInterval(interval);
    }
  }, []); // Empty dependency array to run once on mount

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

AdComponent.propTypes = {
  clientId: PropTypes.string.isRequired,
  slotId: PropTypes.string.isRequired,
  format: PropTypes.string,
  className: PropTypes.string,
};

AdComponent.defaultProps = {
  format: 'auto',
  className: '',
};

export default AdComponent;