import React from 'react'
import { useNavigate } from "react-router-dom";
import { Button } from '@mui/material'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

function Text() {
  const navigate = useNavigate();
  const Return = () => {
    navigate("/");
  };

  return (
    <div>
      Text
      <Button className='returnButton' onClick={Return}>
        <KeyboardReturnIcon className='returnIcon'/>
        Return
      </Button>
    </div>
  )
}

export default Text
