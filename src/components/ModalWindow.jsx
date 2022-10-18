import styled from 'styled-components';

const ModalWindow = ({ onClickCleanUp, onClickBack }) => {
  return (
    <ModalWrapper>
      <Modal>
        <button onClick={onClickBack}>Back to home</button>
        <div>
          {/* <p>Marker id: {markerData.properties.markerId}</p>
              <p>Creator name: {markerData.properties.username}</p>
              <p>Creator id: {markerData.properties.userId}</p> */}
        </div>
        <button onClick={onClickCleanUp}>Clean up</button>
      </Modal>
    </ModalWrapper>
  );
};

export default ModalWindow;

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
