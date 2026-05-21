import styled from 'styled-components';
import { ModalAvatarProps } from './types';

const PickedUserViewWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const PickedUserViewBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1.25rem 1rem;
`;

const PickedUserViewFooter = styled.div`
  padding: 0 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ResultSectionLabel = styled.span`
  font-size: 1rem;
  font-weight: 800;
  color: #8B9AAF;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin: 1rem 0;
`;

const PickedUserAvatarInitials = styled.div<ModalAvatarProps>`
  background-color: ${({ background }) => background};
  height: 6rem;
  width: 6rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 2.75rem;
  font-weight: 400;
  text-transform: capitalize;
`;

const PickedUserAvatarImage = styled.img`
  height: 8rem;
  width: 8rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PickedUserName = styled.p`
  font-size: 1.875rem;
  font-weight: 500;
  margin: 1rem 0;
`;

const BackButton = styled.button`
  width: 100%;
  padding: 0.625rem 0;
  background: #4E7FF8;
  color: #fff;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #3D6DE0;
  }
`;

const CountdownMessage = styled.div`
  width: 100%;
  text-align: center;
  padding: 0.75rem 1rem;
  margin-top: 1rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
`;

const CountdownBarContainer = styled.div`
  width: 100%;
  height: 0.25rem;
  background-color: #e9ecef;
  border-radius: 0.125rem;
  overflow: hidden;
`;

const CountdownBar = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #0F70D7 0%, #0C57A7 100%);
  width: ${({ progress }) => progress}%;
  transition: width linear 0.1s;
  border-radius: 0.125rem;
`;

export {
  PickedUserViewWrapper,
  PickedUserViewBody,
  PickedUserViewFooter,
  ResultSectionLabel,
  PickedUserAvatarInitials,
  PickedUserAvatarImage,
  PickedUserName,
  BackButton,
  CountdownMessage,
  CountdownBarContainer,
  CountdownBar,
};
