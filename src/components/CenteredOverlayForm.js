import { Button, Container, Form, Row } from "react-bootstrap"
import styled from 'styled-components'
import { OverlayWrapper } from "./common/OverlayWrapper"

export const CenteredOverlayForm = ({children}) => {
    return (
        <StyledCentralizedContainer>
            <StyledLogo>Dutch Pay</StyledLogo>
            <OverlayWrapper>
                {children}
            </OverlayWrapper>
        </StyledCentralizedContainer>
    )
}

const StyledLogo = styled.h1`
    font-weight: 500;
    letter-spacing: 3px;
    color: slateblue;
    text-align: center;
    margin-bottom: 0.8em;
`

const StyledCentralizedContainer = styled(Container)`
  width: 50vw;
  @media (max-width: 500px) {
    width: 80vw;
  }
  min-height: 100vh;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 10px;
`