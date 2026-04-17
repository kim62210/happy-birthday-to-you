import Phaser from 'phaser'
import { CHARACTER_KEYS } from '../data/avatars'

const IDLE_FRAMES = {
  right: [0, 5],
  up: [6, 11],
  left: [12, 17],
  down: [18, 23],
} as const

const RUN_FRAMES = {
  right: [24, 29],
  up: [30, 35],
  left: [36, 41],
  down: [42, 47],
} as const

const SIT_FRAMES = {
  down: 48,
  left: 49,
  right: 50,
  up: 51,
} as const

export const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {
  const animsFrameRate = 15

  CHARACTER_KEYS.forEach((characterKey) => {
    Object.entries(IDLE_FRAMES).forEach(([direction, [start, end]]) => {
      anims.create({
        key: `${characterKey}_idle_${direction}`,
        frames: anims.generateFrameNames(characterKey, { start, end }),
        repeat: -1,
        frameRate: animsFrameRate * 0.6,
      })
    })

    Object.entries(RUN_FRAMES).forEach(([direction, [start, end]]) => {
      anims.create({
        key: `${characterKey}_run_${direction}`,
        frames: anims.generateFrameNames(characterKey, { start, end }),
        repeat: -1,
        frameRate: animsFrameRate,
      })
    })

    Object.entries(SIT_FRAMES).forEach(([direction, frame]) => {
      anims.create({
        key: `${characterKey}_sit_${direction}`,
        frames: anims.generateFrameNames(characterKey, { start: frame, end: frame }),
        repeat: 0,
        frameRate: animsFrameRate,
      })
    })
  })
}
