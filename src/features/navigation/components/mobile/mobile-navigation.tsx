import { useNavigation } from "../../hooks/useNavigation";

import NavigationItem from "../navigation-item";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MobileNavigation({ open, onClose }: Props) {
  const { data, isLoading, isError } = useNavigation();

  if (!open) {
    return null;
  }

  if (isLoading) {
    return <nav>Loading...</nav>;
  }

  if (isError) {
    return <nav>Failed to load navigation</nav>;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <nav>
      <button onClick={onClose}>Close</button>

      <ul>
        {data.map((item) => (
          <NavigationItem key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  );
}
