type RoutePlaceholderProps = {
  screenId: string;
  title: string;
  description: string;
};

export function RoutePlaceholder({ screenId, title, description }: RoutePlaceholderProps) {
  return (
    <section className="route-placeholder" aria-labelledby={`${screenId}-title`}>
      <p className="route-placeholder__screen-id">{screenId}</p>
      <h1 id={`${screenId}-title`}>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
