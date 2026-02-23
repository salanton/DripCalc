import { useEffect, useState } from 'react'

const STORAGE_KEY = 'dripcalc:install-hint-dismissed'

const InstallHint = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) {
      setVisible(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="install-hint" role="note">
      <div>
        Добавьте на экран «Домой» в Safari → Поделиться → «На экран «Домой» для работы офлайн.
      </div>
      <button type="button" className="text-btn" onClick={handleClose} aria-label="Закрыть">
        Закрыть
      </button>
    </div>
  )
}

export default InstallHint
