import React from 'react';
import './CloudDecoration.css';

const CloudDecoration = ({ position }) => {
  return (
    <div className={`cloud-decoration ${position}`}>
      <div className="cloud cloud-1"></div>
      <div className="cloud cloud-2"></div>
      <div className="cloud cloud-3"></div>
    </div>
  );
};

export default CloudDecoration;