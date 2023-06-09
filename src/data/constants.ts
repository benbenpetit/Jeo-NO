import { IQuestion } from '@/core/types/IQuiz'
import { ISport } from '@/core/types/ISport'

export const QUESTIONS_DATA: IQuestion[] = [
  // {
  //   question: `Belle performance ! Quelle était cette dernière figure ?`,
  //   answer: 1,
  //   options: ['OLLIE', 'KICKFLIP', 'SHOVE-IT', 'PIGEON FLIP'],
  //   selected: null,
  //   img: '/img/quiz/quiz-turn.png',
  //   info: `Le kickflip, ou simplement flip, est une figure de skateboard, inventée par Curt Lindren, en 1978, puis modifiée et popularisée par Rodney Mullen. Autrefois, on l'appelait encore magic flip, ollie flip ou ollie kickflip. Le but d'un kickflip est de sauter et de faire vriller la planche autour de son axe longitudinal, lui faisant effectuer une rotation de 360°.`,
  // },
  // {
  //   question: `Belle performance ! Quelle était cette première figure ?`,
  //   answer: 3,
  //   options: ['PigeonFlip', 'Ollie', 'Kickflip', 'FS 270 Boardslide'],
  //   selected: null,
  //   img: '/img/quiz/quiz-ollie.png',
  //   info: `Cette figure consiste à faire tourner la planche de 180° sous les pieds du skateur. Il existe aussi des variantes à 360° et 540°.`,
  // },
  {
    question: "Qu'est ce qu'un skatepark ?",
    answer: 0,
    options: [
      'Lieu de pratique du skate',
      'Competition de skate',
      'Magasin de skate',
      'Garage pour skateboard',
    ],
    selected: null,
    img: '/img/quiz/quiz-skatepark.webp',
    info: `Un skatepark peut se présenter sous différentes formes et tailles,
    mais il est généralement composé de rampes, de courbes, de rails et de murs,
    en intérieur ou en extérieur et sont souvent construits en béton ou en bois.`,
  },
  {
    question: 'Qui est le créateur de la première marque de planche à roulettes ?',
    answer: 3,
    options: [
      'Pas de créateur spécifique',
      'Tony Hawk',
      'Steve Caballero',
      'Larry Stevenson',
    ],
    selected: null,
    img: '/img/quiz/quiz-creator.webp',
    info: `Larry Stevenson est souvent crédité pour avoir popularisé le skateboard
    en tant que loisir dans les années 1960 en créant la première marque de planches à roulettes, Makaha.`,
  },
  {
    question: `Comment s'appelle la technique pour descendre un escalier en skateboard ?`,
    answer: 1,
    options: ['Slide', 'Ollie Drop', 'Flying in the air', 'Pumping the stairs'],
    selected: null,
    img: '/img/quiz/quiz-stair.webp',
    info: `Le "ollie drop" est un trick de skateboard qui consiste à réaliser un
    ollie en sautant depuis une hauteur plus élevée que le niveau du sol, comme un
    banc ou une marche. Il est considéré comme un trick avancé.`,
  },
  {
    question: `Combien de trucks y a-t-il sur un skateboard ?`,
    answer: 1,
    options: ['Un', 'Deux', 'Trois', 'Quatre'],
    selected: null,
    img: '/img/quiz/quiz-trucks.webp',
    info: `Le truck d'un skate est la pièce métallique qui relie les roues au deck. Il est composé de plusieurs parties, dont le
    kingpin, les bushings et les gommes anti-vibration. Les trucks permettent aux skateurs de tourner en inclinant le deck et de maintenir la stabilité à haute vitesse.`,
  },
  {
    question: `Comment s'appelle la position sur le skateboard lorsque le pied gauche est placé à l'avant et le pied droit à l'arrière ?`,
    answer: 0,
    options: ['Regular', 'Goofy', 'Switch', 'Mongo'],
    selected: null,
    img: '/img/quiz/quiz-stance.webp',
    info: `C'est la position la plus courante chez les skateurs, mais il existe
    également une position appelée "goofy" où le pied droit est placé à l'avant de la planche et le pied gauche à l'arrière. `,
  },
  {
    question: `Quel est le nom de la technique de saut où le skateur tape sur l'arrière pour faire sauter sa planche ?`,
    answer: 1,
    options: ['Kickflip', 'Ollie', 'Jump 50-50', 'Backside Smith Grind'],
    selected: null,
    img: '/img/quiz/quiz-ollie.webp',
    info: `Pour réaliser un ollie, le skateur doit taper l'arrière de la
    planche contre le sol, puis glisser son pied avant vers l'avant de la planche pour la faire décoller, tout
    en sautant avec les deux pieds en même temps.`,
  },
  {
    question: `Quand est arrivée la pratique du skateboard ?`,
    answer: 0,
    options: ['1950', '1960', '1970', '1980'],
    selected: null,
    img: '/img/quiz/quiz-year.webp',
    info: `Le skateboard moderne tel que nous le connaissons aujourd'hui a été popularisé dans les années 1950 en Californie
    par la communauté des surfeurs, cherchant à reproduire la sensation de glisse sur l'asphalte.`,
  },
  {
    question: `Quand est-ce que le skate est arrivé aux JO pour la première fois ?`,
    answer: 2,
    options: ['Los Angeles 1984', 'Londres 2012', 'Tokyo 2020', 'JAMAIS'],
    selected: null,
    img: '/img/quiz/quiz-jo.webp',
    info: `Le skateboard est arrivé lors des JO de Tokyo en 2020 en tant que sport additionnel. C'était la première fois que le
    skateboard était présenté en tant que discipline olympique, avec des compétitions pour les catégories de street et de park.`,
  },
  {
    question: `Comment s’appelle la partie supérieure du skateboard ?`,
    answer: 1,
    options: ['Le wheel', 'Le deck', 'Le truck', 'Le bearing'],
    selected: null,
    img: '/img/quiz/quiz-top.webp',
    info: `Le deck d'un skate est la planche sur laquelle on se tient pour pratiquer le skateboard. Il est généralement en bois
    d'érable et comporte des couches collées les unes sur les autres pour plus de solidité.`,
  },
  {
    question: `Quel est le nom de la figure où le skateur saute sur le skateboard et le fait tourner en même temps ?`,
    answer: 3,
    options: ['Le heelflip', 'Le ollie', 'Le nollie', 'Le kickflip'],
    selected: null,
    img: '/img/quiz/quiz-turn.webp',
    info: `Le kickflip est un trick de skateboard très populaire qui consiste à faire tourner la planche autour de son axe longitudinal
    tout en effectuant un saut. Le skateur donne un coup de pied sur l'une des extrémités de la planche pour la faire tourner et la rattraper
    avec les pieds.`,
  },
  {
    question: `Quel est l'équipement de protection le plus important pour un skateur ?`,
    answer: 2,
    options: ['Les genouillères', 'Les coudières', 'Le casque', 'Les gants'],
    selected: null,
    img: '/img/quiz/quiz-protec.webp',
    info: `Le casque est considéré comme l'équipement le plus important d'un skater car il protège la tête en cas de chute. En skate, les chutes peuvent
    être fréquentes et violentes, en particulier lors de la réalisation de figures ou de sauts. En cas de chute, un choc à la tête peut causer des blessures
    graves, voire mortelles.`,
  },
  {
    question: `Comment s'appelle la figure où le skateur glisse sur une rampe en diagonale ?`,
    answer: 1,
    options: ['Le backside air', 'Le slash grind', 'Le 360 flip', 'Le frontside air'],
    selected: null,
    img: '/img/quiz/quiz-rampe.webp',
    info: `Le slash grind est une figure de base en skate où le skateur glisse en angle sur la rampe en appuyant sur le tail (l’arrière) ou le nose (l’avant) de la planche.
    Il peut être effectué sur différentes surfaces, comme des rampes, des rails, des murets, etc.`,
  },

  // {
  //   question: ``,
  //   answer: 0,
  //   options: ['', '', '', ''],
  //   selected: null,
  //   img: '',
  //   info: ``,
  // },
]

export const SPORTS: ISport[] = ['skate', 'surf', 'climbing', 'break']
