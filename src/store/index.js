import { update } from "js-md5";
import { createStore } from "vuex";
const store = createStore({
  state: {
        userInfo: {
          nickName: "",
        avatar:""
        }
  },
    mutations: {
        updateUserInfo(state, payload) {
            state.userInfo = payload;
        }
    },
  actions: {},
});

export default store;