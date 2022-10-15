import { useState, useRef, useEffect } from 'react';
import Map, { GeolocateControl, NavigationControl } from 'react-map-gl';
import styled from 'styled-components';
import 'mapbox-gl/dist/mapbox-gl.css';
import getCurrentLocation from 'components/getCurrentPosition';

const Home = () => {
  const mapRef = useRef(null);
  const MAPBOX_API_KEY = process.env.REACT_APP_MAPBOX_API_KEY;
  const initView = {
    // 경복궁 위치
    longitude: 126.97674,
    latitude: 37.575937,
    zoom: 5,
  };
  const [position, setPosition] = useState({
    lat: 0, // 위도 (가로)
    long: 0, // 경도 (세로)
  });
  // const [isActive, setIsActive] = useState(false); // 현재 위치 버튼을 클릭했는가?

  // const onClickSetCurrentPosition = async () => {
  //   const { lat, long } = await getCurrentLocation();
  //   setPosition({
  //     lat: lat,
  //     long: long,
  //   });
  //   mapRef.current.flyTo({
  //     center: [long, lat],
  //     duration: 2000,
  //     zoom: 15,
  //   });
  //   setIsActive(true);
  // };

  return (
    <FullScreen>
      <Map
        ref={mapRef}
        initialViewState={initView} // 기본 값 설정
        mapStyle="mapbox://styles/mapbox/streets-v11" // 지도 스타일 설정
        fog={{}} // foggy default
        projection="globe" // 지구본
        mapboxAccessToken={MAPBOX_API_KEY} // 인증하기
      >
        <ButtonWrapper>
          <ButtonWrapper2>
            <Button onClick={onClickSetCurrentPosition}>add</Button>
          </ButtonWrapper2>
        </ButtonWrapper>
      </Map>
    </FullScreen>
  );
};
const FullScreen = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  .mapboxgl-ctrl-logo {
    display: none;
  }
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
const ButtonWrapper2 = styled.div`
  position: absolute;
`;
const Button = styled.button`
  z-index: 1;
  margin: 15px;
`;
export default Home;
