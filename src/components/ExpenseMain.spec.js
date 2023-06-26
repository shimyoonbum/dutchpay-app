import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecoilRoot } from 'recoil';
import { ExpenseMain } from './ExpenseMain';
import { groupMembersState } from "../state/groupMembers"

const renderComponent = () => {
  render(
    <RecoilRoot initializeState={(snap) => {
        snap.set(groupMembersState, ['영수', '영희'])
      }}>
      <ExpenseMain />
    </RecoilRoot>
  )
    
  const dateInput = screen.getByPlaceholderText(/결제한 날짜/i)
  const descInput = screen.getByPlaceholderText(/비용에 대한 설명/i)
  const amountInput = screen.getByPlaceholderText(/비용은 얼마/i)
  const payerInput = screen.getByDisplayValue(/누가 결제/i)
  const addButton = screen.getByText('추가하기')
  //const shareButton = screen.getByTestId('share-btn')

  const descErrorMessage = screen.getByText('비용 내용을 입력해 주셔야 합니다.')
  const payerErrorMessage = screen.getByText('결제자를 선택해 주셔야 합니다.')
  const amountErrorMessage = screen.getByText('1원 이상의 금액을 입력해 주셔야 합니다.')

  return {
    dateInput,
    descInput,
    amountInput,
    payerInput,
    addButton,
    // shareButton,
    descErrorMessage,
    payerErrorMessage,
    amountErrorMessage,
  }
}

describe('비용 정산 메인 페이지', () => {

    // beforeEach(() => {
    //   // API.put을 mocking 함으로써, 실제 네트워크 리퀘스트를 보내지 않고 성공 응답이 온 것처럼 acting 해야
    //   // 프론트 엔드가 의도한 대로 동작하는지 테스트 할 수 있기 때문
    //   API.post = jest.fn().mockResolvedValue({"data": { guid: "TESTING-GUID" }})
    //   console.error = jest.fn()
    // })
  describe('비용 추가 컴포넌트', () => {
    test('비용 추가 컴포넌트 렌더링', () => {
      const {dateInput, descInput, amountInput, payerInput, addButton} = renderComponent()

      expect(dateInput).toBeInTheDocument()
      expect(descInput).toBeInTheDocument()
      expect(amountInput).toBeInTheDocument()
      expect(payerInput).toBeInTheDocument()
      expect(addButton).toBeInTheDocument()
    })

    test('비용 추가에 필수적인 값을 입력하지 않고 "추가" 버튼 클릭시, 에러 메시지를 노출한다', async () => {
      const {addButton, descErrorMessage, payerErrorMessage, amountErrorMessage} = renderComponent()

      expect(addButton).toBeInTheDocument()
      userEvent.click(addButton)

      await waitFor(() => {
        expect(descErrorMessage).toHaveAttribute('data-valid', 'false')
      })
      expect(payerErrorMessage).toHaveAttribute('data-valid', 'false')
      expect(amountErrorMessage).toHaveAttribute('data-valid', 'false')
    })

    test('비용 추가에 필수적인 값들을 입력한 후 "추가" 버튼 클릭시, 저장에 성공', async () => {
      const {descInput, amountInput, payerInput, addButton,
        descErrorMessage, payerErrorMessage, amountErrorMessage} = renderComponent()

      userEvent.type(descInput, '장보기')
      userEvent.type(amountInput, '30000')
      userEvent.selectOptions(payerInput, '영수')
      userEvent.click(addButton)

      await waitFor(() => {
        expect(descErrorMessage).toHaveAttribute('data-valid', 'true')
      })
      expect(payerErrorMessage).toHaveAttribute('data-valid', 'true')
      expect(amountErrorMessage).toHaveAttribute('data-valid', 'true')
    })
  })
})