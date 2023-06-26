import { Container, Row, Col } from "react-bootstrap"
import { AddExpenseForm } from "./AddExpenseForm"
import { ExpenseTable } from "./ExpenseTable"
import { useState } from "react"
import styled from 'styled-components'
import { useRecoilValue, useSetRecoilState } from "recoil"
import { groupNameState } from "../state/groupName"
import { SettlementSummary } from "./SettlementSummary"


export const ExpenseMain = () => {
    return (       
        <Container fluid>
            <Row>
                <Col xs={12} sm={5} md={4}>
                    <LeftPane />
                </Col>
                <Col>
                    <RightPane />
                </Col>
            </Row>
        </Container>
    )
}

const LeftPane = () => (
    <Container>
        <StyledGapRow>
            <Row>
                <AddExpenseForm />
            </Row>
            <Row>
                <SettlementSummary />
            </Row>
        </StyledGapRow>
    </Container>
)

const RightPane = () => {
    const groupName = useRecoilValue(groupNameState)
    return (
        <StyledRightPaneWrapper>
            <Row>
                <StyledGroupName>{groupName || '그룹 이름'}</StyledGroupName>
            </Row>
            <Row>
                <ExpenseTable />
            </Row>
        </StyledRightPaneWrapper>
    )
}

const StyledRightPaneWrapper = styled(Container)`
  padding: 5vh 2vw 2vh 2vw;

  @media screen and (max-width: 600px) {
    padding: 50px 25px;
  }
`

const StyledGroupName = styled.h2`
  margin-bottom: 6vh;
  font-weight: 700;
  font-size: 40px;
  line-height: 40px;
  text-align: center;
  @media screen and (max-width: 600px) {
    font-size: 9vw;
    margin-bottom: 30px;
  }
`

const StyledGapRow = styled(Row)`
  gap: 3vh;
  padding-top: 14vh;
  justify-content: center;

  @media screen and (max-width: 600px) {
    padding-top: 30px;
  }
`