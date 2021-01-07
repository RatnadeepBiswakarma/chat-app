import actions from "./actions"
import mutations from "./mutations"

const getters = {
  getMyDetails: state => state.myDetails
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
