<template>
  <div class="skate-container" ref="patternRef" :class="!isAutoDrawing && 'is-active'">
    <div
      class="skate-layout"
      :class="[!isAutoDrawing && 'is-active', isAutoDrawing && 'is-disabled']"
    >
      <span v-for="n in 24" class="layout-cell" />
    </div>
    <div
      class="pattern-wrapper"
      :style="{ pointerEvents: isDisableClick ? 'none' : 'initial' }"
      draggable="false"
      ref="wrapperBox"
      @mousemove="handleMouseMove($event)"
    >
      <svg class="lines" draggable="false">
        <line
          v-for="(line, index) in lines"
          :key="line.id"
          stroke-linecap="round"
          draggable="false"
          :class="line.isTracing && 'is-active'"
          :ref="(ref: any) => handleSetRefLines(index, ref)"
          :x1="`${line.coords.start.x}px`"
          :y1="`${line.coords.start.y}px`"
          :x2="`${line.coords.end.x}px`"
          :y2="`${line.coords.end.y}px`"
        />
      </svg>
      <div
        class="pattern-container"
        ref="gridRef"
        draggable="false"
        :style="`grid-template-columns: repeat(${numCols}, 1fr); grid-template-rows: repeat(${numRows}, 1fr);`"
      >
        <div
          v-for="(point, index) in points"
          :key="point.id"
          class="pattern-point__zone"
          draggable="false"
          :class="[point.isActive && 'is-active', isAutoDrawing && 'is-disabled']"
          :ref="(ref: any) => handleSetRefPoints(index, ref)"
          @mouseover="handleMouseOver(point)"
          @mousedown="handleMouseDown(point, $event)"
        >
          <span class="pattern-point" draggable="false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import mittInstance from '@/core/lib/MittInstance'
import { onMounted, ref, watch } from 'vue'
import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/all'
import { getIsArraysEqual } from '@/core/utils/functions'
import { Line, Point } from '@/core/types/IPattern'
import { useResizeObserver } from '@vueuse/core'
import { CustomEase } from 'gsap/all'
import { Howl, Howler } from 'howler'
gsap.registerPlugin(DrawSVGPlugin)
gsap.registerPlugin(CustomEase)
CustomEase.create('shakeEasing', '.36,.07,.19,.97')

interface Props {
  patternToDo: number[][]
  isAutoDrawing?: boolean
  onDrawEnd?: Function
  isRepeat?: boolean
}

const props = defineProps<Props>()

const numRows = ref(5) // Nombre de lignes dans la grille
const numCols = ref(3) // Nombre de colonnes dans la grille
const currentLine = ref<any>()
const wrapperBox = ref<HTMLDivElement | null>(null)
const lineRefs: SVGLineElement[] = [] // Ref des Point dans le DOM
const pointRefs: Element[] = [] // Ref des Point dans le DOM
const isDragging = ref(false)
const isDisableClick = ref(false)
const gridRef = ref<any>(null)
const currentPattern = ref<number[][]>([])
const donePatterns = ref<number[]>([])
const points = ref<Point[]>([])
const lines = ref<Line[]>([])
const patternRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  initPointsAndLines()
})

const dotSound = new Howl({
  src: ['/sounds/ui-sounds/dot-sound.mp3'],
  volume: 0.7,
})

const validPatternSound = new Howl({
  src: ['/sounds/ui-sounds/pattern-correct.mp3'],
  volume: 0.5,
})

const wrongPatternSound = new Howl({
  src: ['/sounds/ui-sounds/pattern-wrong.mp3'],
  volume: 0.5,
})

const pitchedDotSound = () => {
  dotSound.rate(currentPattern.value.flat(Infinity).length / 2)
  dotSound.play()
}

const resetPointsAndLines = () => {
  lines.value = lines.value.map((line) => ({
    ...line,
    isTracing: false,
    // coords: { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } },
  }))

  points.value = points.value.map((point, index) => {
    const { x, y } = getPointCoords(index)
    return { ...point, isActive: false, coords: { x, y } }
  })
}

const clearPattern = () => {
  currentPattern.value = []
  donePatterns.value = []
  resetPointsAndLines()
}

watch(
  () => props.patternToDo,
  () => {
    clearPattern()
    if (!props.patternToDo.length) return
    if (props.isAutoDrawing) {
      setTimeout(() => {
        setupAnimLines()
      }, 600)
    } else {
      isDisableClick.value = false
      donePatterns.value = []
    }
  },
  { immediate: true, deep: true },
)

watch(
  () => props.isAutoDrawing,
  () => {
    if (!props.isAutoDrawing) {
      isDisableClick.value = false
      clearPattern()
    }
  },
)

useResizeObserver(wrapperBox, () => {
  resetPointsAndLines()
})

window.addEventListener('resize', () => {
  resetPointsAndLines()
})

const initPointsAndLines = () => {
  points.value = []
  lines.value = []

  for (let i = 0; i < numRows.value * numCols.value; i++) {
    points.value.push({
      id: i,
      isActive: false,
      coords: { x: 0, y: 0 },
    })
  }

  for (let i = 0; i < numRows.value * numCols.value; i++) {
    lines.value.push({
      id: i,
      isTracing: false,
      coords: { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } },
    })
  }
}

const handleSetRefLines = (index: number, ref: SVGLineElement) => {
  lineRefs[index] = ref
}

const handleSetRefPoints = (index: number, ref: Element) => {
  pointRefs[index] = ref
  if (points.value[index].coords.x === 0) {
    setPoint(index)
  }
}

const getPointCoords = (index: number) => {
  const wrapperBoxLeft = wrapperBox.value?.getBoundingClientRect().left || 0
  const wrapperBoxTop = wrapperBox.value?.getBoundingClientRect().top || 0
  const pointBounds = pointRefs[index]?.getBoundingClientRect()
  const x = pointBounds?.left + pointBounds?.width / 2 - wrapperBoxLeft
  const y = pointBounds?.top + pointBounds?.height / 2 - wrapperBoxTop

  return { x, y }
}

const setPoint = (pointIndex: number) => {
  const { x, y } = getPointCoords(pointIndex)

  points.value[pointIndex] = {
    ...points.value[pointIndex],
    coords: { x, y },
  }
}

const setLine = (lineIndex: number, pointA: any, pointB: any) => {
  lines.value[lineIndex] = {
    ...lines.value[lineIndex],
    isTracing: false,
    coords: {
      start: { x: pointA.coords.x, y: pointA.coords.y },
      end: { x: pointB.coords.x, y: pointB.coords.y },
    },
  }
}

const checkIfPatternWrong = () => {
  return !props.patternToDo.some((pattern) =>
    currentPattern.value[currentPattern.value.length - 1].every(
      (point, index) => point === pattern[index],
    ),
  )
}

const checkIfFullPatternValid = () => {
  return props.patternToDo.every((pattern) =>
    currentPattern.value.some((currPattern) => getIsArraysEqual(pattern, currPattern)),
  )
}

const checkIfPatternValid = () => {
  const validPatternIndex = props.patternToDo
    .filter((_, index) => !donePatterns.value.includes(index))
    .findIndex((pattern) =>
      getIsArraysEqual(pattern, currentPattern.value[donePatterns.value.length]),
    )

  return validPatternIndex === -1 ? false : validPatternIndex
}

const handleMouseDown = (point: Point, event: MouseEvent) => {
  if (currentPattern.value.flat().includes(point.id)) return

  const wrapperBoxLeft = wrapperBox.value?.getBoundingClientRect().left || 0
  const wrapperBoxTop = wrapperBox.value?.getBoundingClientRect().top || 0
  point.isActive = true
  isDragging.value = true

  // Ajouter le point a la liste des points
  if (!currentPattern.value[donePatterns.value.length]) currentPattern.value.push([])
  currentPattern.value[donePatterns.value.length]?.push(point.id)
  pitchedDotSound()

  // Update le SVG de ligne
  currentLine.value =
    lines.value[
      currentPattern.value[donePatterns.value.length][
        currentPattern.value[donePatterns.value.length].length - 1
      ]
    ]
  currentLine.value.isTracing = true
  currentLine.value.coords.start.x = point.coords.x
  currentLine.value.coords.start.y = point.coords.y
  currentLine.value.coords.end.x = event.clientX - wrapperBoxLeft
  currentLine.value.coords.end.y = event.clientY - wrapperBoxTop
}

// const handleMouseUp = () => {
//   isWin.value = checkIfFullPatternValid()

//   if (isWin.value) {
//     isDragging.value = false
//     mittInstance.emit('Pattern joué', { status: isWin.value })
//     setTimeout(() => {
//       points.value = points.value.map((point) => ({ ...point, isActive: false }))
//       clearPattern()
//     }, 1000)
//   } else {
//   }
// }

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value && currentLine.value.isTracing) {
    const wrapperBoxLeft = wrapperBox.value?.getBoundingClientRect().left || 0
    const wrapperBoxTop = wrapperBox.value?.getBoundingClientRect().top || 0
    currentLine.value.coords.end.x = event.clientX - wrapperBoxLeft
    currentLine.value.coords.end.y = event.clientY - wrapperBoxTop
  }
}

const handleMouseOver = (point: Point) => {
  if (isDragging.value && !currentPattern.value.flat().includes(point.id)) {
    point.isActive = true
    currentPattern.value[donePatterns.value.length].push(point.id)
    currentLine.value.coords.end.x = point.coords.x
    currentLine.value.coords.end.y = point.coords.y
    pitchedDotSound()

    const isPatternWrong = checkIfPatternWrong()
    if (isPatternWrong) {
      setTimeout(() => {
        wrongPatternSound.play()
      }, 400)
      isDisableClick.value = true
      isDragging.value = false
      props.onDrawEnd?.(true)
      gsap.to(patternRef.value, {
        keyframes: {
          '10%': { x: -1 },
          '20%': { x: 2 },
          '30%': { x: -4 },
          '40%': { x: 4 },
          '50%': { x: -4 },
          '60%': { x: 4 },
          '70%': { x: -4 },
          '80%': { x: 2 },
          '90%': { x: -1 },
          '100%': { x: 0 },
        },
        duration: 1,
        ease: 'shakeEasing',
      })
      return
    }

    const validPattern = checkIfPatternValid()
    if (typeof validPattern === 'number') {
      donePatterns.value.push(validPattern)
      isDragging.value = false
      if (checkIfFullPatternValid()) {
        isDisableClick.value = true
        props.onDrawEnd?.()
        setTimeout(() => {
          validPatternSound.play()
        }, 300)
      }
      return
    }

    currentLine.value =
      lines.value[
        currentPattern.value[donePatterns.value.length][
          currentPattern.value[donePatterns.value.length].length - 1
        ]
      ]
    currentLine.value.isTracing = true
    currentLine.value.coords.start.x = point.coords.x
    currentLine.value.coords.start.y = point.coords.y
    currentLine.value.coords.end.x = point.coords.x
    currentLine.value.coords.end.y = point.coords.y
  }
}

const getNormalizedLineDuration = (length: number) => {
  const minTime = 0.5
  const maxTime = 2
  const minLength = 2
  const maxLength = 15

  return (
    (minTime + ((length - minLength) / (maxLength - minLength)) * (maxTime - minTime)) /
    length
  )
}

const setupAnimLines = () => {
  if (!props.patternToDo?.length) return
  animLines(0, props.patternToDo[0].length, 0, props.patternToDo.length)
}

const animLines = (
  currentPatternIndex: number,
  patternLength: number,
  currentArrayIndex: number,
  arrayLength: number,
) => {
  if (currentArrayIndex >= arrayLength) {
    setTimeout(() => {
      clearPattern()
      if (props.isRepeat) {
        if (props.isAutoDrawing) {
          setTimeout(() => {
            setupAnimLines()
          }, 600)
        }
      } else {
        props.onDrawEnd?.()
      }
    }, 500)
    return
  }

  setLine(
    props.patternToDo[currentArrayIndex][currentPatternIndex],
    points.value[props.patternToDo[currentArrayIndex][currentPatternIndex]],
    points.value[props.patternToDo[currentArrayIndex][currentPatternIndex + 1]],
  )

  const normalizedLineDuration = getNormalizedLineDuration(
    props.patternToDo[currentArrayIndex]?.length - 1,
  )

  gsap.fromTo(
    lineRefs[props.patternToDo[currentArrayIndex][currentPatternIndex]],
    {
      drawSVG: '0%',
    },
    {
      drawSVG: '100%',
      duration: normalizedLineDuration,
      ease: 'linear',
      onStart: () => {
        lines.value[props.patternToDo[currentArrayIndex][currentPatternIndex]].isTracing =
          true
        points.value[props.patternToDo[currentArrayIndex][currentPatternIndex]].isActive =
          true
      },
      onComplete: () => {
        points.value[
          props.patternToDo[currentArrayIndex][currentPatternIndex + 1]
        ].isActive = true
        if (currentPatternIndex + 1 >= patternLength - 1) {
          setTimeout(() => {
            animLines(
              0,
              props.patternToDo[currentArrayIndex + 1]?.length,
              currentArrayIndex + 1,
              arrayLength,
            )
          }, 500)
        } else {
          animLines(
            currentPatternIndex + 1,
            patternLength,
            currentArrayIndex,
            arrayLength,
          )
        }
      },
    },
  )
}
</script>
