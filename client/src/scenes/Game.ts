import Phaser from 'phaser'

// import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from '../anims/CharacterAnims'

import Item from '../items/Item'
import Chair from '../items/Chair'
import Computer from '../items/Computer'
import Whiteboard from '../items/Whiteboard'
import VendingMachine from '../items/VendingMachine'
import '../characters/MyPlayer'
import '../characters/OtherPlayer'
import MyPlayer from '../characters/MyPlayer'
import OtherPlayer from '../characters/OtherPlayer'
import PlayerSelector from '../characters/PlayerSelector'
import Network from '../services/Network'
import { IPlayer } from '../../../types/IOfficeState'
import { PlayerBehavior } from '../../../types/PlayerBehavior'
import { ItemType } from '../../../types/Items'

import store from '../stores'
import { setFocused, setShowChat } from '../stores/ChatStore'
import { openBirthdayImage } from '../stores/BirthdayStore'
import { NavKeys, Keyboard } from '../../../types/KeyboardState'

export default class Game extends Phaser.Scene {
  network!: Network
  private cursors!: NavKeys
  private keyE!: Phaser.Input.Keyboard.Key
  private keyR!: Phaser.Input.Keyboard.Key
  private map!: Phaser.Tilemaps.Tilemap
  myPlayer!: MyPlayer
  private playerSelector!: PlayerSelector
  private otherPlayers!: Phaser.Physics.Arcade.Group
  private otherPlayerMap = new Map<string, OtherPlayer>()
  computerMap = new Map<string, Computer>()
  private whiteboardMap = new Map<string, Whiteboard>()
  private birthdayPosters: Phaser.GameObjects.Sprite[] = []
  private nearbyPoster: Phaser.GameObjects.Sprite | null = null
  private posterHintText: Phaser.GameObjects.Text | null = null

  constructor() {
    super('game')
  }

  private addOfficeTitle() {
    const bannerWidth = 300
    const bannerHeight = 46
    const centerX = 460
    const centerY = 86

    const shadow = this.add
      .graphics()
      .fillStyle(0x000000, 0.18)
      .fillRoundedRect(centerX - bannerWidth / 2 + 3, centerY - bannerHeight / 2 + 4, bannerWidth, bannerHeight, 14)
      .setScrollFactor(0)
      .setDepth(7000)

    const plate = this.add.graphics().setDepth(7001).setScrollFactor(0)
    plate.fillStyle(0xf4efe7, 0.96)
    plate.fillRoundedRect(centerX - bannerWidth / 2, centerY - bannerHeight / 2, bannerWidth, bannerHeight, 14)
    plate.lineStyle(2, 0x6e6255, 0.92)
    plate.strokeRoundedRect(centerX - bannerWidth / 2, centerY - bannerHeight / 2, bannerWidth, bannerHeight, 14)
    plate.lineStyle(3, 0xc78a4a, 0.9)
    plate.strokeLineShape(
      new Phaser.Geom.Line(
        centerX - bannerWidth / 2 + 18,
        centerY + bannerHeight / 2 - 9,
        centerX + bannerWidth / 2 - 18,
        centerY + bannerHeight / 2 - 9
      )
    )

    this.add
      .text(centerX, centerY, '디지털전략센터', {
        fontFamily: 'Noto Sans KR, Apple SD Gothic Neo, Malgun Gothic, sans-serif',
        fontSize: '28px',
        fontStyle: '700',
        color: '#3d3228',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(7002)
  }

  registerKeys() {
    this.cursors = {
      ...this.input.keyboard.createCursorKeys(),
      ...(this.input.keyboard.addKeys('W,S,A,D') as Keyboard),
    }

    // maybe we can have a dedicated method for adding keys if more keys are needed in the future
    this.keyE = this.input.keyboard.addKey('E')
    this.keyR = this.input.keyboard.addKey('R')
    this.input.keyboard.disableGlobalCapture()
    this.input.keyboard.on('keydown-ENTER', (event) => {
      store.dispatch(setShowChat(true))
      store.dispatch(setFocused(true))
    })
    this.input.keyboard.on('keydown-ESC', (event) => {
      store.dispatch(setShowChat(false))
    })
  }

  disableKeys() {
    this.input.keyboard.enabled = false
  }

  enableKeys() {
    this.input.keyboard.enabled = true
  }

  create(data: { network: Network }) {
    if (!data.network) {
      throw new Error('server instance missing')
    } else {
      this.network = data.network
    }

    createCharacterAnims(this.anims)

    this.map = this.make.tilemap({ key: 'tilemap' })
    const FloorAndGround = this.map.addTilesetImage('FloorAndGround', 'tiles_wall')
    const roomBuilderOffice = this.map.addTilesetImage(
      'Room_Builder_Office_Archive',
      'builder_office_archive'
    )
    const roomBuilderFloors = this.map.addTilesetImage(
      'Room_Builder_Floors_Archive',
      'builder_floors_archive'
    )
    const genericVisuals = this.map.addTilesetImage('Generic', 'generic')

    const groundLayer = this.map.createLayer('Ground', FloorAndGround)
    groundLayer.setCollisionByProperty({ collides: true })
    groundLayer.setVisible(false)
    this.map.createLayer('GroundVisual', [roomBuilderOffice, roomBuilderFloors, genericVisuals])
    this.addOfficeTitle()

    // debugDraw(groundLayer, this)

    this.myPlayer = this.add.myPlayer(512, 576, 'adam', this.network.mySessionId)
    this.playerSelector = new PlayerSelector(this, 0, 0, 16, 16)

    // import chair objects from Tiled map to Phaser
    const chairs = this.physics.add.staticGroup({ classType: Chair })
    const chairLayer = this.map.getObjectLayer('Chair')
    chairLayer.objects.forEach((chairObj) => {
      const item = this.addObjectFromTiled(chairs, chairObj, 'chairs', 'chair') as Chair
      // custom properties[0] is the object direction specified in Tiled
      item.itemDirection = chairObj.properties[0].value
    })

    // import computers objects from Tiled map to Phaser
    const computers = this.physics.add.staticGroup({ classType: Computer })
    const computerLayer = this.map.getObjectLayer('Computer')
    computerLayer.objects.forEach((obj, i) => {
      const item = this.addObjectFromTiled(computers, obj, 'computers', 'computer') as Computer
      item.setDepth(item.y + item.height * 0.27)
      const id = `${i}`
      item.id = id
      this.computerMap.set(id, item)
    })

    // import whiteboards objects from Tiled map to Phaser
    const whiteboards = this.physics.add.staticGroup({ classType: Whiteboard })
    const whiteboardLayer = this.map.getObjectLayer('Whiteboard')
    whiteboardLayer.objects.forEach((obj, i) => {
      const item = this.addObjectFromTiled(
        whiteboards,
        obj,
        'whiteboards',
        'whiteboard'
      ) as Whiteboard
      const id = `${i}`
      item.id = id
      this.whiteboardMap.set(id, item)
    })

    // import vending machine objects from Tiled map to Phaser
    const vendingMachines = this.physics.add.staticGroup({ classType: VendingMachine })
    const vendingMachineLayer = this.map.getObjectLayer('VendingMachine')
    vendingMachineLayer.objects.forEach((obj, i) => {
      this.addObjectFromTiled(vendingMachines, obj, 'vendingmachines', 'vendingmachine')
    })

    // import other objects from Tiled map to Phaser
    this.addGroupFromTiled('Wall', 'tiles_wall', 'FloorAndGround', true, false)
    this.addGroupFromTiled('WallDecor', 'office_addons', 'Modern_Office_Addons', false)
    this.addGroupFromTiled('FurnitureCollision', 'office', 'Modern_Office_Black_Shadow', true, false)
    this.addGroupFromTiled('DeskVisuals', 'office_addons', 'Modern_Office_Addons', true)
    this.addGroupFromTiled('MeetingVisuals', 'office_addons', 'Modern_Office_Addons', true)
    this.addGroupFromTiled('Objects', 'office', 'Modern_Office_Black_Shadow', false)
    this.addGroupFromTiled('ObjectsOnCollide', 'office', 'Modern_Office_Black_Shadow', true)
    this.addGroupFromTiled('OfficeAddons', 'office_addons', 'Modern_Office_Addons', false)
    this.addGroupFromTiled('OfficeAddonsOnCollide', 'office_addons', 'Modern_Office_Addons', true)
    this.addGroupFromTiled('GenericObjects', 'generic', 'Generic', false)
    this.addGroupFromTiled('GenericObjectsOnCollide', 'generic', 'Generic', true)
    this.addGroupFromTiled('Basement', 'basement', 'Basement', true)
    this.addGroupFromTiled('OfficeFurniture', 'office_furniture', 'Office_Furniture', true, true)
    this.addGroupFromTiled('OfficeFurnitureVisual', 'office_furniture', 'Office_Furniture', false, true)

    // birthday posters outside the building
    this.createBirthdayPosters()

    this.otherPlayers = this.physics.add.group({ classType: OtherPlayer })

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    this.cameras.main.zoom = isMobile ? 0.75 : 1.5
    this.cameras.main.startFollow(this.myPlayer, true)

    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], groundLayer)
    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], vendingMachines)

    this.physics.add.overlap(
      this.playerSelector,
      [chairs, computers, whiteboards, vendingMachines],
      this.handleItemSelectorOverlap,
      undefined,
      this
    )

    this.physics.add.overlap(
      this.myPlayer,
      this.otherPlayers,
      this.handlePlayersOverlap,
      undefined,
      this
    )

    // register network event listeners
    this.network.onPlayerJoined(this.handlePlayerJoined, this)
    this.network.onPlayerLeft(this.handlePlayerLeft, this)
    this.network.onMyPlayerReady(this.handleMyPlayerReady, this)
    this.network.onMyPlayerVideoConnected(this.handleMyVideoConnected, this)
    this.network.onPlayerUpdated(this.handlePlayerUpdated, this)
    this.network.onItemUserAdded(this.handleItemUserAdded, this)
    this.network.onItemUserRemoved(this.handleItemUserRemoved, this)
    this.network.onChatMessageAdded(this.handleChatMessageAdded, this)
  }

  private createBirthdayPosters() {
    const posterKeys = [
      { key: 'poster_onepiece', src: 'assets/birthday/poster_onepiece.png' },
      { key: 'poster_demonslayer', src: 'assets/birthday/poster_demonslayer.png' },
      { key: 'poster_slamdunk', src: 'assets/birthday/poster_slamdunk.png' },
      { key: 'poster_totoro', src: 'assets/birthday/poster_totoro.png' },
      { key: 'poster_all', src: 'assets/birthday/poster_all.png' },
    ]

    const mapWidth = this.map.widthInPixels
    const buildingBottom = 33 * 32 // y=33 is where outdoor starts
    const posterWidth = 160
    const posterHeight = 106
    const gap = 16

    // row 1: 3 posters
    const row1Y = buildingBottom + 48 + posterHeight / 2
    const row1Total = 3 * posterWidth + 2 * gap
    const row1StartX = (mapWidth - row1Total) / 2 + posterWidth / 2

    for (let i = 0; i < 3; i++) {
      const x = row1StartX + i * (posterWidth + gap)
      const sprite = this.add.sprite(x, row1Y, posterKeys[i].key)
      sprite.setDisplaySize(posterWidth, posterHeight)
      sprite.setDepth(row1Y)
      sprite.setData('posterSrc', posterKeys[i].src)
      sprite.setInteractive()
      this.birthdayPosters.push(sprite)
    }

    // row 2: 2 posters centered
    const row2Y = row1Y + posterHeight + 48
    const row2Total = 2 * posterWidth + gap
    const row2StartX = (mapWidth - row2Total) / 2 + posterWidth / 2

    for (let i = 3; i < 5; i++) {
      const x = row2StartX + (i - 3) * (posterWidth + gap)
      const sprite = this.add.sprite(x, row2Y, posterKeys[i].key)
      sprite.setDisplaySize(posterWidth, posterHeight)
      sprite.setDepth(row2Y)
      sprite.setData('posterSrc', posterKeys[i].src)
      sprite.setInteractive()
      this.birthdayPosters.push(sprite)
    }

    // click to open full image
    this.birthdayPosters.forEach((poster) => {
      poster.on('pointerdown', () => {
        store.dispatch(openBirthdayImage(poster.getData('posterSrc')))
      })
    })
  }

  private handleItemSelectorOverlap(playerSelector, selectionItem) {
    const currentItem = playerSelector.selectedItem as Item
    // currentItem is undefined if nothing was perviously selected
    if (currentItem) {
      // if the selection has not changed, do nothing
      if (currentItem === selectionItem || currentItem.depth >= selectionItem.depth) {
        return
      }
      // if selection changes, clear pervious dialog
      if (this.myPlayer.playerBehavior !== PlayerBehavior.SITTING) currentItem.clearDialogBox()
    }

    // set selected item and set up new dialog
    playerSelector.selectedItem = selectionItem
    selectionItem.onOverlapDialog()
  }

  private addObjectFromTiled(
    group: Phaser.Physics.Arcade.StaticGroup,
    object: Phaser.Types.Tilemaps.TiledObject,
    key: string,
    tilesetName: string
  ) {
    const actualX = object.x! + object.width! * 0.5
    const actualY = object.y! - object.height! * 0.5
    const obj = group
      .get(actualX, actualY, key, object.gid! - this.map.getTileset(tilesetName).firstgid)
      .setDepth(actualY)
    return obj
  }

  private addGroupFromTiled(
    objectLayerName: string,
    key: string,
    tilesetName: string,
    collidable: boolean,
    visible = true
  ) {
    const group = this.physics.add.staticGroup()
    const objectLayer = this.map.getObjectLayer(objectLayerName)
    objectLayer.objects.forEach((object) => {
      const actualX = object.x! + object.width! * 0.5
      const actualY = object.y! - object.height! * 0.5
      const sprite = group
        .get(actualX, actualY, key, object.gid! - this.map.getTileset(tilesetName).firstgid)
        .setDepth(actualY)
      if (!visible) sprite.setVisible(false)
    })
    if (this.myPlayer && collidable)
      this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], group)
  }

  // function to add new player to the otherPlayer group
  private handlePlayerJoined(newPlayer: IPlayer, id: string) {
    const otherPlayer = this.add.otherPlayer(newPlayer.x, newPlayer.y, 'adam', id, newPlayer.name)
    this.otherPlayers.add(otherPlayer)
    this.otherPlayerMap.set(id, otherPlayer)
  }

  // function to remove the player who left from the otherPlayer group
  private handlePlayerLeft(id: string) {
    if (this.otherPlayerMap.has(id)) {
      const otherPlayer = this.otherPlayerMap.get(id)
      if (!otherPlayer) return
      this.otherPlayers.remove(otherPlayer, true, true)
      this.otherPlayerMap.delete(id)
    }
  }

  private handleMyPlayerReady() {
    this.myPlayer.readyToConnect = true
  }

  private handleMyVideoConnected() {
    this.myPlayer.videoConnected = true
  }

  // function to update target position upon receiving player updates
  private handlePlayerUpdated(field: string, value: number | string, id: string) {
    const otherPlayer = this.otherPlayerMap.get(id)
    otherPlayer?.updateOtherPlayer(field, value)
  }

  private handlePlayersOverlap(myPlayer, otherPlayer) {
    otherPlayer.makeCall(myPlayer, this.network?.webRTC)
  }

  private handleItemUserAdded(playerId: string, itemId: string, itemType: ItemType) {
    if (itemType === ItemType.COMPUTER) {
      const computer = this.computerMap.get(itemId)
      computer?.addCurrentUser(playerId)
    } else if (itemType === ItemType.WHITEBOARD) {
      const whiteboard = this.whiteboardMap.get(itemId)
      whiteboard?.addCurrentUser(playerId)
    }
  }

  private handleItemUserRemoved(playerId: string, itemId: string, itemType: ItemType) {
    if (itemType === ItemType.COMPUTER) {
      const computer = this.computerMap.get(itemId)
      computer?.removeCurrentUser(playerId)
    } else if (itemType === ItemType.WHITEBOARD) {
      const whiteboard = this.whiteboardMap.get(itemId)
      whiteboard?.removeCurrentUser(playerId)
    }
  }

  private handleChatMessageAdded(playerId: string, content: string) {
    const otherPlayer = this.otherPlayerMap.get(playerId)
    otherPlayer?.updateDialogBubble(content)
  }

  update(t: number, dt: number) {
    if (this.myPlayer && this.network) {
      this.playerSelector.update(this.myPlayer, this.cursors)
      this.myPlayer.update(this.playerSelector, this.cursors, this.keyE, this.keyR, this.network)
    }
  }

  getSelectedItem() {
    return this.playerSelector.selectedItem as Item | undefined
  }

  triggerPrimaryAction() {
    if (!this.myPlayer || !this.network || !this.cursors) return false
    return this.myPlayer.triggerPrimaryAction(this.playerSelector, this.cursors, this.network)
  }

  triggerSecondaryAction() {
    if (!this.myPlayer || !this.network) return false
    return this.myPlayer.triggerSecondaryAction(this.playerSelector, this.network)
  }
}
