import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useMap, Source, Layer, Marker, GeolocateControl } from 'react-map-gl';
import { useRecoilValue } from 'recoil';
import { userDataState } from 'components/state';
import Maps from 'components/Maps';
import pushData from 'components/pushData';
import toast from 'react-hot-toast';
import { db, collection, query, onSnapshot } from 'components/firestore';

const Home = () => {
  const mapRef = useMap();
  const userData = useRecoilValue(userDataState);
  const [currentPosition, setCurrentPosition] = useState({
    lng: null,
    lat: null,
  });
  const [geolocationAvailable, setGeolocationAvailable] = useState(false);
  const [datas, setDatas] = useState({}); // 로드한 위치 정보를 답는 geojson 저장소이다
  const layerStyle = {
    id: 'point',
    type: 'circle',
    paint: {
      'circle-radius': 10,
      'circle-color': '#007cbf',
    },
  };

  useEffect(() => {
    // 위치정보를 db에서 실시간으로 받아서 지도에 변동시나 처음에 로드한다
    const markDatas = async () => {
      // 마커 표시기
      const q = query(collection(db, 'markers'));
      onSnapshot(q, querySnapshot => {
        const datas = []; // [{ geojson: { ... }}, { geojson: { .... }}]
        querySnapshot.forEach(doc => {
          datas.push(doc.data());
        });
        const sortDatas = [];
        datas.map(a => {
          sortDatas.push(a.geojson);
        });
        console.log('set datas');
        setDatas({
          type: 'FeatureCollection',
          features: [...sortDatas],
        });
      });
    };
    markDatas();
  }, []);
  const onClickMap = e => {
    // const feature = e.features[0];
    // const clusterId = feature.properties.cluster_id;
    // const mapboxSource = mapRef.current.getSource('datas');
    // mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
    //   if (err) {
    //     return;
    //   }
    //   mapRef.current.flyTo({
    //     center: feature.geometry.coordinates,
    //     zoom,
    //     duration: 500,
    //   });
    // });
  };
  const onGeolocate = geolocation => {
    const {
      coords: { longitude, latitude },
    } = geolocation;
    const newCurrentPosition = {
      lng: longitude,
      lat: latitude,
    };
    setCurrentPosition({
      ...newCurrentPosition,
    }); // 위치 변동시 현재위치를 재정의함
    if (!geolocationAvailable) {
      // 위치를 사용할 수 있음을 전달함
      setGeolocationAvailable(true);
    }
  };
  const onClickAdd = async () => {
    // 사용자의 현재위치를 db에 저장한다
    const { lng, lat } = currentPosition;
    const position = {
      lng: lng,
      lat: lat,
    };
    await pushData({ position, userData });
    toast.success('Current location added');
  };
  return (
    // (5): 또한, geolocation 기능은 내가 ref를 어떻게 고치든가 아니면 그냥 기존에꺼를 쓰되, 디자인을 수정하기.
    <FullScreen>
      <Maps ref={mapRef} onClick={onClickMap}>
        <GeolocateControl
          position="bottom-left"
          positionOptions={{
            enableHighAccuracy: true, // 가장 정확하게 위치를 받기
          }}
          trackUserLocation // 실시간 위치 반영
          showUserHeading // 위쪽에 있는 화살표
          showUserLocation // 사용자 점 표시
          showAccuracyCircle={false} // 사용자 주위에 있는 둥근 원 표시
          onGeolocate={onGeolocate}
        />
        {geolocationAvailable ? (
          <ButtonWrapper>
            <Button onClick={onClickAdd}>Add</Button>
          </ButtonWrapper>
        ) : (
          ''
        )}
        <Source
          id="datas"
          type="geojson"
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
          data={datas}
        >
          <Layer {...layerStyle} />
        </Source>
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
`;
const ButtonWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;
const Button = styled.button`
  z-index: 1;
  margin: 15px;
`;

export default Home;
