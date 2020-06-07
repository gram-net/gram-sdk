<!-- @format -->

<template>
  <div class="lotton-layout">
    <header class="lotton-layout__topbar">
      <div class="topbar">
        <div class="topbar__wrapper">
          <router-link
            v-if="$route.meta.backButton"
            name="topbar-back"
            :to="$route.meta.backRoute || '../'"
          >
            <img
              class="topbar__wrapper__back"
              :src="require('@/apps/lotton/assets/left-arrow.svg')"
            />
          </router-link>

          <router-link to="/lotton" name="topbar-logo">
            <img
              class="topbar__wrapper__logo"
              :src="require('@/apps/lotton/assets/logo.svg')"
            />
          </router-link>
        </div>
      </div>

      <div class="topbar__portal">
        <portal-target name="topbar" />
      </div>
    </header>

    <div class="lotton-layout__view">
      <transition name="page" mode="out-in">
        <router-view class="lotton-layout__view__wrapper" />
      </transition>
      <span class="lotton-layout__view__loader">
        <div class="lotton-layout__view__loader__1" />
        <div class="lotton-layout__view__loader__2" />
      </span>
    </div>

    <nav class="lotton-layout__bottombar">
      <router-link
        name="bottombar-tickets"
        :class="{
          'is--active': $route.name === 'Tickets' || $route.name === 'Ticket'
        }"
        class="lotton-layout__bottombar__item"
        to="/lotton/tickets"
      >
        <img :src="require('@/apps/lotton/assets/nav-tickets.svg')" />
        <span>Tickets</span>
      </router-link>
      <router-link
        name="bottombar-winners"
        :class="{
          'is--active': $route.name === 'Winners' || $route.name === 'Winner'
        }"
        class="lotton-layout__bottombar__item"
        to="/lotton/winners"
      >
        <img :src="require('@/apps/lotton/assets/nav-balloons.svg')" />
        <span>Winners</span>
      </router-link>
    </nav>
  </div>
</template>

<script lang="ts">
import { Watch, Component, Vue } from 'vue-property-decorator'
import { getLottery } from './api/api'
import { Module, mapState } from 'vuex'
import { LotteryState } from './models/lottery'
import router from '@/router'
import { RootState } from '@/common/store'

@Component({
  computed: {
    ...mapState<RootState>({
      loading: ({ Lotton }) => Lotton.loading
    })
  }
})
export default class Lotton extends Vue {
  async mounted() {
    const { dispatch, commit, state } = this.$store
    await dispatch('Lotton/getAccount')
    this.$store.commit('Common/stopLoading')
  }
}
</script>

<style lang="scss">
@import 'styles/all';
@import 'styles/functions';

.page {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.5s, transform 0.5s;
    overflow: hidden;
  }

  &-enter,
  &-leave-active {
    opacity: 0;
    transform: translateX(-30%);
    overflow: hidden;
  }
}

.portal {
  &-enter-active,
  &-leave-active {
    transition: all 0.3s;
  }

  &-enter,
  &-leave-active {
    opacity: 0;
  }
}

html,
body,
#app,
.lotton-layout {
  height: 100%;
}

.lotton-layout {
  --color-primary: #177efa;
  --color-secondary: #cc4080;

  --color-dark-1: #0d0b1b;
  --color-dark-2: #130f27;
  --color-dark-3: #211e41;

  --color-border: #35315c;

  --color-text: #dcd8ea;
  --color-text-dim: #5f5878;
  --color-text-dim-2: #8f88ab;

  --font: Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell,
    'Open Sans', 'Helvetica Neue', sans-serif;
  --radius: 0.3125rem;

  color: white;
  height: 100%;
  background: var(--color-dark-3);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: var(--font);

  &__view {
    flex-grow: 1;
    position: relative;
    overflow: hidden;

    &__loader {
      position: absolute;
      top: 50%;
      left: 50%;
      color: white;
      transform: translate(-50%, -50%);
      width: rem(130);
      height: rem(130);

      & > div {
        border-radius: 50%;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 5px solid white;
      }

      &__1 {
        animation: pulse1 1s 0.5s ease infinite;
      }
      &__2 {
        animation: pulse1 1s ease infinite;
      }
    }

    &__wrapper {
      overflow-y: auto;
      overflow-x: hidden;
      position: absolute;
      background: var(--color-dark-3);
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 2;
    }
  }

  &__topbar {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    z-index: 10;
    box-shadow: 0 2px 24px rgba(black, 0.55);
    background: var(--color-dark-2);
  }

  &__bottombar {
    background: var(--color-dark-1);
    color: white;
    height: rem(70);
    width: 100%;
    box-shadow: 0 -2px 24px 0 rgba(0, 0, 0, 0.25);
    display: flex;
    position: relative;
    z-index: 5;
    justify-content: center;
    align-items: center;

    &__item {
      text-decoration: none;
      color: inherit;
      margin: auto rem(5);
      opacity: 0.65;
      font-weight: normal;
      display: flex;
      flex-direction: column;
      font-size: rem(11);
      height: rem(50);
      margin: auto 15px;
      justify-content: space-between;
      transition: 0.15s ease-in-out;

      color: inherit !important;

      img {
        transition: 0.15s ease-in-out;
        position: relative;
        top: rem(2.5);
      }

      span {
        height: rem(13.5);
      }

      &.is--active {
        opacity: 1;
        font-weight: 500;

        img {
          filter: brightness(3);
        }
      }
    }
  }
}

.topbar {
  width: 100%;
  padding: rem(12.5);
  text-align: center;
  position: relative;

  &__wrapper {
    &__back {
      position: absolute;
      left: rem(15);
      top: rem(16);
      width: rem(28);
    }

    &__logo {
      margin-top: rem(-3);
    }
  }

  &__portal {
    width: 100%;

    .vue-portal-target {
      border-top: 1px solid var(--color-border);
    }
  }
}
</style>
