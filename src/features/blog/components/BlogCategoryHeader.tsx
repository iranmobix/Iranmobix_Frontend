interface Props {
  name: string;
  description?: string;
}

export function BlogCategoryHeader({ name, description }: Props) {
  return (
    <header>
      <h2>{name}</h2>
      {description && <p>{description}</p>}
    </header>
  );
}
