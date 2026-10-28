import { useNavigation } from "../../hooks/useNavigation";

import NavigationItem from "../navigation-item";

export default function DesktopNavigation() {
  const { data, isLoading, isError } = useNavigation();

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
      <ul>
        {data.map((item) => (
          <NavigationItem key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  );
}
