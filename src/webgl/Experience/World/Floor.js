import * as THREE from 'three'
import Experience from '../Experience'
import mittInstance from '@/core/lib/MittInstance'
import { gsap } from 'gsap'
import {
  KICKFLIP_EASY,
  GRINDFLIP_EASY,
  SHOVEIT_EASY,
  BACK360_EASY,
  FB270_EASY,
} from '@/data/figures'

export default class Floor {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.resources = this.experience.resources
    this.materialFactory = this.experience.materialFactory
    this.figuresInterval = 6
    this.tilesMultiplicator = 2
    // this.scene.add(gridHelper)

    this.setGeometry()
    this.setModules()
    this.setMesh()
    this.setMaterial()

    this.setMittActions()
  }
  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 10)
  }
  setMaterial() {
    this.skateModules.forEach((module) => {
      module.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = this.materialFactory.getMaterial(child.name)
          // child.castShadow = true
          child.receiveShadow = true
          // console.log(child.material)
        }
      })
    })
  }
  setMittActions() {
    mittInstance.on('Start Skate Animation', () => {
      this.time.timeScale = 1
    })

    mittInstance.on('Before Figure Game', () => {
      this.sloMo = gsap.to(this.time, {
        timeScale: 0.2,
        duration: 1.5,
      })
    })

    mittInstance.on('Start Figure Game', () => {
      this.time.timeScale = 0
    })
    mittInstance.on('Skate Figure Anim 3D', (data) => {
      if (data.isValid) {
        var animationDuration =
          this.experience.world.skater.animation.actions[data.animation.perso].getClip()
            .duration
        this.figuresInterval = animationDuration
        this.tilesMultiplicator = 1
        gsap.to(this.time, {
          timeScale: 1.5,
          duration: 1,
        })
      } else {
        gsap.to(this.time, {
          timeScale: 1,
          duration: 1,
        })
        this.floor.position.z -= 10
        mittInstance.emit('Skate Figure Anim 3D End')
      }
    })
    mittInstance.on('Skate Figure Anim 3D End', () => {
      this.figuresInterval = 6
      this.tilesMultiplicator = 2
      gsap.to(this.time, {
        timeScale: 1,
        duration: 1,
      })
    })
    mittInstance.on('Sport finished', () => {
      gsap.to(this.modelVelocity, {
        z: 0,
        duration: 1,
      })
    })
  }

  setModules() {
    const storedFigures = localStorage.getItem('modules')
    let figures = [FB270_EASY, KICKFLIP_EASY, GRINDFLIP_EASY, SHOVEIT_EASY, BACK360_EASY]

    if (storedFigures) {
      figures = JSON.parse(storedFigures)
    }

    this.skateModules = figures.map((item) => {
      return this.experience.resources.items[item.module]
    })
    // this.skateModules[0].scene.position.y -= 0.5
  }

  setMesh() {
    var colors = [0xea4050, 0x3656ff, 0xfff965]
    var tilesInterval = 3
    var nbFigures = 5
    this.floor = new THREE.Group()
    this.floor.add(this.experience.world.skatepark.model)
    var module_index = 0
    var sol = []
    for (let i = 0; i < tilesInterval * nbFigures; i += tilesInterval) {
      var module = this.skateModules[module_index].scene
      this.floor.add(module)
      if (module_index < 3 && module_index > 0) {
        module.position.z = i * 10
      } else {
        module.position.z = i * 10
      }
      this.scene.add(this.floor)
      module_index += 1
      // console.log(module.position.z)
    }
    // for (let i = 1; i < 20; i++) {
    //   this.mesh = new THREE.Mesh(
    //     this.geometry,
    //     new THREE.MeshStandardMaterial({
    //       color: colors[i % 3],
    //     }),
    //   )
    //   this.mesh.rotation.x = -Math.PI * 0.5
    //   this.mesh.receiveShadow = true
    //   this.mesh.position.z = (i - 1) * 10
    //   this.floor.add(this.mesh)
    // }
  }

  // setMesh() {
  //   var colors = [0xea4050, 0x3656ff, 0xfff965]
  //   this.floor = new THREE.Group()
  //   var module_index = 0
  //   var sol = []
  //   this.scene.add(this.floor)
  // }
  update() {
    // console.log(this.time.timeScale)
    this.modelVelocity = new THREE.Vector3(
      0,
      0,
      -(10 / this.figuresInterval) *
        (1 / 60) *
        this.time.timeScale *
        this.tilesMultiplicator,
    )
    this.floor.position.add(this.modelVelocity)
  }

  updateModules(figures) {
    this.setModules(figures)
    this.setMesh()
    this.setMaterial()
  }
}
