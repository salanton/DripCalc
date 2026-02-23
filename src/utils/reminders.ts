/**
 * Создает iCalendar файл для добавления события в календарь
 * Пользователь может затем создать напоминание на основе этого события
 */
export function createCalendarEvent(
  title: string,
  date: Date,
  description?: string
): string {
  // Форматируем дату для iCalendar (только дата, без времени)
  const formatDate = (d: Date): string => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  const startDate = formatDate(date)
  // Для события на весь день используем ту же дату
  const endDate = formatDate(date)

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DripCalc//Calendar Event//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${title}`,
    description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter((line) => line !== '')
    .join('\r\n')

  return icsContent
}

/**
 * Скачивает iCalendar файл
 */
export function downloadCalendarFile(
  title: string,
  date: Date,
  description?: string
): void {
  const icsContent = createCalendarEvent(title, date, description)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `напоминание-${date.toISOString().split('T')[0]}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Пытается открыть приложение Напоминания iOS (неофициальный способ)
 * Возвращает true если попытка была сделана, false если не поддерживается
 */
export function tryOpenRemindersApp(title: string, date: Date): boolean {
  // Проверяем, что это iOS устройство
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  
  if (!isIOS) {
    return false
  }
  
  try {
    // Форматируем дату для URL (YYYYMMDD)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}${month}${day}`
    
    // Пытаемся использовать неофициальный URL scheme для напоминаний
    // ВАЖНО: Это может не работать на всех версиях iOS
    const url = `x-apple-reminderkit://REMCDReminder/reminder?title=${encodeURIComponent(title)}&dueDate=${dateStr}`
    
    // Создаем скрытый iframe для попытки открытия
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = url
    document.body.appendChild(iframe)
    
    // Удаляем iframe через небольшую задержку
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 1000)
    
    return true
  } catch (e) {
    return false
  }
}
