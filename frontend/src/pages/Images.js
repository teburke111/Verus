import React from 'react'
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { Button } from '@mui/material'
import { useNavigate } from "react-router-dom";

function Images() {
  const navigate = useNavigate();
  const Return = () => {
    navigate("/");
  };

  return (
    <div>
      Images
      <Button className='returnButton' onClick={Return}>
        <KeyboardReturnIcon className='returnIcon' />
        Return
      </Button>
    </div>
  )
}

export default Images
