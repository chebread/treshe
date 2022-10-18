import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useMap, Source, Layer, GeolocateControl } from 'react-map-gl';
import { useRecoilValue } from 'recoil';
import { userDataState } from 'components/state';
import Maps from 'components/Maps';
import pushData from 'components/pushData';
import toast from 'react-hot-toast';
import { db, collection, query, onSnapshot } from 'components/firestore';
import { clusterLayer, unclusteredLayer } from 'components/layers';

const Home = () => {
  const mapRef = useMap();
  const userData = useRecoilValue(userDataState);
  const [currentPosition, setCurrentPosition] = useState({
    lng: null,
    lat: null,
  });
  const [geolocationAvailable, setGeolocationAvailable] = useState(false);
  const [datasAvailable, setDatasAvailable] = useState(false);
  const [datas, setDatas] = useState({}); // 로드한 위치 정보를 답는 geojson 저장소이다
  const [markerToggle, setMarkerToggle] = useState(false);

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
        setDatas({
          type: 'FeatureCollection',
          features: [...sortDatas],
        });
        setDatasAvailable(true);
      });
    };
    markDatas();
  }, []);

  const onGeolocate = geolocation => {
    const {
      coords: { longitude, latitude },
    } = geolocation;
    const newCurrentPosition = {
      lng: longitude,
      lat: latitude,
    };
    // 위치 변동시 현재위치를 재정의함
    setCurrentPosition({
      ...newCurrentPosition,
    });
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
  const onClickMap = e => {
    // 마커 클릭시 수행될 로직들!
    const feature = e.features[0];
    if (feature) {
      console.log(feature); // 여기에 내가 저장한 geojson 데이터 모두 있닿ㅎㅎ
      // 마커 클릭시 포커스 됨!
      const geolocation = feature.geometry.coordinates;
      mapRef.current.flyTo({
        center: geolocation,
        zoom: 15,
        duration: 2000,
      });
      setMarkerToggle(true); // 모달 띄운다
      // 마커 클릭시 포커스 된 후 모달이 띄워짐
    }
  };
  const onClickBack = () => {
    setMarkerToggle(false);
  };
  return (
    <FullScreen>
      {markerToggle ? (
        <ModalWrapper>
          <Modal>
            <button onClick={onClickBack}>back to home</button>
          </Modal>
        </ModalWrapper>
      ) : (
        ''
      )}
      <Maps
        ref={mapRef}
        interactiveLayerIds={[unclusteredLayer.id]}
        onClick={onClickMap}
      >
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
        >
          plus
        </GeolocateControl>
        {geolocationAvailable ? (
          <ButtonWrapper>
            <Button onClick={onClickAdd}>Add</Button>
          </ButtonWrapper>
        ) : (
          ''
        )}
        {datasAvailable ? (
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
      </Maps>
    </FullScreen>
  );
};
const ModalWrapper = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 10000;
`;
const Modal = styled.div`
  z-index: 10000;
  height: calc(100% - 30px);
  width: calc(100% - 30px);
  background-color: white;
  opacity: 0.7;
  margin: 15px;
`;
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
  // btn
  .mapboxgl-ctrl-geolocate {
    height: 50px;
    width: 50px;
  }
  // svg
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
  justify-content: flex-start;
`;
const Button = styled.button`
  z-index: 1;
  margin: 15px;
`;

export default Home;
