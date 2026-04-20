import React from 'react'
import styled from 'styled-components'
import { useAppSelector, useAppDispatch } from '../hooks'
import { closeBirthdayImage } from '../stores/BirthdayStore'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  cursor: pointer;
`

const Image = styled.img`
  max-width: 90vw;
  max-height: 85vh;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`

const CloseHint = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
`

export default function BirthdayImageDialog() {
  const dispatch = useAppDispatch()
  const currentImage = useAppSelector((state) => state.birthday.currentImage)

  const handleClose = () => {
    dispatch(closeBirthdayImage())
  }

  return (
    <Overlay onClick={handleClose}>
      <Image src={currentImage} alt="Birthday" onClick={(e) => e.stopPropagation()} />
      <CloseHint>화면을 클릭하면 닫힙니다</CloseHint>
    </Overlay>
  )
}
