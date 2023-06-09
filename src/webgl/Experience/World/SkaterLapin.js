import * as THREE from 'three'
import Experience from '../Experience'
import mittInstance from '@/core/lib/MittInstance'
import { gsap } from 'gsap'
import { FIGURES } from '@/data/figures'

export default class SkaterLapin {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.time = this.experience.time
    this.debug = this.experience.debug
    this.materialFactory = this.experience.materialFactory

    //Setup
    this.resource = this.resources.items.skaterFinal

    this.slowmotionFactor = { value: 0.001 }
    this.cameraOffset = new THREE.Vector3(-2, 1, -4)
    this.lookAtOffset = new THREE.Vector3(0, 0, 5)
    this.started = false
    this.shakeStrength = 1

    this.setModel()
    this.setMaterials()
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('SkaterLapin')
      this.setDebug()
    }
    this.setAnimation()
    this.setMittActions()
  }

  setModel() {
    this.model = this.resource.scene
    this.model.position.set(0, 1.9, -25)
    this.modelVelocity = new THREE.Vector3(0, 0, 0)

    this.scene.add(this.model)

    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        // child.receiveShadow = true
      }
    })
  }

  setMaterials() {
    this.model.traverse((child) => {
      if (child.isMesh) {
        child.material = this.materialFactory.getMaterial(child.name)
        // console.log(child)
      }
    })
  }

  setDebug() {
    this.debugFolder.add(this.resource.scene.position, 'x', -10, 10, 0.1).name('Skater X')
    this.debugFolder.add(this.resource.scene.position, 'y', -1, 20, 0.01).name('Skater Y')
    this.debugFolder
      .add(this.resource.scene.position, 'z', -300, 300, 0.01)
      .name('Skater Z')

    this.debugFolder.add(this.cameraOffset, 'x', -10, 10, 0.1).name('Camera Offset X')
    this.debugFolder.add(this.cameraOffset, 'y', -10, 10, 0.1).name('Camera Offset Y')
    this.debugFolder.add(this.cameraOffset, 'z', -10, 10, 0.1).name('Camera Offset Z')

    const debugObject = {
      changeCameraIntro: () => {
        this.changeCameraIntro()
      },
      changeCameraEnd: () => {
        this.changeCameraEnd()
      },
    }
    this.debugFolder.add(debugObject, 'changeCameraIntro')
    this.debugFolder.add(debugObject, 'changeCameraEnd')
  }

  changeCameraEnd() {
    var cameraMovement = gsap.timeline()
    cameraMovement.to(this.lookAtOffset, {
      z: 0,
      y: 1,
      x: 4,
      duration: 2,
      ease: 'Power1.easeIn',
    })
    cameraMovement.to(
      this.cameraOffset,
      {
        x: -4,
        y: 1,
        z: 0,
        duration: 1.5,
        ease: 'Power3.easeIn',
      },
      '<',
    )
    cameraMovement.to(
      this.cameraOffset,
      {
        x: -4,
        y: 1,
        z: 4,
        duration: 1.5,
        ease: 'Power3.easeOut',
      },
      '>-0.2',
    )
  }
  changeCameraIntro() {
    var cameraMovement = gsap.timeline()
    cameraMovement.to(this.cameraOffset, {
      x: -2,
      y: 0,
      z: -1,
      duration: 10,
      ease: 'Power3.easeOut',
    })
    cameraMovement.to(
      this.lookAtOffset,
      {
        z: 0.5,
        duration: 10,
        ease: 'Power3.easeOut',
      },
      '<',
    )
  }

  setAnimation() {
    this.animation = {}
    this.animation.mixer = new THREE.AnimationMixer(this.model)
    this.animation.actions = {}

    this.resource.animations.forEach((animation) => {
      if (animation.name.includes('P_') || animation.name.includes('Board')) {
      }
      this.animation.actions[animation.name] = this.animation.mixer.clipAction(
        THREE.AnimationClip.findByName(this.resource.animations, animation.name),
      )
      if (animation.name != 'P_Cruise' && animation.name != 'Board_Pose') {
        this.animation.actions[animation.name].setLoop(THREE.LoopOnce)
      }
      if (animation.name == 'P_Debut_Epreuve') {
        this.animation.actions[animation.name].setLoop(THREE.LoopRepeat)
      }
    })
    this.animation.actions.current = this.animation.actions['P_Cruise']
    this.animation.actions['P_Debut_Epreuve'].play()
    this.animation.actions['P_Debut_Epreuve'].paused = true

    this.animation.play = (name) => {
      // console.log(name)
      const newAction = this.animation.actions[name]
      const oldAction = this.animation.actions.current

      newAction.reset()
      newAction.play()
      newAction.crossFadeFrom(
        oldAction,
        name == 'Move_P_270Slide' || name == 'Move_Board_270Slide' ? 0 : 0.5,
      )

      // setTimeout(() => {
      //   oldAction.reset()
      //   oldAction.play()
      //   oldAction.crossFadeFrom(newAction, 0.1)
      // }, parseInt(this.animation.actions[name].getClip().duration * 1000) - 100)
    }

    this.animation.mixer.addEventListener('finished', (e) => {
      if (!e.action.getClip().name.includes('Push')) {
        this.animation.actions.current.reset()
        this.animation.actions.current.play()
      }
      if (e.action.getClip().name.includes('Move_P')) {
        mittInstance.emit('Skate Figure Anim 3D End')
      }
      // console.log('Action terminée : ', e.action.getClip().name)
    })

    // Debug Part
    if (this.debug.active) {
      const debugObject = {
        playCruise: () => {
          this.animation.actions['P_Cruise'].reset()
          this.animation.actions['P_Cruise'].play()
          this.animation.actions['Board_Pose'].reset()
          this.animation.actions['Board_Pose'].play()
        },
        playRail: () => {
          this.animation.play('Board_KickRail')
          this.animation.play('P_Kicrail')
        },
        playPush: () => {
          this.animation.play('P_Push')
        },
        playDoublePush: () => {
          this.animation.play('P_PushDouble')
        },
        play270Slide: () => {
          this.animation.play('Move_P_270Slide')
          this.animation.play('Move_Board_270Slide')
        },
        playBack360: () => {
          this.animation.play('Move_P_Back3')
          this.animation.play('Move_Board_Back3')
        },
        playGrindFlip: () => {
          this.animation.play('Move_P_Grind_Flip')
          this.animation.play('Move_Board_Grind_Flip')
        },
        playKickFlip: () => {
          this.animation.play('Move_Board_Kickflip')
          this.animation.play('Move_P_Kickflip')
        },
        playShoveIt: () => {
          this.animation.play('Move_P_ShoveIt')
          this.animation.play('Move_Board_ShoveIt')
        },
        playDebutEpreuve: () => {
          this.animation.play('P_Debut_Epreuve')
        },
        playFinEpreuve: () => {
          this.animation.play('P_Fin_Epreuve')
          this.animation.play('Board_Fin_Epreuve')
        },
      }
      this.debugFolder.add(debugObject, 'playCruise')
      this.debugFolder.add(debugObject, 'playPush')
      this.debugFolder.add(debugObject, 'playDoublePush')
      this.debugFolder.add(debugObject, 'play270Slide')
      this.debugFolder.add(debugObject, 'playBack360')
      this.debugFolder.add(debugObject, 'playGrindFlip')
      this.debugFolder.add(debugObject, 'playKickFlip')
      this.debugFolder.add(debugObject, 'playShoveIt')
      this.debugFolder.add(debugObject, 'playDebutEpreuve')
      this.debugFolder.add(debugObject, 'playFinEpreuve')
    }
  }

  setMittActions() {
    mittInstance.on('Start Skate Animation', () => {
      // console.log('Start Skate Animation')
      this.animation.play('P_PushDouble')
      // gsap.to(this.modelVelocity, {
      //   z: 0.2,
      //   duration: 3,
      // })
      this.animation.actions['P_Debut_Epreuve'].paused = false
      this.animation.actions['P_Debut_Epreuve'].fadeOut(0.5)
      setTimeout(() => {
        this.animation.actions.current.reset()
        this.animation.actions.current.play()
        this.animation.actions.current.crossFadeFrom(
          this.animation.actions['P_PushDouble'],
          0.2,
        )
      }, parseInt(this.animation.actions['P_PushDouble'].getClip().duration * 1000) - 200)
    })

    mittInstance.on('Before Figure Game', () => {
      this.changeCameraIntro()
    })

    mittInstance.on('Start Figure Game', (e) => {
      // console.log('Start Figure Game')
      // console.log('Data from emit : ', e.figure)
      // const figure = FIGURES.find((figure) => figure.name === e.figure).anims
      // this.animation.play(figure.board)
      // this.animation.play(figure.perso)
      // console.log('Figure :', figure)
      // gsap.to(this.slowmotionFactor, {
      //   value: 0,
      //   duration: 0,
      //   ease: 'Power3.easeOut',
      // })
    })

    mittInstance.on('Skate Figure Anim 3D', (data) => {
      this.model.position.y = 0
      if (data.isValid) {
        this.animation.play(data.animation.board)
        this.animation.play(data.animation.perso)
        var animDuration = this.animation.actions[data.animation.perso].getClip().duration
        gsap.to(this.slowmotionFactor, {
          value: 0.001,
          duration: 0,
        })
        gsap.to(this.cameraOffset, {
          x: -2,
          z: -4,
          y: 1,
          duration: 0.5,
          ease: 'Power3.easeIn',
        })
        gsap.to(this.lookAtOffset, {
          z: 5,
          duration: 0.5,
          ease: 'Power3.easeIn',
        })
      } else {
        gsap.to(this.cameraOffset, {
          x: -2,
          z: -4,
          y: 1,
          duration: 0,
          ease: 'Power3.easeIn',
        })
        gsap.to(this.lookAtOffset, {
          z: 5,
          duration: 0,
          ease: 'Power3.easeIn',
        })
      }
    })
    mittInstance.on('Skate Figure Anim 3D End', () => {
      this.model.position.y = -0.035
      this.animation.play('P_Push')
      setTimeout(() => {
        this.animation.actions.current.reset()
        this.animation.actions.current.play()
        this.animation.actions.current.crossFadeFrom(
          this.animation.actions['P_Push'],
          0.2,
        )
      }, this.animation.actions['P_Push'].getClip().duration * 1000 - 400)
    })
    mittInstance.on('Sport finished', () => {
      // console.log('Sport finished')
      gsap.to(this.modelVelocity, {
        z: 0.0,
        duration: 1,
        onComplete: () => {
          this.animation.play('P_Fin_Epreuve')
          this.animation.play('Board_Fin_Epreuve')
          this.changeCameraEnd()
          setTimeout(() => {
            this.animation.actions['P_Fin_Epreuve'].paused = true
            this.animation.actions['Board_Fin_Epreuve'].paused = true
            this.time.timeScale = 0
          }, this.animation.actions['Board_Fin_Epreuve'].getClip().duration * 1000 - 17)
        },
      })
    })
  }

  update() {
    const modelPosition = this.model.position
    if (this.started) {
      this.model.position.add(this.modelVelocity)
      const oldCamPos = new THREE.Vector3()
      oldCamPos.copy(this.experience.camera.instance.position)
      const cameraPosition = new THREE.Vector3()
      cameraPosition
        .copy(modelPosition)
        .add(this.cameraOffset)
        .add(this.model.getObjectByName('Ctrl_Hips').position)
      const smoothedCamPos = oldCamPos.lerp(cameraPosition, 0.7)
      this.experience.camera.instance.position.copy(smoothedCamPos)
    }
    this.animation.mixer.update(this.time.delta * this.slowmotionFactor.value)
    const cameraTarget = new THREE.Vector3()
    cameraTarget.copy(modelPosition)
    cameraTarget.add(this.lookAtOffset)
    this.experience.camera.instance.lookAt(cameraTarget)
  }
}
