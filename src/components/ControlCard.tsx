import type { PropsWithChildren, ReactNode } from 'react'

type Props = PropsWithChildren<{
  title: string
  description?: string
  aside?: ReactNode
  className?: string
  bodyClassName?: string
}>

const ControlCard = ({ title, description, aside, className, bodyClassName, children }: Props) => (
  <section className={`control-card${className ? ` ${className}` : ''}`}>
    <header className="control-card__header">
      <div>
        <div className="control-card__title">{title}</div>
        {description ? <p className="control-card__description">{description}</p> : null}
      </div>
      {aside ? <div className="control-card__aside">{aside}</div> : null}
    </header>
    <div className={`control-card__body${bodyClassName ? ` ${bodyClassName}` : ''}`}>{children}</div>
  </section>
)

export default ControlCard
