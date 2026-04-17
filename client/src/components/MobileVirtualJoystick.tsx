import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from '@mui/material/Button'
import ForumIcon from '@mui/icons-material/Forum'
import EventSeatIcon from '@mui/icons-material/EventSeat'
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows'
import EditIcon from '@mui/icons-material/Edit'
import LocalCafeIcon from '@mui/icons-material/LocalCafe'
import CloseIcon from '@mui/icons-material/Close'

import JoystickItem, { JoystickMovement } from './Joystick'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

import { useAppDispatch, useAppSelector } from '../hooks'
import { setFocused, setShowChat } from '../stores/ChatStore'
import { ItemType } from '../../../types/Items'
import { PlayerBehavior } from '../../../types/PlayerBehavior'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1200;
`

const JoystickDock = styled.div`
  position: absolute;
  left: 16px;
  bottom: 28px;
  pointer-events: auto;
`

const ActionDock = styled.div`
  position: absolute;
  right: 16px;
  bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
  pointer-events: auto;
`

const ActionButton = styled(Button)`
  min-width: 108px;
  min-height: 46px;
  border-radius: 16px !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
  font-weight: 700 !important;
  letter-spacing: -0.02em;
`

const StatusPill = styled.div`
  max-width: 200px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(33, 31, 29, 0.84);
  color: var(--ui-text);
  font-size: 12px;
  line-height: 1.2;
  text-align: right;
  border: 1px solid rgba(210, 188, 168, 0.28);
`

export const minimumScreenWidthSize = 1024 // px

const useSmallScreen = (smallScreenSize: number) => {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return width <= smallScreenSize
}

type MobileContext = {
  isSitting: boolean
  selectedItemType?: ItemType
}

const initialContext: MobileContext = {
  isSitting: false,
  selectedItemType: undefined,
}

export default function MobileVirtualJoystick() {
  const dispatch = useAppDispatch()
  const showJoystick = useAppSelector((state) => state.user.showJoystick)
  const showChat = useAppSelector((state) => state.chat.showChat)
  const focused = useAppSelector((state) => state.chat.focused)
  const hasSmallScreen = useSmallScreen(minimumScreenWidthSize)
  const [mobileContext, setMobileContext] = useState<MobileContext>(initialContext)
  const game = phaserGame.scene.keys.game as Game

  useEffect(() => {
    if (!showJoystick || !hasSmallScreen) return

    const timer = window.setInterval(() => {
      const selectedItem = game?.getSelectedItem?.()
      setMobileContext({
        isSitting: game?.myPlayer?.playerBehavior === PlayerBehavior.SITTING,
        selectedItemType: selectedItem?.itemType,
      })
    }, 120)

    return () => window.clearInterval(timer)
  }, [game, hasSmallScreen, showJoystick])

  const handleMovement = (movement: JoystickMovement) => {
    game.myPlayer?.handleJoystickMovement(movement)
  }

  const primaryEnabled =
    mobileContext.isSitting || mobileContext.selectedItemType === ItemType.CHAIR
  const secondaryEnabled = [
    ItemType.COMPUTER,
    ItemType.WHITEBOARD,
    ItemType.VENDINGMACHINE,
  ].includes(mobileContext.selectedItemType as ItemType)

  const primaryLabel = mobileContext.isSitting ? '일어서기' : '앉기'

  const secondaryInfo = useMemo(() => {
    switch (mobileContext.selectedItemType) {
      case ItemType.COMPUTER:
        return { label: '컴퓨터', icon: <DesktopWindowsIcon /> }
      case ItemType.WHITEBOARD:
        return { label: '보드', icon: <EditIcon /> }
      case ItemType.VENDINGMACHINE:
        return { label: '자판기', icon: <LocalCafeIcon /> }
      default:
        return { label: '사용', icon: <DesktopWindowsIcon /> }
    }
  }, [mobileContext.selectedItemType])

  const statusText = mobileContext.isSitting
    ? '현재 의자에 앉아 있어요.'
    : mobileContext.selectedItemType === ItemType.CHAIR
      ? '의자가 선택되어 있어요.'
      : mobileContext.selectedItemType === ItemType.COMPUTER
        ? '컴퓨터를 사용할 수 있어요.'
        : mobileContext.selectedItemType === ItemType.WHITEBOARD
          ? '화이트보드를 열 수 있어요.'
          : mobileContext.selectedItemType === ItemType.VENDINGMACHINE
            ? '자판기를 사용할 수 있어요.'
            : '왼쪽 조이스틱으로 이동하고 오른쪽 버튼으로 상호작용하세요.'

  if (!showJoystick || !hasSmallScreen) return null

  return (
    <Overlay>
      {!showChat || !focused ? (
        <JoystickDock>
          <JoystickItem onDirectionChange={handleMovement} />
        </JoystickDock>
      ) : null}

      <ActionDock>
        <StatusPill>{statusText}</StatusPill>

        <ActionButton
          variant={showChat ? 'contained' : 'outlined'}
          color="secondary"
          startIcon={showChat ? <CloseIcon /> : <ForumIcon />}
          onClick={() => {
            const next = !showChat
            dispatch(setShowChat(next))
            dispatch(setFocused(next))
          }}
        >
          {showChat ? '채팅 닫기' : '채팅'}
        </ActionButton>

        <ActionButton
          variant="contained"
          color="secondary"
          startIcon={<EventSeatIcon />}
          disabled={!primaryEnabled}
          onClick={() => {
            game.triggerPrimaryAction()
          }}
        >
          {primaryLabel}
        </ActionButton>

        <ActionButton
          variant="contained"
          color="primary"
          startIcon={secondaryInfo.icon}
          disabled={!secondaryEnabled}
          onClick={() => {
            game.triggerSecondaryAction()
          }}
        >
          {secondaryInfo.label}
        </ActionButton>
      </ActionDock>
    </Overlay>
  )
}
