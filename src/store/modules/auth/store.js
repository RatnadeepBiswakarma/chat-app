import actions from "./actions"
import mutations from "./mutations"

const getters = {
  getMyDetails: state => state.myDetails,
  isLoggedIn: state => state.myDetails && state.myDetails.id ? true : false
}

const state = () => ({
  myDetails: null
})

const module = {
  namespaced: true,
  actions,
  mutations,
  getters,
  state
}

export default module
