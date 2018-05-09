import React from 'react';
import './index.css';

function ButtonContainer({ children }) {
  return (
    <div className={'gray_layer'}>
      {children}
    </div>
  )
}

export default ButtonContainer;
