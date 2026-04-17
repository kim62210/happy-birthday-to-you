import Adam from '../images/login/Adam_login.png'
import Ash from '../images/login/Ash_login.png'
import Lucy from '../images/login/Lucy_login.png'
import Nancy from '../images/login/Nancy_login.png'

import adamNavy from '../images/login/adam_navy.png'
import adamSand from '../images/login/adam_sand.png'
import ashCharcoal from '../images/login/ash_charcoal.png'
import ashMint from '../images/login/ash_mint.png'
import lucyRose from '../images/login/lucy_rose.png'
import lucyIndigo from '../images/login/lucy_indigo.png'
import nancyGold from '../images/login/nancy_gold.png'
import nancyTeal from '../images/login/nancy_teal.png'

export const AVATARS = [
  { name: 'adam', img: Adam, label: 'Adam Classic' },
  { name: 'adam_navy', img: adamNavy, label: 'Adam Navy' },
  { name: 'adam_sand', img: adamSand, label: 'Adam Sand' },
  { name: 'ash', img: Ash, label: 'Ash Classic' },
  { name: 'ash_charcoal', img: ashCharcoal, label: 'Ash Charcoal' },
  { name: 'ash_mint', img: ashMint, label: 'Ash Mint' },
  { name: 'lucy', img: Lucy, label: 'Lucy Classic' },
  { name: 'lucy_rose', img: lucyRose, label: 'Lucy Rose' },
  { name: 'lucy_indigo', img: lucyIndigo, label: 'Lucy Indigo' },
  { name: 'nancy', img: Nancy, label: 'Nancy Classic' },
  { name: 'nancy_gold', img: nancyGold, label: 'Nancy Gold' },
  { name: 'nancy_teal', img: nancyTeal, label: 'Nancy Teal' },
] as const

export const CHARACTER_KEYS = AVATARS.map((avatar) => avatar.name)
