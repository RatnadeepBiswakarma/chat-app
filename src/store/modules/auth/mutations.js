const mutations = {
  SET_MY_DETAILS(state, details) {
    state.myDetails = details
  },
  SET_BROWSER_NOTIFICATION(state, status) {
    const myDetails = Object.assign({}, state.myDetails)
    myDetails.browser_notification = status
    state.myDetails = myDetails
  }
}

export default mutations
