import { createTheme } from '@mui/material/styles'

const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d3bda6',
    },
    secondary: {
      main: '#c86458',
    },
    background: {
      default: '#121110',
      paper: '#2c2a28',
    },
    text: {
      primary: '#f5ede4',
      secondary: '#d0c6bb',
    },
  },
  typography: {
    fontFamily:
      "'Noto Sans KR', 'Pretendard Variable', Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
  },
})

export default muiTheme
