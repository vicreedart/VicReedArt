export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="page-heading">
      <h1>{title}</h1>
      {subtitle ? <p className="eyebrow">{subtitle}</p> : null}
    </div>
  );
}
