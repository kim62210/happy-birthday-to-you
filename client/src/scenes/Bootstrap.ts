import Phaser from 'phaser'
import Network from '../services/Network'
import { BackgroundMode } from '../../../types/BackgroundMode'
import store from '../stores'
import { setRoomJoined } from '../stores/RoomStore'
import { CHARACTER_KEYS } from '../data/avatars'

export default class Bootstrap extends Phaser.Scene {
  private preloadComplete = false
  network!: Network

  constructor() {
    super('bootstrap')
  }

  preload() {
    this.load.atlas(
      'cloud_day',
      'assets/background/cloud_day.png',
      'assets/background/cloud_day.json'
    )
    this.load.image('backdrop_day', 'assets/background/backdrop_day.png')
    this.load.atlas(
      'cloud_night',
      'assets/background/cloud_night.png',
      'assets/background/cloud_night.json'
    )
    this.load.image('backdrop_night', 'assets/background/backdrop_night.png')
    this.load.image('sun_moon', 'assets/background/sun_moon.png')

    this.load.tilemapTiledJSON('tilemap', 'assets/map/map.json')
    this.load.image('builder_office_archive', 'assets/archive/Room_Builder_Office.png')
    this.load.image('builder_floors_archive', 'assets/archive/Room_Builder_Floors.png')
    this.load.spritesheet('tiles_wall', 'assets/map/FloorAndGround.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('chairs', 'assets/items/chair.png', {
      frameWidth: 32,
      frameHeight: 64,
    })
    this.load.spritesheet('computers', 'assets/items/computer.png', {
      frameWidth: 48,
      frameHeight: 40,
    })
    this.load.spritesheet('whiteboards', 'assets/items/whiteboard.png', {
      frameWidth: 64,
      frameHeight: 64,
    })
    this.load.spritesheet('vendingmachines', 'assets/items/vendingmachine.png', {
      frameWidth: 48,
      frameHeight: 72,
    })
    this.load.spritesheet('office', 'assets/tileset/Modern_Office_Black_Shadow.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('basement', 'assets/tileset/Basement.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('generic', 'assets/tileset/Generic.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('office_addons', 'assets/tileset/Modern_Office_Addons.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('office_furniture', 'assets/tileset/Office_Furniture.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.image('poster_all', 'assets/birthday/poster_all.png')
    this.load.image('poster_onepiece', 'assets/birthday/poster_onepiece.png')
    this.load.image('poster_demonslayer', 'assets/birthday/poster_demonslayer.png')
    this.load.image('poster_slamdunk', 'assets/birthday/poster_slamdunk.png')
    this.load.image('poster_totoro', 'assets/birthday/poster_totoro.png')

    CHARACTER_KEYS.forEach((characterKey) => {
      this.load.spritesheet(characterKey, `assets/character/${characterKey}.png`, {
        frameWidth: 32,
        frameHeight: 48,
      })
    })

    this.load.on('complete', () => {
      this.preloadComplete = true
      this.launchBackground(store.getState().user.backgroundMode)
    })
  }

  init() {
    this.network = new Network()
  }

  private launchBackground(backgroundMode: BackgroundMode) {
    this.scene.launch('background', { backgroundMode })
  }

  launchGame() {
    if (!this.preloadComplete) {
      this.load.once('complete', () => this.launchGame())
      return
    }
    this.network.webRTC?.checkPreviousPermission()
    this.scene.launch('game', {
      network: this.network,
    })

    // update Redux state
    store.dispatch(setRoomJoined(true))
  }

  changeBackgroundMode(backgroundMode: BackgroundMode) {
    this.scene.stop('background')
    this.launchBackground(backgroundMode)
  }
}
