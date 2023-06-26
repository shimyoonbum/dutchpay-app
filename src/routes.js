export const ROUTES = {
    CREATE_GROUP: "/groups",
    // ADD_MEMBERS: "/groups/:guid/members",
    ADD_MEMBERS: "/members",
    EXPENSE_MAIN: "/expenses",
    // EXPENSE_MAIN: "/groups/:guid/expenses",
}
  
const replaceGuid = (route, guid) => route.replace(":guid", guid)
  
export const ROUTE_UTILS = {
    ADD_MEMBERS: (guid) => replaceGuid(ROUTES.ADD_MEMBERS, guid),
    EXPENSE_MAIN: (guid) => replaceGuid(ROUTES.EXPENSE_MAIN, guid),
}