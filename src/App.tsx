import { useMemo } from 'react'
import AppShell from './components/AppShell'
import ControlCard from './components/ControlCard'
import ControlsGrid from './components/ControlsGrid'
import InstallHint from './components/InstallHint'
import ScheduleTable from './components/ScheduleTable'
import SliderInput from './components/SliderInput'
import Summary from './components/Summary'
import { PARAM_LIMITS, usePersistentParams } from './hooks/usePersistentParams'
import {
  calcSchedule,
  calcVolumes,
  EDGE_OFFSET_MIN,
  minutesToTimeString,
  timeStringToMinutes,
} from './utils/calculations'
import { downloadCalendarFile, tryOpenRemindersApp } from './utils/reminders'
import './App.css'

function App() {
  const { params, updateParam } = usePersistentParams()

  const volumes = useMemo(() => calcVolumes(params), [params])
  const schedule = useMemo(() => calcSchedule(params, volumes), [params, volumes])
  const maxWateringsPerDay = params.unlimitedWaterings ? PARAM_LIMITS.wateringsPerDay.max : 4
  
  // Используем volumes.dailyTotal если включены компенсированные капельницы, иначе dailyConsumptionLiters
  const dailyConsumption = params.showCompensatedDripsCard 
    ? volumes.dailyTotal 
    : params.dailyConsumptionLiters
  
  const daysUntilRefill = dailyConsumption > 0 ? params.tankVolumeLiters / dailyConsumption : 0
  const daysUntilRefillRounded = Math.max(0, Math.round(daysUntilRefill))
  const nextRefillDate = new Date()
  nextRefillDate.setDate(nextRefillDate.getDate() + daysUntilRefillRounded)
  const nextRefillDateLabel = nextRefillDate.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  })
  
  const tankInfoText = `Хватит на: ${daysUntilRefillRounded} дн · ${nextRefillDateLabel}`

  const handleUnlimitedToggle = (checked: boolean) => {
    updateParam('unlimitedWaterings', checked)
    if (!checked && params.wateringsPerDay > 4) {
      updateParam('wateringsPerDay', 4)
    }
  }

  const handleCreateReminder = () => {
    const reminderTitle = `Наполнить бак (${params.tankVolumeLiters}л)`
    const reminderDescription = `Следующее наполнение бака автополива`
    
    // Пытаемся открыть приложение Напоминания на iOS
    const isIOS = tryOpenRemindersApp(reminderTitle, nextRefillDate)
    
    // Всегда скачиваем .ics файл как запасной вариант
    // На iOS пользователь может выбрать, что делать с файлом
    // На других устройствах это основной способ
    setTimeout(() => {
      downloadCalendarFile(reminderTitle, nextRefillDate, reminderDescription)
    }, isIOS ? 500 : 0) // Небольшая задержка на iOS, чтобы дать время открыться приложению
  }

  return (
    <AppShell>
      <header className="topbar">
        <div className="topbar__title">DripCalc</div>
        <div className="topbar__subtitle">Калькулятор автополива</div>
      </header>

      <main className="page">
        <InstallHint />
        {params.showCompensatedDripsCard ? (
          <Summary entries={schedule.entries} />
        ) : null}

        <ControlsGrid>
          <ControlCard
            className="control-card--mode"
            title="Световой режим растений"
            description="Часы света и время включения"
          >
            <SliderInput
              showHeader={false}
              displayValue={`${params.lightHours}/${24 - params.lightHours}`}
              value={params.lightHours}
              min={PARAM_LIMITS.lightHours.min}
              max={PARAM_LIMITS.lightHours.max}
              step={1}
              onChange={(v) => updateParam('lightHours', v)}
              helper={`Свет: ${params.lightHours} ч · Тьма: ${24 - params.lightHours} ч`}
            />
            <SliderInput
              showHeader={false}
              value={timeStringToMinutes(params.lampOnTime)}
              min={0}
              max={23 * 60 + 45}
              step={15}
              displayValue={params.lampOnTime}
              helper="Время включения света"
              onChange={(v) => updateParam('lampOnTime', minutesToTimeString(v))}
            />
          </ControlCard>

          <ControlCard
            className="control-card--waterings"
            title="Частота и количество поливов"
            description="К-во включений и минут"
          >
            <SliderInput
              showHeader={false}
              value={params.durationMinutes}
              min={PARAM_LIMITS.durationMinutes.min}
              max={PARAM_LIMITS.durationMinutes.max}
              step={1}
              suffix="мин"
              helper="Минуты за раз"
              onChange={(v) => updateParam('durationMinutes', v)}
            />
            <SliderInput
              showHeader={false}
              value={params.wateringsPerDay}
              min={PARAM_LIMITS.wateringsPerDay.min}
              max={maxWateringsPerDay}
              step={1}
              helper="Количество включений"
              onChange={(v) => updateParam('wateringsPerDay', v)}
            />
          </ControlCard>

          <ControlCard
            title="Опции"
            description="Дополнительные параметры"
          >
            <label className="toggle-row toggle-row--switch" htmlFor="correctWatering">
              <input
                id="correctWatering"
                type="checkbox"
                className="toggle-switch"
                checked={params.correctWatering}
                onChange={(e) => updateParam('correctWatering', e.target.checked)}
              />
              <span className="toggle-switch__slider" aria-hidden="true" />
              <div className="toggle-row__text">
                <div className="toggle-row__title">Правильный полив</div>
                <p className="toggle-row__desc">
                  Только в световом окне, без первых и последних {EDGE_OFFSET_MIN} мин.
                </p>
              </div>
            </label>
            <label className="toggle-row toggle-row--switch" htmlFor="unlimitedWaterings">
              <input
                id="unlimitedWaterings"
                type="checkbox"
                className="toggle-switch"
                checked={params.unlimitedWaterings}
                onChange={(e) => handleUnlimitedToggle(e.target.checked)}
              />
              <span className="toggle-switch__slider" aria-hidden="true" />
              <div className="toggle-row__text">
                <div className="toggle-row__title">Без ограничений</div>
                <p className="toggle-row__desc">До 100 поливов в сутки, специфичное применение</p>
              </div>
            </label>
            <label className="toggle-row toggle-row--switch" htmlFor="showCompensatedDripsCard">
              <input
                id="showCompensatedDripsCard"
                type="checkbox"
                className="toggle-switch"
                checked={params.showCompensatedDripsCard}
                onChange={(e) => updateParam('showCompensatedDripsCard', e.target.checked)}
              />
              <span className="toggle-switch__slider" aria-hidden="true" />
              <div className="toggle-row__text">
                <div className="toggle-row__title">Компенсированые капельницы</div>
                <p className="toggle-row__desc">
                  Позволяет расчитать расход при использовании таких капельниц
                </p>
              </div>
            </label>
            <label className="toggle-row toggle-row--switch" htmlFor="showTankCard">
              <input
                id="showTankCard"
                type="checkbox"
                className="toggle-switch"
                checked={params.showTankCard}
                onChange={(e) => updateParam('showTankCard', e.target.checked)}
              />
              <span className="toggle-switch__slider" aria-hidden="true" />
              <div className="toggle-row__text">
                <div className="toggle-row__title">Расчитать расход</div>
                <p className="toggle-row__desc">Позволяет расчитать день следующего наполнения бака.</p>
              </div>
            </label>
          </ControlCard>

          {params.showCompensatedDripsCard ? (
            <ControlCard
              className="control-card--drips"
              bentoSpan="desktop-full"
              title="Компенсированые капельници"
              description="Параметры системы"
            >
              <SliderInput
                showHeader={false}
                displayValue={`${params.dripRateLph.toFixed(1)} л/ч`}
                value={params.dripRateLph}
                min={PARAM_LIMITS.dripRateLph.min}
                max={PARAM_LIMITS.dripRateLph.max}
                step={0.1}
                helper="Расход одной капельницы"
                onChange={(v) => updateParam('dripRateLph', Number(v.toFixed(1)))}
              />
              <SliderInput
                showHeader={false}
                value={params.dripCount}
                min={PARAM_LIMITS.dripCount.min}
                max={PARAM_LIMITS.dripCount.max}
                step={1}
                suffix="x"
                helper="Количество капельниц на растение"
                onChange={(v) => updateParam('dripCount', v)}
              />
              <SliderInput
                showHeader={false}
                value={params.plantCount}
                min={PARAM_LIMITS.plantCount.min}
                max={PARAM_LIMITS.plantCount.max}
                step={1}
                suffix="x"
                helper="Количество растений в системе"
                onChange={(v) => updateParam('plantCount', v)}
              />
            </ControlCard>
          ) : null}

          {params.showTankCard ? (
            <ControlCard
              className="control-card--tank"
              bentoSpan="desktop-full"
              title="Обьем бака"
              description="Расчет до следующего наполнения"
              bodyClassName="control-card--tank__body"
            >
              <SliderInput
                showHeader={false}
                value={params.dailyConsumptionLiters}
                min={PARAM_LIMITS.dailyConsumptionLiters.min}
                max={PARAM_LIMITS.dailyConsumptionLiters.max}
                step={0.1}
                suffix="л"
                helper="Расход литров в день"
                onChange={(v) => updateParam('dailyConsumptionLiters', v)}
                disabled={params.showCompensatedDripsCard}
              />
              <SliderInput
                showHeader={false}
                value={params.tankVolumeLiters}
                min={PARAM_LIMITS.tankVolumeLiters.min}
                max={PARAM_LIMITS.tankVolumeLiters.max}
                step={1}
                suffix="л"
                helper={tankInfoText}
                onChange={(v) => updateParam('tankVolumeLiters', v)}
              />
              <button
                className="reminder-button"
                onClick={handleCreateReminder}
                title="Создать напоминание"
                aria-label="Создать напоминание о наполнении бака"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="reminder-button__text">Добавить напоминание</span>
              </button>
            </ControlCard>
          ) : null}

        </ControlsGrid>

        <ScheduleTable
          entries={schedule.entries}
          volumes={volumes}
          params={params}
          windowStart={schedule.windowStart}
          windowEnd={schedule.windowEnd}
          dailyConsumptionLiters={params.dailyConsumptionLiters}
        />
      </main>
    </AppShell>
  )
}

export default App
