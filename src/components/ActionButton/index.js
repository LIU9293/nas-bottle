import React from 'react';
import './index.css';

function ActionButton ({ text, onClick }) {
  return (
    <div onClick={onClick} className='action_button'>
      {text}
    </div>
  )
}

export default ActionButton;
