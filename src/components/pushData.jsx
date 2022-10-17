import { db, setDoc, doc } from 'components/firestore';
import hashConstructor from 'components/hashConstructor';

const pushData = async ({ position, userData }) => {
  const userId = userData.userId;
  const username = userData.username;
  const { lng, lat } = position;
  const docId = hashConstructor(); // 이것이 파일을 접근하게 하는 해시임
  await setDoc(doc(db, 'markers', `${docId}`), {
    // geojson
    geojson: {
      type: 'Feature',
      properties: {
        markerId: docId, // 현재 마커에 대한 문서 아이디임
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

export default pushData;
