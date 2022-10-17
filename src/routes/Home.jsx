import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Maps from 'components/Maps';
import { useMap, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import getGeolocation from 'components/getGeolocation';
import pushPosData from 'components/pushPosData';
import { useRecoilValue } from 'recoil';
import { userDataState } from 'components/state';
import toast from 'react-hot-toast';
import useGeolocation from 'react-hook-geolocation';
import loadPosDatas from 'components/loadPosDatas';

const Home = () => {
  const mapRef = useMap();
  const geolocation = useGeolocation();
  const userData = useRecoilValue(userDataState);
  const [markerDatas, setMarkerDatas] = useState({});
  const layerStyle = {
    id: 'point',
    type: 'circle',
    paint: {
      'circle-radius': 10,
      'circle-color': '#007cbf',
    },
  };
  const [currentPosition, setCurrentPosition] = useState({
    lng: null,
    lat: null,
  });

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
  const onClickAdd = async () => {
    // mapRef.current.flyTo({
    //   center: [0, 0],
    // });
    const {
      coords: { longitude, latitude },
    } = await getGeolocation(); // 현재위치를 받아옴
    const position = {
      lng: longitude,
      lat: latitude,
    };
    await pushPosData({ position, userData });
    toast.success('Current location added');
  };

  return (
    // (5): 또한, geolocation 기능은 내가 ref를 어떻게 고치든가 아니면 그냥 기존에꺼를 쓰되, 디자인을 수정하기.
    <FullScreen>
      <Maps ref={mapRef}>
        <ButtonWrapper>
          <Button onClick={onClickAdd}>Add</Button>
          <Button onClick={onClickCurrentPosition}>Current Position</Button>
        </ButtonWrapper>
        <Source id="my-data" type="geojson" data={markerDatas}>
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
  justify-content: flex-end;
`;
const Button = styled.button`
  z-index: 1; // 버튼 띄우기
  margin: 15px;
`;

export default Home;
