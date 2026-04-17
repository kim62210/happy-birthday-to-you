import React from 'react'
import styled from 'styled-components'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

import { useAppSelector, useAppDispatch } from '../hooks'
import { closeWhiteboardDialog } from '../stores/WhiteboardStore'
import { ko } from '../i18n/ko'

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  padding: 16px 180px 16px 16px;
  width: 100%;
  height: 100%;
`
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background: var(--ui-surface);
  border-radius: 16px;
  padding: 16px;
  color: var(--ui-text);
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: max-content;
  border: 1px solid rgba(210, 188, 168, 0.24);

  .close {
    position: absolute;
    top: 0px;
    right: 0px;
  }
`

const WhiteboardWrapper = styled.div`
  flex: 1;
  border-radius: 25px;
  overflow: hidden;
  margin-right: 25px;

  iframe {
    width: 100%;
    height: 100%;
    background: #fff;
  }
`

export default function WhiteboardDialog() {
  const whiteboardUrl = useAppSelector((state) => state.whiteboard.whiteboardUrl)
  const dispatch = useAppDispatch()

  return (
    <Backdrop>
      <Wrapper>
        <IconButton
          aria-label={ko.common.close}
          className="close"
          onClick={() => dispatch(closeWhiteboardDialog())}
        >
          <CloseIcon />
        </IconButton>
        {whiteboardUrl && (
          <WhiteboardWrapper>
            <iframe title={ko.whiteboard.title} src={whiteboardUrl} />
          </WhiteboardWrapper>
        )}
      </Wrapper>
    </Backdrop>
  )
}
