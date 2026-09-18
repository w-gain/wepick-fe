import { useParams } from 'react-router-dom';

import { PickScreen } from '../features/pick/PickScreen';

export function Component() {
  const { pickId } = useParams();
  return <PickScreen pickId={pickId} />;
}
