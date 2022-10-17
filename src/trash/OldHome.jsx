import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import useGeolocation from 'react-hook-geolocation';
import Map, { Marker, useMap } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const Home = () => {
  const MAPBOX_API_KEY = process.env.REACT_APP_MAPBOX_API_KEY;
  const initView = {
    longitude: 126.97674,
    latitude: 37.575937,
    zoom: 5,
  };
  const mapRef = useMap();
  const geolocation = useGeolocation();
  const [currentPosition, setCurrentPosition] = useState({
    lng: null,
    lat: null,
  });
  const isGeolocationAvailable =
    currentPosition.lng != null && currentPosition.lat != null;

  useEffect(() => {
    console.log('컴포넌트 최초 시작');
  }, []);

  useEffect(() => {
    const { lng, lat } = currentPosition;
    if (lng != null && lat != null && mapRef.current != undefined) {
      // console.log('위치가 변했습니다. 마커도 변동함.');
      // 저장한 위치가 변할때 마다 포커스를 함
      // 그치만, 만약 위치정보를 이미 받은 후 다시 새로고침 한다면 이미 위치 정보가 있기때문에 세로고침 하지 않는다 (이미 마커가 있기에)
      // pc는 조금 안되지만, 모바일은 잘됨
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 2000,
      });
    }
  }, [currentPosition]);

  useEffect(() => {
    // 현재 위치가 변경될때 마다 마커를 생성하며 포커스함, 마커는 계속적으로 리 로드됨
    const { longitude, latitude } = geolocation;
    const { lng, lat } = currentPosition;
    const isPosDifferent = longitude != lng && latitude != lat; // 기존에 저장된 위치와 달라야 새로운 위치를 currentPosition에 저장함
    if (isPosDifferent) {
      // geolocation의 현재 위치가 기존에서 변할때만 currentPosition을 재정의함
      const newCurrentPosition = {
        lng: longitude,
        lat: latitude,
      };
      setCurrentPosition({
        ...newCurrentPosition,
      });
    }
  }, [geolocation]);

  const onClickCurrentPosition = () => {
    // 그냥 현재 위치로 포커스함
    console.log('현재 위치로 포커스 함');
    const { lng, lat } = currentPosition;
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: 2000,
    });
  };
  return (
    <FullScreen>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_API_KEY}
        initialViewState={initView}
        mapStyle="mapbox://styles/haneum/cl99rd3ef000m14rwpw8mlhgb" // 사용자 정의 style
      >
        {isGeolocationAvailable ? (
          // 현재 위치를 불러오면 그때부터
          <>
            <Marker
              latitude={currentPosition.lat}
              longitude={currentPosition.lng}
            ></Marker>
            <ButtonWrapper>
              <Button onClick={onClickCurrentPosition}>Current Position</Button>
            </ButtonWrapper>
          </>
        ) : (
          ''
        )}
      </Map>
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
  justify-content: flex-end;
`;
const Button = styled.button`
  z-index: 1; // 버튼 띄우기
  margin: 15px;
`;

export default Home;

// useEffect(() => {
//   // 여기에 마커 로드하기
//   // (-1): 근데 마커 로드는 데이터가 변할때 마다 로드해야 함 (실시간)
//   // (0): 마커는 사용자의 이름을 데이터 셋으로 가져야함
//   // (1): 마커 클릭시 모달뜨게 해야함
//   // (2): 마커는 특정 데이터를 uid를 참조하여 지울 수 있음
//   // (3): 마커 불러오기는 실시간임
//   const f = async () => {
//     await loadPosDatas();
//     const geojson = {
//       type: 'FeatureCollection',
//       features: [
//         {
//           // 데이터가 들어갈 지점
//         },
//         // 여기에 로드된 데이터 추가하기
//       ],
//     };
//     setMarkerDatas(geojson);
//   };
//   f();
// }, []);
