import * as THREE from 'three'
import Experience from '../Experience'
import mittInstance from '@/core/lib/MittInstance'

export default class SkaterLapin {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.time = this.experience.time
    this.debug = this.experience.debug

    //Setup
    this.resource = this.resources.items.skater

    this.slowmotionFactor = 0.001
    this.cameraOffset = new THREE.Vector3(-2, 1, -4)

    this.setModel()
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('SkaterLapin')
      this.setDebug()
    }
    this.setAnimation()
  }

  setModel() {
    this.model = this.resource.scene
    this.model.position.set(0, 0, 0)
    this.modelVelocity = new THREE.Vector3(0, 0, 0)
    // this.model.scale.set(0.5, 0.5, 0.5)

    this.scene.add(this.model)

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
      }
    })
  }

  setDebug() {
    this.debugFolder.add(this.resource.scene.position, 'x', -10, 10, 0.1).name('Skater X')
    this.debugFolder.add(this.resource.scene.position, 'y', -10, 10, 0.1).name('Skater Y')
    this.debugFolder.add(this.resource.scene.position, 'z', -10, 10, 0.1).name('Skater Z')

    this.debugFolder.add(this.cameraOffset, 'x', -10, 10, 0.1).name('Camera Offset X')
    this.debugFolder.add(this.cameraOffset, 'y', -10, 10, 0.1).name('Camera Offset Y')
    this.debugFolder.add(this.cameraOffset, 'z', -10, 10, 0.1).name('Camera Offset Z')
  }

  setAnimation() {
    this.animation = {}
    this.animation.mixer = new THREE.AnimationMixer(this.model)
    this.animation.actions = {}

    this.resource.animations.forEach((animation) => {
      this.animation.actions[animation.name] = this.animation.mixer.clipAction(
        THREE.AnimationClip.findByName(this.resource.animations, animation.name),
      )
      if (animation.name != 'P_Cruise' && animation.name != 'Board_Pose') {
        this.animation.actions[animation.name].setLoop(THREE.LoopOnce)
      }
    })
    this.animation.actions.current = this.animation.actions['P_Cruise']
    // this.animation.actions.current.play()

    console.log(this.animation.actions)

    this.animation.play = (name) => {
      const newAction = this.animation.actions[name]
      const oldAction = this.animation.actions.current

      newAction.reset()
      newAction.play()
      newAction.crossFadeFrom(oldAction, 0.5)

      setTimeout(() => {
        oldAction.reset()
        oldAction.play()
        oldAction.crossFadeFrom(newAction, 0.2)
      }, parseInt(this.animation.actions[name].getClip().duration * 1000) - 200)
    }

    this.animation.mixer.addEventListener('finished', (e) => {
      // console.log('FInished')
    })

    // Debug Part
    if (this.debug.active) {
      const debugObject = {
        playOllie: () => {
          this.animation.play('Board_Olie')
          this.animation.play('P_Olie')
        },
        playCruise: () => {
          this.animation.actions['P_Cruise'].reset()
          this.animation.actions['P_Cruise'].play()
          this.animation.actions['P_Cruise'].crossFadeFrom(
            this.animation.actions['P_Cruise'],
            0.5,
          )
        },
        playRail: () => {
          this.animation.play('Board_KickRail')
          this.animation.play('P_Kickrail')
        },
        playPush: () => {
          this.animation.play('P_Push')
        },
        playDoublePush: () => {
          this.animation.play('P_DoublePush')
        },
      }
      this.debugFolder.add(debugObject, 'playOllie')
      this.debugFolder.add(debugObject, 'playCruise')
      this.debugFolder.add(debugObject, 'playPush')
      this.debugFolder.add(debugObject, 'playDoublePush')
      this.debugFolder.add(debugObject, 'playRail')
    }
  }

  checkCollision() {
    var skaterBox = new THREE.Box3().setFromObject(this.model) // Boîte englobante du skater
    var rampBox = new THREE.Box3().setFromObject(this.experience.world.skatepark.model) // Boîte englobante de la rampe

    if (skaterBox.intersectsBox(rampBox)) {
      // Collision détectée
      return true
    } else {
      return false
    }
  }
  update() {
    if (this.checkCollision()) {
      console.log('Colision')
      // this.modelVelocity.y = 0.01
    } else {
      // this.modelVelocity.y = -0.01
    }
    this.model.position.add(this.modelVelocity)
    const oldCamPos = new THREE.Vector3()
    oldCamPos.copy(this.experience.camera.instance.position)

    const modelPosition = this.model.position
    const cameraPosition = new THREE.Vector3()
    cameraPosition
      .copy(modelPosition)
      .add(this.cameraOffset)
      .add(this.model.getObjectByName('Ctrl_Hips').position)

    const cameraTarget = new THREE.Vector3()
    cameraTarget.copy(modelPosition)
    cameraTarget.z += 5

    const smoothedCamPos = oldCamPos.lerp(cameraPosition, 1)

    this.animation.mixer.update(this.time.delta * this.slowmotionFactor)
    this.experience.camera.instance.position.copy(smoothedCamPos)
    this.experience.camera.instance.lookAt(cameraTarget)
  }
}
