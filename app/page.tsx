import Site from "@/components/Site";
import { getPhotoAvailability } from "@/lib/photos";

export default function Home() {
  const photos = getPhotoAvailability();
  return <Site photos={photos} />;
}
