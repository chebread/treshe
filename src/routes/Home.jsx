import { useState, useRef, useEffect } from 'react';
import Map, { GeolocateControl, NavigationControl } from 'react-map-gl';
import styled from 'styled-components';
import 'mapbox-gl/dist/mapbox-gl.css';

const Home = () => {
  const mapRef = useRef(null);
  const MAPBOX_API_KEY = process.env.REACT_APP_MAPBOX_API_KEY;
  const viewConfig = {
    longitude: 126.97674,
    latitude: 37.575937,
    zoom: 5,
  };
  const position = 'bottom-left';
  return (
    <FullScreen>
      <Map
        ref={mapRef}
        initialViewState={viewConfig} // 기본 값 설정
        mapStyle="mapbox://styles/mapbox/streets-v11" // 지도 스타일 설정
        mapboxAccessToken={MAPBOX_API_KEY} // 인증하기
        fog={{}} // foggy default
        projection="globe" // 지구본
      >
        <NavigationControl position={position} />
        <GeolocateControl
          position={position}
          positionOptions={{
            enableHighAccuracy: true,
          }}
          trackUserLocation
          showUserHeading
        />
      </Map>
    </FullScreen>
  );
};
const FullScreen = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;
export default Home;
