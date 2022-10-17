import {
  db,
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from 'components/firestore';

const loadDatas = async () => {
  // markers의 전체 데이터를 로드한다
  const q = query(collection(db, 'markers'));
  onSnapshot(q, querySnapshot => {
    const datas = [];
    querySnapshot.forEach(doc => {
      datas.push(doc.data());
    });
  });
};

export default loadDatas;

// 정적으로 가져온다
// const querySnapshot = await getDocs(collection(db, 'markers'));
// querySnapshot.forEach(doc => {
//   // doc.data() is never undefined for query doc snapshots
//   console.log(doc.data());
// });
