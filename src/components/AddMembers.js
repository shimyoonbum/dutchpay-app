import { useState } from "react"
import { CenteredOverlayForm } from "./common/CenteredOverlayForm"
import { InputTags } from "react-bootstrap-tagsinput"
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil"
import { groupMembersState } from "../state/groupMembers"
import { groupNameState } from "../state/groupName"
import styled from 'styled-components'
import { Button, Container, Form, Row } from "react-bootstrap"

export const AddMembers = () => {
    const [validated, setValidated] = useState(false)
    // const setGroupMembers = useSetRecoilState(groupMembersState)
    const [groupMembers, setGroupMembers] = useRecoilState(groupMembersState)
    const groupName = useRecoilValue(groupNameState)

    const handleSubmit = (event) => {
        event.preventDefault()
    
        const form = event.currentTarget
        // if (form.checkValidity()) {
        //     setValidGroupName(true)
        //     //saveGroupName()
        // } else {
        //     event.stopPropagation();
        //     setValidGroupName(false)
        // }
        setValidated(true)
    }

    const isSamsungInternet = window.navigator.userAgent.includes('SAMSUNG')
    const header = `${groupName} 그룹에 속한 사람들의 이름을 모두 적어 주세요.`
    // const header = `그룹에 속한 사람들의 이름을 모두 적어 주세요.`

    return (
        <CenteredOverlayForm
        title={header}
        validated={validated}
        handleSubmit={handleSubmit}
        >
            { isSamsungInternet ?
                <Form.Control
                placeholder="이름 간 컴마(,)로 구분"
                // onChange={({target}) => setGroupMembersString(target.value)}
                />
            :
                <InputTags
                    values={groupMembers}
                    data-testid="input-member-names"
                    placeholder="이름 간 띄어 쓰기"
                    onTags={(value) => setGroupMembers(value.values)}
                />
            }
            {validated && groupMembers.length === 0 && (
                <StyledErrorMessage>그룹 멤버들의 이름을 입력해 주세요.</StyledErrorMessage>
            )}
        </CenteredOverlayForm>
    )
}

const StyledErrorMessage = styled.span`
  color: red;
`