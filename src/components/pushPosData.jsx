import { db, setDoc, doc } from 'components/firestore';
import hashConstructor from 'components/hashConstructor';

const pushPosData = async ({ position, userData }) => {
  const userId = userData.userId;
  const username = userData.username;
  const { lng, lat } = position;
  const docId = hashConstructor(); // 이것이 파일을 접근하게 하는 해시임
  await setDoc(doc(db, 'markers', `${docId}`), {
    // geojson
    geojson: {
      type: 'Feature',
      properties: {
        userId: userId,
        username: username,
      },
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    },
  });
};

export default pushPosData;
