import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { API } from "aws-amplify"
import { useRecoilState } from "recoil"
import { groupNameState } from "../../state/groupName"
import { groupIdState } from "../../state/groupId"
import { groupMembersState } from "../../state/groupMembers"
import { expensesState } from "../../state/expenses"

/*
*   API 조회로 Group 관련 정산 데이터 불러오기
*/
export const useGroupData = () => {
    const { guid } = useParams()
    const [groupName, setGroupName] = useRecoilState(groupNameState)
    const [groupId, setGroupId] = useRecoilState(groupIdState)
    const [groupMembers, setMembers] = useRecoilState(groupMembersState)
    const [expenses, setExpenses] = useRecoilState(expensesState)

    const fetchAndSetGroupData = async () => {
        await API.get('groupsApi', `/groups/${guid}`)
            .then(data => {
                setGroupName(data[0].groupName)
                setGroupId(data[0].guid)
                setMembers(data[0].members || [])
                setExpenses(data[0].expenses || [])
            })
            .catch(error => {
                console.log(error)
                alert("데이터를 불러오는데 실패 했습니다.")
            })
    }

    useEffect(() => {
        if (guid?.length > 0) {
            fetchAndSetGroupData()
        }
    }, [guid])

    return {
        groupId,
        groupName,
        groupMembers,
        expenses
    }
}