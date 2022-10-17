import { db, collection, query, where, getDocs } from 'components/firestore';

const loadPosDatas = async () => {
  const markersRef = collection(db, 'markers');
  const q = query(markersRef, where('geojson', '==', true));
  const querySnapshot = await getDocs(q);
  // (6): 로드 안됨.
  querySnapshot.forEach(doc => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc);
    // console.log(doc.id, ' => ', doc.data());
  });
};

export default loadPosDatas;
