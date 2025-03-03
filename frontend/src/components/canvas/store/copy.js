import store from '@/store/index'
import toast from '@/components/canvas/utils/toast'
import generateID from '@/components/canvas/utils/generateID'
import { deepCopy } from '@/components/canvas/utils/utils'
import { chartCopy } from '@/api/chart/chart'

export default {
  state: {
    copyData: null, // 复制粘贴剪切
    isCut: false
  },
  mutations: {
    copy(state) {
      if (!state.curComponent) return
      state.copyData = {
        data: deepCopy(state.curComponent),
        index: state.curComponentIndex
      }

      state.isCut = false
    },

    paste(state, isMouse) {
      if (!state.copyData) {
        toast('请选择组件')
        return
      }

      const data = state.copyData.data
      if (!state.curComponent.auxiliaryMatrix) {
        data.style.top += 20
        data.style.left += 20
      }

      // if (isMouse) {
      //   data.style.top = state.menuTop
      //   data.style.left = state.menuLeft
      // } else {
      //   data.style.top += 10
      //   data.style.left += 10
      // }

      data.id = generateID()

      // 如果是用户视图 测先进行底层复制
      if (data.type === 'view') {
        chartCopy(data.propValue.viewId).then(res => {
          const newView = deepCopy(data)
          newView.propValue.viewId = res.data
          store.commit('addComponent', { component: newView })
        })
      } else {
        store.commit('addComponent', { component: deepCopy(data) })
      }
      if (state.isCut) {
        state.copyData = null
      }
    },

    cut(state) {
      if (!state.curComponent) {
        toast('请选择组件')
        return
      }

      if (state.copyData) {
        const data = deepCopy(state.copyData.data)
        const index = state.copyData.index
        data.id = generateID()
        store.commit('addComponent', { component: data, index })
        if (state.curComponentIndex >= index) {
          // 如果当前组件索引大于等于插入索引，需要加一，因为当前组件往后移了一位
          state.curComponentIndex++
        }
      }

      store.commit('copy')
      store.commit('deleteComponent')
      state.isCut = true
    }
  }
}
