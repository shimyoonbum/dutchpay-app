import { useRef } from "react"
import { Button } from "react-bootstrap"
import { useRecoilValue } from "recoil"
import styled from "styled-components"
import { expensesState } from "../state/expenses"
import { groupMembersState } from "../state/groupMembers"
import { StyledTitle } from "./AddExpenseForm"

export const calculateMinimumTransaction = (expenses, members, amountPerPerson) => {
    const minTransactions = []
    if (!expenses || !members || !amountPerPerson || amountPerPerson === 0) {
        return minTransactions
    }
  
    //1. 사람별로 낼 금액
    const membersToPay = {}
    members.forEach(member => {
        membersToPay[member] = amountPerPerson
    })
  
    //2. 사람별로 냈어야 할 금액 업데이트
    expenses.forEach(({ payer, amount }) => {
        membersToPay[payer] -= amount
    })
  
    //3. 사람별로 내야할 금액 sorting. 음수가 덜 내야하고 양수는 더 내야함
    const sortedMembersToPay = Object.keys(membersToPay)
        .map(member => (
            { member: member, amount: membersToPay[member]}
        ))
        .sort((a, b) => a.amount - b.amount)
  

    //4. 처음과 끝을 계속 비교하여 최소의 내야할 금액을 구함.
    var left = 0
    var right = sortedMembersToPay.length - 1

    while (left < right) {
        while (left < right && sortedMembersToPay[left].amount === 0) {
            left++
        }
        while (left < right && sortedMembersToPay[right].amount === 0) {
            right--
        }

        //받아야할 사람은 왼쪽부터
        const toReceive = sortedMembersToPay[left]
        //더 내야할 사람은 오른쪽부터
        const toSend = sortedMembersToPay[right]
        const amountToReceive = Math.abs(toReceive.amount)
        const amountToSend = Math.abs(toSend.amount)

        if (amountToSend > amountToReceive) {
            minTransactions.push({
                receiver: toReceive.member,
                sender: toSend.member,
                amount: amountToReceive,
            })

            //정산 수 추가 후에 sortedMembersToPay를 업데이트 쳐줌.
            toReceive.amount = 0
            toSend.amount -= amountToReceive
            left++
        }
        else {
            minTransactions.push({
                receiver: toReceive.member,
                sender: toSend.member,
                amount: amountToSend
            })

            //정산 수 추가 후에 sortedMembersToPay를 업데이트 쳐줌.
            toSend.amount = 0
            toReceive.amount += amountToSend
            right--
        }
    }
  
    return minTransactions
}

export const SettlementSummary = () => {
    const wrapperElement = useRef(null)
    const expenses = useRecoilValue(expensesState)
    const members = useRecoilValue(groupMembersState)

    const totalExpenseAmount = parseFloat(expenses.reduce((prevAmount, curExpense) => prevAmount + parseFloat(curExpense.amount), 0)).toFixed(2)
    const groupMembersCount = members ? members.length : 0
    const splitAmount = totalExpenseAmount / groupMembersCount

    const minimumTransaction = calculateMinimumTransaction(expenses, members, splitAmount)

    return (
        <StyledWrapper ref={wrapperElement}>
            <StyledTitle>2. 정산은 이렇게!</StyledTitle>
            { totalExpenseAmount > 0 && groupMembersCount > 0 && (
                <>
                    <StyledSummary>
                        <span>{groupMembersCount} 명이서 총 {totalExpenseAmount} 지출</span>
                        <br/>
                        <span>한 사람 당 {splitAmount.toFixed(2)}</span>
                    </StyledSummary>

                    <StyledUl>
                        {minimumTransaction.map(({ sender, receiver, amount}, index) =>
                            <li key={`transaction-${index}`}>
                                <span>{sender} → {receiver} : {amount.toFixed(2)}</span>
                            </li>
                        )}
                    </StyledUl>
                </>
            )}
        </StyledWrapper>
    )
}

const StyledWrapper = styled.div`
  padding: 1.5em;
  background-color: #683BA1;
  color: #FFFBFB;
  box-shadow: 3px 0px 4px rgba(0, 0, 0, 0.25);
  border-radius: 15px;
  text-align: center;
  font-size: 20px;
  position: relative;

  @media screen and (max-width: 600px) {
    font-size: 4vw;
    line-height: 6vw;
  }
`

const StyledUl = styled.ul`
  margin-top: 1em;
  font-weight: 600;
  line-height: 200%;
  text-align: left;

  list-style-type: disclosure-closed;
  li::marker {
    animation: blinker 1.5s linear infinite;
  }

  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
`

const StyledSummary = styled.div`
  margin-top: 1em;
`