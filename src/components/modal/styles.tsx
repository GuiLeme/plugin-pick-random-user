import * as ReactModal from 'react-modal';
import styled from 'styled-components';

const PluginModal = styled(ReactModal)`
  position: relative;
  z-index: 1000 !important;
  outline: transparent;
  outline-width: 2px;
  outline-style: solid;
  display: flex;
  flex-direction: column;
  background-color: #fff !important;
  width: 25rem;
  max-width: 95vw;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.4);
  overflow: hidden;
  font-family: 'Source Sans Pro', Arial, sans-serif;

  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  &::-webkit-scrollbar-button {
    width: 0;
    height: 0;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.25);
    border: none;
    border-radius: 50px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.5);
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border: none;
    border-radius: 50px;
  }
  &::-webkit-scrollbar-corner {
    background: transparent;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem 0.875rem;
  border-bottom: 1px solid #E8EDF2;
  flex-shrink: 0;
`;

const ModalTitle = styled.span`
  font-weight: 600;
  font-size: 1.15rem;
  color: #1C2B3A;
`;

const CloseButton = styled.button`
  font-size: 1rem;
  background: none;
  color: #8B9AAF;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  line-height: 1;

  &:hover {
    background-color: #EEF2F8;
    color: #1C2B3A;
  }
`;

const CountdownMessage = styled.div`
  width: 100%;
  text-align: center;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
`;

export {
  PluginModal, ModalHeader, ModalTitle, CloseButton, CountdownMessage,
};
