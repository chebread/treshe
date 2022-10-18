import { db, setDoc, doc } from 'components/firestore';
import hashConstructor from 'components/hashConstructor';

const pushData = async ({ position, userData }) => {
  const userId = userData.userId;
  const username = userData.username;
  const { lng, lat } = position;
  const docId = hashConstructor();
  await setDoc(doc(db, 'markers', `${docId}`), {
    // geojson
    geojson: {
      type: 'Feature',
      properties: {
        markerId: docId, // 현재 마커에 대한 문서 아이디임
        indicator: {
          id: userId, // 표시자 아이디
          name: username, // 표시자 이름
        },
        cleaner: {
          id: null,
          name: null,
        },
        isCleaned: false, // 청소되었는가?
      },
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    },
  });
};

export default pushData;
