<template>
  <div>
    <Scene v-if="skateStep === 0" />
    <Quiz v-if="skateStep === 1" @onEnd="addUserSession" />
    <Leaderboard
      v-if="skateStep === 2"
      :maxSessions="maxSessions"
      :localMaxSession="localMaxSession"
      isInProgress
    />
  </div>
</template>

<script setup lang="ts">
import Leaderboard from '@/components/modules/Game/Leaderboard/Leaderboard.vue'
import Scene from '@/components/views/Scene.vue'
import { IMaxSessionWUser, IScore } from '@/core/types/IScore'
import { ref, watch, computed } from 'vue'
import { useScoreStore } from '@/core/store/score'
import { useSportStore } from '@/core/store/sport'
import { addScoreSkate, getAllMaxSessions } from '@/core/services/api/leaderboardApi'
import Quiz from '@/pages/Quiz.vue'
import { useCollection, useCurrentUser } from 'vuefire'
import { IUser } from '@/core/types/IUser'
import { getSortedInProgressMaxSessions } from '@/core/utils/scores'
import { collection } from 'firebase/firestore'
import { db } from '@/firebase'
import { getMaxSessionHigherThanStored } from '@/core/services/api/leaderboardApi'
import { addMaxSession } from '@/core/services/api/leaderboardApi'

const { sportState, setSportStep } = useSportStore()
const { scoreState } = useScoreStore()
const currentUser = useCurrentUser()
const realtimeMaxSessions = useCollection(collection(db, 'maxSessions'))
const realtimeUsers = useCollection(collection(db, 'users'))
const maxSessions = ref<IMaxSessionWUser[]>([])
const localMaxSession = ref<IMaxSessionWUser>({ maxSession: {} })
const skateStep = computed(
  () => sportState.doneSports.find((doneSport) => doneSport.sport === 'skate')?.step ?? 0,
)

const fetchMaxSessions = async () => {
  const firebaseMaxSessions = await getAllMaxSessions()

  const playedSports = Object.keys(scoreState.currentScores).filter(
    (sport) => scoreState.currentScores[sport as keyof {}],
  )

  const currentScores = [
    ...playedSports.map((playedSport) => ({
      [playedSport]: scoreState.currentScores[playedSport as keyof {}],
    })),
  ]
  const currentMaxSession = {
    maxSession: Object.assign({}, ...currentScores),
    user: currentUser.value?.uid
      ? ({
          id: currentUser.value.uid,
          displayName: currentUser.value.displayName,
          photoURL: currentUser.value.photoURL,
        } as IUser)
      : undefined,
  }

  localMaxSession.value = currentMaxSession

  const concatenatedMaxSessions = currentUser.value
    ? firebaseMaxSessions
    : firebaseMaxSessions.concat(currentMaxSession)

  maxSessions.value = getSortedInProgressMaxSessions(
    concatenatedMaxSessions,
    sportState.doneSports.map(({ sport }) => sport),
  )
}

const addUserSession = async () => {
  if (!localMaxSession.value) return

  const isMaxSessionHigherThanStored = await getMaxSessionHigherThanStored(
    localMaxSession.value.maxSession,
    currentUser.value?.uid,
  )

  if (isMaxSessionHigherThanStored) {
    await addMaxSession(localMaxSession.value.maxSession, currentUser.value?.uid)
  }
}

watch(currentUser, async () => {
  await fetchMaxSessions()
})

watch(
  [
    skateStep,
    scoreState.currentScores.skate,
    scoreState.currentScores.skateQuiz,
    currentUser,
  ],
  () => {
    if (skateStep.value === 2 && currentUser.value) {
      if (scoreState.currentScores.skate && scoreState.currentScores.skateQuiz) {
        const tempScore: IScore = {
          sportId: 'skate',
          points: scoreState.currentScores.skate ?? 0,
          quiz: scoreState.currentScores.skateQuiz,
          createdAt: new Date(),
          userId: currentUser.value.uid,
        }
        addScoreSkate(tempScore)
      }
    }
  },
)

watch(
  [scoreState, realtimeMaxSessions, realtimeUsers],
  async () => {
    await fetchMaxSessions()
  },
  { immediate: true, deep: true },
)
</script>
