import flyTo from 'components/flyTo';
import Maps from 'components/Maps';
import { useEffect, useState } from 'react';
import useGeolocation from 'react-hook-geolocation';
import { useMap, Marker, Source, Layer } from 'react-map-gl';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { userDataState } from 'components/state';
import toast from 'react-hot-toast';
import pushData from 'components/pushData';
import { db, collection, query, onSnapshot } from 'components/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import {
  indicatorClusterLayer,
  cleanerClusterLayer,
  indicatorUnclusteredLayer,
} from 'components/layers';

const Home = () => {
  const mapRef = useMap();
  const geolocation = useGeolocation();
  const [cp, setCp] = useState({
    // current position
    lng: null,
    lat: null,
  });
  const [isGeolocationAvailable, setIsGeolocationAvailable] = useState(false);
  const userData = useRecoilValue(userDataState);
  const [indicatorDatas, setIndicatorDatas] = useState({}); // 표시된 마커
  const [cleanerDatas, setCleanerDatas] = useState({}); // 청소된 마커
  const [isDatas, setIsDatas] = useState(false);
  const [isMapLoad, setIsMapLoad] = useState(false);
  const [isClickedMarker, setIsClickedMarker] = useState(false);
  const [isClickedIndicatorMarker, setIsClickedIndicatorMarker] =
    useState(false);
  const [indicatorData, setIndicatorData] = useState({}); // 클릭된 표시 마커의 데이터
  const [isClickedCleanerMarker, setIsClickedCleanerMarker] = useState(false); // 표시 마커가 클릭 됬는가
  const [cleanerData, setCleanerData] = useState({});
  const [isFocusing, setIsFocusing] = useState(true);

  const cleanerUnclusteredLayer = {
    id: 'cleanerData',
    source: 'cleanerDatas',
    type: 'circle',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-radius': 10,
      'circle-opacity': 0.7,
      'circle-color': '#d6336c',
    },
  };

  useEffect(() => {
    // 표시 마커 및 청소 마커 표시함
    const markDatas = async () => {
      const q = query(collection(db, 'markers'));
      onSnapshot(q, querySnapshot => {
        const datas = []; // [{ geojson: { ... }}, { geojson: { .... }}]
        querySnapshot.forEach(doc => {
          datas.push(doc.data());
        });
        const indicatorDatas = [];
        const cleanerDatas = [];
        datas.map(a => {
          const isCleaned = a.properties.isCleaned;
          if (isCleaned) {
            // 청소 마커
            cleanerDatas.push(a);
          } else {
            // 표시 마커
            indicatorDatas.push(a);
          }
        });
        setIndicatorDatas({
          type: 'FeatureCollection',
          features: [...indicatorDatas],
        });
        setCleanerDatas({
          type: 'FeatureCollection',
          features: [...cleanerDatas],
        });
        setIsDatas(true); // 데이터가 불러와짐!
      });
    };
    markDatas();
  }, []);

  useEffect(() => {
    const { longitude, latitude } = geolocation;
    const { lng, lat } = cp;
    const isDifferent = longitude != lng && latitude != lat; // 변경된 위치인지 구하는 변수
    if (isDifferent) {
      // 위치가 변동할때만 현재위치를 재정의함
      const newCurrentPosition = {
        lng: longitude,
        lat: latitude,
      };
      setCp({
        ...newCurrentPosition,
      });
      if (!isGeolocationAvailable) {
        setIsGeolocationAvailable(true);
      }
      if (isMapLoad) {
        console.log('자동으로 포커싱');
        if (isFocusing) {
          // 포커싱이 켜져 있어야 자동 포커싱 기능이 활성화됨!
          flyTo({ ref: mapRef, lng: longitude, lat: latitude });
        }
      }
    }
  }, [geolocation]);

  const onMapLoad = () => {
    // 맵이 최초로 불러와지면 위치에 포커스함!
    const { lng, lat } = cp;
    flyTo({ ref: mapRef, lng: lng, lat: lat });
    setIsMapLoad(true); // 맵 로드됨
  };

  const onClickFocusCp = () => {
    // (1): 자동 추적을 비활성화 할 수 있는 기능 추가하기!
    if (isFocusing) {
      console.log('포커싱 취소');
      setIsFocusing(false);
    } else {
      console.log('포커싱 활성화');
      const { lng, lat } = cp;
      flyTo({ ref: mapRef, lng: lng, lat: lat });
      setIsFocusing(true);
    }
  };

  const onClickAdd = async () => {
    // 현재 위치 데이터 추가
    const { lng, lat } = cp;
    const position = {
      lng: lng,
      lat: lat,
    };
    await pushData({ position, userData })
      .then(() => {
        toast.success('Your current location has been uploaded');
      })
      .catch(err => {
        console.log(err);
        toast.error('Failed to upload current location');
      });
  };

  const onClickMarker = e => {
    const feature = e.features[0];
    // 표시자
    if (feature) {
      const id = feature.layer.id;
      if (id === 'indicatorData') {
        const {
          properties: { markerId, lat, lng, indicatorId, indicatorName }, // 표시자 및 청소자 이름 및 청소됨을 알리는 값
        } = feature;
        flyTo({ ref: mapRef, lng: lng, lat: lat }); // db에 저장된 정확한 정보로 flyTo해아함
        setIndicatorData({
          markerId: markerId,
          lat: lat,
          lng: lng,
          indicatorId: indicatorId,
          indicatorName: indicatorName,
        });
        setIsClickedIndicatorMarker(true);
        setIsClickedMarker(true);
      }
      if (id === 'indicatorCluster') {
        const mapboxSource = mapRef.current.getSource('indicatorDatas');
        const clusterId = feature.properties.cluster_id;
        mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) {
            return;
          }
          const lng = feature.geometry.coordinates[0];
          const lat = feature.geometry.coordinates[1];
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom,
            duration: 1000,
          });
        });
      }
      if (id === 'cleanerData') {
        const {
          properties: {
            markerId,
            lat,
            lng,
            indicatorId,
            indicatorName,
            cleanerName,
            cleanerId,
          }, // 표시자 및 청소자 이름 및 청소됨을 알리는 값
        } = feature;
        flyTo({ ref: mapRef, lng: lng, lat: lat }); // db에 저장된 정확한 정보로 flyTo해아함
        setCleanerData({
          markerId: markerId,
          lat: lat,
          lng: lng,
          indicatorId: indicatorId,
          indicatorName: indicatorName,
          cleanerName: cleanerName,
          cleanerId: cleanerId,
        });
        setIsClickedCleanerMarker(true);
        setIsClickedMarker(true);
      }
      if (id === 'cleanerCluster') {
        const mapboxSource = mapRef.current.getSource('cleanerDatas');
        const clusterId = feature.properties.cluster_id;
        mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) {
            return;
          }
          const lng = feature.geometry.coordinates[0];
          const lat = feature.geometry.coordinates[1];
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom,
            duration: 1000,
          });
        });
      }
    }
  };
  const disableIndicatorModal = () => {
    setIsClickedIndicatorMarker(false);
    setIsClickedMarker(false);
    setIndicatorData({});
  };
  const onClickIndicatorBack = () => {
    disableIndicatorModal();
  };
  const disableCleanerModal = () => {
    setIsClickedCleanerMarker(false);
    setIsClickedMarker(false);
    setCleanerData({});
  };
  const onClickCleanerBack = () => {
    console.log(cleanerData);
    disableCleanerModal();
  };

  const onClickIndicatorCleanUp = async () => {
    // (2): cleaner 데이터 및 isCleaned 를 true로 바꾸기
    const { lng, lat, indicatorId, indicatorName, markerId } = indicatorData;
    const { userId, username } = userData;
    const markerRef = doc(db, 'markers', markerId);
    const updataData = {
      properties: {
        markerId: markerId, // 현재 마커에 대한 문서 아이디임
        lng: lng, // 위치 정보 lng
        lat: lat, // 위치 정보 lat
        indicatorId: indicatorId, // 표시자 아이디
        indicatorName: indicatorName, // 표시자 이름
        cleanerId: userId, // 청소자 아이디
        cleanerName: username, // 청소자 이름
        isCleaned: true, // 청소되었는가?
      },
    };
    await updateDoc(markerRef, updataData);
    toast.success('Clean up!');
    disableIndicatorModal();
  };

  return (
    <FullScreen>
      {isGeolocationAvailable ? (
        // 여기에 오는 모든 것은 현재 위치를 받을 수 있는 곳임!
        isClickedMarker ? (
          isClickedIndicatorMarker ? (
            <ModalWrapper>
              <Modal>
                <p>Indicator modal</p>
                <ButtonWrapper>
                  <Button onClick={onClickIndicatorBack}>Back</Button>
                  <Button onClick={onClickIndicatorCleanUp}>Clean up</Button>
                </ButtonWrapper>
              </Modal>
            </ModalWrapper>
          ) : isClickedCleanerMarker ? (
            <ModalWrapper>
              <Modal>
                <h1>청소자: {cleanerData.cleanerName}</h1>
                <h1>표시자: {cleanerData.indicatorName}</h1>
                <ButtonWrapper>
                  <Button onClick={onClickCleanerBack}>Back</Button>
                </ButtonWrapper>
              </Modal>
            </ModalWrapper>
          ) : (
            ''
          )
        ) : (
          <Maps
            ref={mapRef}
            interactiveLayerIds={[
              indicatorClusterLayer.id,
              indicatorUnclusteredLayer.id,
              cleanerClusterLayer.id,
              cleanerUnclusteredLayer.id,
            ]}
            onClick={onClickMarker}
            onLoad={onMapLoad}
          >
            <MarkerWrapper>
              <Marker
                // 현위치 마커
                latitude={cp.lat}
                longitude={cp.lng}
              />
            </MarkerWrapper>
            <ButtonWrapper>
              <Button onClick={onClickAdd}>Add</Button>
              <Button onClick={onClickFocusCp}>
                {isFocusing ? 'Unfocusing' : 'Focsuing'}
              </Button>
            </ButtonWrapper>
            {isDatas ? (
              // 표시된 마커 및 청소된 마커 표기
              <SourceWrapper>
                <Source
                  id="indicatorDatas"
                  type="geojson"
                  data={indicatorDatas}
                  cluster={true}
                  clusterMaxZoom={14}
                  clusterRadius={50}
                >
                  <Layer {...indicatorClusterLayer} />
                  <Layer {...indicatorUnclusteredLayer} />
                </Source>
                <Source
                  id="cleanerDatas"
                  type="geojson"
                  data={cleanerDatas}
                  cluster={true}
                  clusterMaxZoom={14}
                  clusterRadius={50}
                >
                  <Layer {...cleanerClusterLayer} />
                  <Layer {...cleanerUnclusteredLayer} />
                </Source>
              </SourceWrapper>
            ) : (
              ''
            )}
          </Maps>
        )
      ) : (
        <div>loading...</div>
      )}
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
const MarkerWrapper = styled.div``;
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
const SourceWrapper = styled.div``;
const ModalWrapper = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 10000;
`;
const Modal = styled.div`
  height: 100%;
  width: 100%;
  background-color: white;
`;

export default Home;
