import React from 'react';
import './index.css';

function ActionButton ({ text, onClick, style }) {
  return (
    <div onClick={onClick} style={style} className='action_button'>
      {text}
    </div>
  )
}

export default ActionButton;
