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
import { clusterLayer, unclusteredLayer } from 'components/layers';
import { db, collection, query, onSnapshot } from 'components/firestore';

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
  const [datas, setDatas] = useState({}); // 변동이 없을시 다시 불러오지 않기
  const [isDatas, setIsDatas] = useState(false);
  const [data, setData] = useState({}); // 데이터 마커의 데이터임
  const [isClickedDataMarker, setIsClickedDataMarker] = useState(false);
  const [isMapLoad, setIsMapLoad] = useState(false);

  useEffect(() => {
    // 표시 마커 및 청소 마커 표시함
    const markDatas = async () => {
      // (2): *여기서 isCleaned를 기준으로 이것은 따로 보류한후에 따로 로드하기!
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
        flyTo({ ref: mapRef, lng: longitude, lat: latitude });
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
    const { lng, lat } = cp;
    flyTo({ ref: mapRef, lng: lng, lat: lat });
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
        toast.error('Failed to upload current location');
      });
  };

  const onClickDataMarker = e => {
    const feature = e.features[0];
    const id = feature.layer.id;
    if (id === 'data') {
      // 마커 클릭시
      const {
        properties: { markerId, lat, lng }, // 표시자 및 청소자 이름 및 청소됨을 알리는 값
      } = feature;
      flyTo({ ref: mapRef, lng: lng, lat: lat }); // db에 저장된 정확한 정보로 flyTo해아함
      setData({
        markerId: markerId,
      });
      setIsClickedDataMarker(true);
      console.log(feature);
    }
    if (id === 'clusters') {
      // 클러스터 클릭시
      const mapboxSource = mapRef.current.getSource('datas');
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
  };
  const onClickBack = () => {
    setIsClickedDataMarker(false);
    setData({});
  };
  const onClickCleanUp = () => {
    // (2): cleaner 데이터 및 isCleaned 를 true로 바꾸기
    console.log(data);
  };

  return (
    <FullScreen>
      {isGeolocationAvailable ? (
        // 여기에 오는 모든 것은 현재 위치를 받을 수 있는 곳임!
        isClickedDataMarker ? (
          <ModalWrapper>
            <Modal>
              <ButtonWrapper>
                <Button onClick={onClickBack}>Back</Button>
                <Button onClick={onClickCleanUp}>Clean up</Button>
              </ButtonWrapper>
            </Modal>
          </ModalWrapper>
        ) : (
          <Maps
            ref={mapRef}
            interactiveLayerIds={[unclusteredLayer.id, clusterLayer.id]}
            onClick={onClickDataMarker}
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
              <Button onClick={onClickFocusCp}>Cp</Button>
            </ButtonWrapper>
            {isDatas ? (
              // 여기에 생성된 마커를 데이터 마커라고 칭함
              <SourceWrapper>
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
