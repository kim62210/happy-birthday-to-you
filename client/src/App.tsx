import React from 'react'
import styled from 'styled-components'

import { useAppSelector } from './hooks'

import RoomSelectionDialog from './components/RoomSelectionDialog'
import LoginDialog from './components/LoginDialog'
import ComputerDialog from './components/ComputerDialog'
import WhiteboardDialog from './components/WhiteboardDialog'
import VideoConnectionDialog from './components/VideoConnectionDialog'
import Chat from './components/Chat'
import BirthdayImageDialog from './components/BirthdayImageDialog'
import HelperButtonGroup from './components/HelperButtonGroup'
import MobileVirtualJoystick from './components/MobileVirtualJoystick'

const Backdrop = styled.div`
  position: relative;
  z-index: 5;
  height: 100%;
  width: 100%;
`

const MapNameplate = styled.div`
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100;
  pointer-events: none;
  min-width: 320px;
  padding: 12px 28px;
  border-radius: 999px;
  background: rgba(244, 239, 231, 0.96);
  border: 2px solid rgba(110, 98, 85, 0.92);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
  color: #3d3228;
  font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  text-align: center;
  letter-spacing: -0.04em;

  &::after {
    content: '';
    display: block;
    height: 4px;
    margin-top: 8px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      rgba(199, 138, 74, 0.1),
      rgba(199, 138, 74, 0.95),
      rgba(199, 138, 74, 0.1)
    );
  }
`

function App() {
  const loggedIn = useAppSelector((state) => state.user.loggedIn)
  const computerDialogOpen = useAppSelector((state) => state.computer.computerDialogOpen)
  const whiteboardDialogOpen = useAppSelector((state) => state.whiteboard.whiteboardDialogOpen)
  const videoConnected = useAppSelector((state) => state.user.videoConnected)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const birthdayImageOpen = useAppSelector((state) => state.birthday.imageOpen)

  let ui: JSX.Element
  if (loggedIn) {
    if (computerDialogOpen) {
      /* Render ComputerDialog if user is using a computer. */
      ui = <ComputerDialog />
    } else if (whiteboardDialogOpen) {
      /* Render WhiteboardDialog if user is using a whiteboard. */
      ui = <WhiteboardDialog />
    } else {
      ui = (
        /* Render Chat or VideoConnectionDialog if no dialogs are opened. */
        <>
          <Chat />
          {/* Render VideoConnectionDialog if user is not connected to a webcam. */}
          {!videoConnected && <VideoConnectionDialog />}
          <MobileVirtualJoystick />
        </>
      )
    }
  } else if (roomJoined) {
    /* Render LoginDialog if not logged in but selected a room. */
    ui = <LoginDialog />
  } else {
    /* Render RoomSelectionDialog if yet selected a room. */
    ui = <RoomSelectionDialog />
  }

  return (
    <Backdrop>
      {ui}
      {loggedIn && !computerDialogOpen && !whiteboardDialogOpen && (
        <MapNameplate>디지털전략센터</MapNameplate>
      )}
      {birthdayImageOpen && <BirthdayImageDialog />}
      {!computerDialogOpen && !whiteboardDialogOpen && <HelperButtonGroup />}
    </Backdrop>
  )
}

export default App
