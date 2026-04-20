import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BirthdayState {
  imageOpen: boolean
  currentImage: string
}

const initialState: BirthdayState = {
  imageOpen: false,
  currentImage: '',
}

export const birthdaySlice = createSlice({
  name: 'birthday',
  initialState,
  reducers: {
    openBirthdayImage: (state, action: PayloadAction<string>) => {
      state.imageOpen = true
      state.currentImage = action.payload
    },
    closeBirthdayImage: (state) => {
      state.imageOpen = false
      state.currentImage = ''
    },
  },
})

export const { openBirthdayImage, closeBirthdayImage } = birthdaySlice.actions
export default birthdaySlice.reducer
