import { useState, useRef, useEffect } from 'react';
import Map, { GeolocateControl, Marker } from 'react-map-gl';
import styled from 'styled-components';
import 'mapbox-gl/dist/mapbox-gl.css';
import useGeolocation from 'react-hook-geolocation';

const Home = () => {
  const mapRef = useRef(null);
  // const onGeolocationUpdate = geolocation => {
  //   // pos is geolocation
  // };
  const geolocation = useGeolocation(); // (1): 실시간 위치가 변동 되는 지 확인 필요
  const [geolocationAvailable, setGeolocationAvailable] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({
    lat: null,
    lng: null,
  });
  const [geolocationMarker, setGeolocationMarker] = useState({
    lat: null,
    lng: null,
    anchor: 'center',
    pitchAlignment: 'viewport',
    scale: 1,
  });

  useEffect(() => {
    // geolocation의 값이 변경될때 마다 로드함
    const { latitude, longitude } = geolocation;
    // 객체에 값이 있을때만 값을 바꾸며, 기존 값과 동일할 경우 바꾸지 않는다
    if (
      latitude != null &&
      longitude != null &&
      latitude != currentPosition.lat &&
      longitude != currentPosition.lng
    ) {
      setGeolocationAvailable(true);
      setCurrentPosition({
        lat: latitude,
        lng: longitude,
      });
      console.log(latitude, longitude);
    }
  }, [geolocation]);

  const onClickAdd = () => {
    setCurrentPosition({
      lng: 126.97674,
      lat: 37.575937,
    });
  };
  const onClickCurrentPosition = () => {
    const { lat, lng } = currentPosition;
    mapRef.current.flyTo({
      center: [lng, lat],
      duration: 2000,
      zoom: 15,
    });
    const newGeolocationMarker = geolocationMarker;
    newGeolocationMarker.lat = lat;
    newGeolocationMarker.lng = lng;
    setGeolocationMarker({
      ...newGeolocationMarker,
    });
  };

  return (
    <FullScreen>
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_API_KEY}
        initialViewState={{
          longitude: 126.97674,
          latitude: 37.575937,
          zoom: 5,
        }}
        mapStyle="mapbox://styles/haneum/cl99rd3ef000m14rwpw8mlhgb"
        projection="globe"
      >
        // 그니까 geolocation 값이 변하면 이것도 변해야 함!!!!!!!!!!
        <Marker
          longitude={geolocationMarker.lng}
          latitude={geolocationMarker.lat}
          scale={geolocationMarker.scale}
          anchor={geolocationMarker.anchor}
          color="blue"
          pitchAlignment={geolocationMarker.pitchAlignment}
        ></Marker>
        <CenterButtonWrapper>
          {geolocationAvailable ? (
            // 위치 정보가 로드 된후에 사용 가능!
            <ButtonWrapper>
              <Button onClick={onClickCurrentPosition}>Current</Button>
              <Button onClick={onClickAdd}>Add</Button>
            </ButtonWrapper>
          ) : (
            ''
          )}
        </CenterButtonWrapper>
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
const CenterButtonWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
`;
const ButtonWrapper = styled.div`
  position: absolute; // items 겹치기
`;
const Button = styled.button`
  z-index: 1; // 버튼 띄우기
  margin: 15px;
`;

export default Home;
