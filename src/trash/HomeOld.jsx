import { useState, useEffect } from 'react';
import { useMap, Source, Layer, GeolocateControl } from 'react-map-gl';
import { db, collection, query, onSnapshot } from 'components/firestore';
import { clusterLayer, unclusteredLayer } from 'components/layers';
import { useRecoilValue } from 'recoil';
import { userDataState } from 'components/state';
import pushData from 'components/pushData';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import Maps from 'components/Maps';
import ModalWindow from 'components/ModalWindow';
import getGeolocation from 'components/getGeolocation';

const Home = () => {
  const mapRef = useMap();
  const userData = useRecoilValue(userDataState); // 로그인된 유저 데이터
  const [currentPosition, setCurrentPosition] = useState({
    lng: null,
    lat: null,
  }); // 현 위치 저장소
  const [datas, setDatas] = useState({}); // 표시 마커 및 청소 마커를 담는 곳
  const [clickedMarkerData, setClickedMarkerData] = useState({}); // 클릭된 마커의 데이터를 담는 곳
  const [clickedMarkerToggle, setClickedMarkerToggle] = useState(false); // 클릭 토글
  const [isGeolocation, setIsGeolocation] = useState(false); // 위치 정보 사용 가능
  const [isDatas, setIsDatas] = useState(false); // 표시 마커 사용 가능

  useEffect(() => {
    // 표시 마커 및 청소 마커 표시함
    const markDatas = async () => {
      // 여기서 isCleaned를 기준으로 이것은 따로 보류한후에 따로 로드하기!
      const q = query(collection(db, 'markers'));
      onSnapshot(q, querySnapshot => {
        const datas = []; // [{ geojson: { ... }}, { geojson: { .... }}]
        querySnapshot.forEach(doc => {
          datas.push(doc.data());
        });
        const sortedDatas = [];
        datas.map(a => {
          sortedDatas.push(a);
        });
        setDatas({
          type: 'FeatureCollection',
          features: [...sortedDatas],
        });
        setIsDatas(true);
      });
    };
    markDatas();
  }, []);

  const getCurrentPosition = async () => {
    const geolocation = await getGeolocation();
    const {
      coords: { longitude, latitude },
    } = geolocation;
    return { lng: longitude, lat: latitude };
  };
  // 위치가 변하면 작동하는 함수
  const onClickCurrentPosition = async () => {
    console.log('cp: 현재 위치를 구함');
    const { lng, lat } = getCurrentPosition();
    const newCurrentPosition = {
      lng: lng,
      lat: lat,
    };
    console.log(lng, lat);
    // 위치 변동시 현재위치를 재저장함
    setCurrentPosition({
      ...newCurrentPosition,
    });
    if (!isGeolocation) {
      // 위치를 사용할 수 있음을 전달함
      setIsGeolocation(true);
    }
  };

  // 사용자의 현재위치를 db에 저장한다
  const onClickAdd = async () => {
    // add시 foscing 하기!
    if (isGeolocation) {
      console.log('add: 위치 정보가 있음');
      const { lng, lat } = currentPosition;
      const position = {
        lng: lng,
        lat: lat,
      };
      await pushData({ position, userData });
      toast.success('Current location added');
    } else {
      console.log('add: 위치 정보가 없음');
      const { lng, lat } = await getCurrentPosition();
      const position = {
        lng: lng,
        lat: lat,
      };
      pushData({ position, userData });
      toast.success('Current location added');
    }
  };
  const flyTo = ({ lng, lat }) => {
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: 500,
    });
  };
  // 마커 클릭시 수행될 로직들
  const onClickMap = e => {
    // 마커 클릭시 수행될 로직들!
    const feature = e.features[0];
    if (feature) {
      const {
        properties: { markerId, lat, lng }, // 표시자 및 청소자 이름 및 청소됨을 알리는 값
      } = feature;
      flyTo({ lng: lng, lat: lat }); // db에 저장된 정확한 정보로 flyTo해아함
      setClickedMarkerData({
        markerId: markerId,
      });
      setClickedMarkerToggle(true); // 모달 띄운다
    }
  };
  const onClickBack = () => {
    setClickedMarkerToggle(false);
    setClickedMarkerData({});
  };
  const onClickCleanUp = () => {
    // cleaner 데이터 및 isCleaned 를 true로 바꾸기
    console.log(clickedMarkerData);
  };

  return (
    <FullScreen>
      {clickedMarkerToggle ? (
        <ModalWindow
          onClickCleanUp={onClickCleanUp}
          onClickBack={onClickBack}
        />
      ) : (
        ''
      )}
      <Maps
        ref={mapRef}
        interactiveLayerIds={[unclusteredLayer.id]}
        onClick={onClickMap}
      >
        {isDatas ? (
          <Source
            id="datas"
            type="geojson"
            data={datas}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={50}
          >
            <Layer {...clusterLayer} />
            <Layer {...unclusteredLayer} />
          </Source>
        ) : (
          ''
        )}
        <ButtonWrapper>
          <Button onClick={onClickAdd}>Add</Button>
          <Button onClick={onClickCurrentPosition}>Current</Button>
        </ButtonWrapper>
      </Maps>
    </FullScreen>
  );
};

const FullScreen = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  // mapbox 로고 지우기
  .mapboxgl-ctrl-logo {
    display: none;
  }
  // mapbox copyright 로고 지우기
  .mapboxgl-ctrl-attrib {
    display: none;
  }
  // control css 초기화하기
  .mapboxgl-ctrl-bottom-left {
    /* background-color: seagreen; */
  }
  .mapboxgl-ctrl {
    margin-left: 15px;
    margin-bottom: 15px;
    border-radius: 50%;
  }
  .mapboxgl-ctrl-geolocate {
    height: 50px;
    width: 50px;
  }
  .mapboxgl-ctrl-icon {
    background-color: white;
  }
`;
const ButtonWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
`;
const Button = styled.button`
  z-index: 1;
  margin: 15px;
`;

export default Home;
