export type Params = {
  lightHours: number
  onlyWhenLight: boolean
  correctWatering: boolean
  unlimitedWaterings: boolean
  showCompensatedDripsCard: boolean
  showTankCard: boolean
  tankVolumeLiters: number
  dailyConsumptionLiters: number
  lampOnTime: string
  plantCount: number
  dripRateLph: number
  dripCount: number
  wateringsPerDay: number
  durationMinutes: number
}

export type Volumes = {
  durationHours: number
  volumePerWatering: number
  volumePerPlant: number
  dailyTotal: number
  dailyPerPlant: number
}

export type ScheduleEntry = {
  label: string
  absoluteMinutes: number
  volumeTotal: number
  volumePerPlant: number
}

export type ScheduleResult = {
  entries: ScheduleEntry[]
  windowStart: number
  windowEnd: number
  availableDuration: number
}
