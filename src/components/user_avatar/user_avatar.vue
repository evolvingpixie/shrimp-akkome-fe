<template>
  <span
    class="Avatar"
    :class="{ '-compact': compact }"
  >
    <StillImage
      v-if="user"
      class="avatar"
      :alt="user.screen_name_ui"
      :title="user.screen_name_ui"
      :src="imgSrc(user.profile_image_url_original)"
      :image-load-error="imageLoadError"
      :class="{ '-compact': compact, '-better-shadow': betterShadow }"
    />
    <div
      v-else
      class="avatar -placeholder"
      :class="{ '-compact': compact }"
    />
    <FAIcon
      v-if="bot"
      icon="robot"
      class="bot-indicator"
    />
  </span>
</template>

<script src="./user_avatar.js"></script>
<style lang="scss">
@import '../../_variables.scss';

.Avatar {
  --_avatarShadowBox: var(--avatarStatusShadow);
  --_avatarShadowFilter: var(--avatarStatusShadowFilter);
  --_avatarShadowInset: var(--avatarStatusShadowInset);
  // --_still-image-label-visibility: hidden;

  display: inline-block;
  position: relative;
  width: 48px;
  height: 48px;

  &.-compact {
    width: 32px;
    height: 32px;
    border-radius: $fallback--avatarAltRadius;
    border-radius: var(--avatarAltRadius, $fallback--avatarAltRadius);
  }

  .avatar {
    width: 100%;
    height: 100%;
    box-shadow: var(--_avatarShadowBox);
    border-radius: $fallback--avatarRadius;
    border-radius: var(--avatarRadius, $fallback--avatarRadius);

    &.-better-shadow {
      box-shadow: var(--_avatarShadowInset);
      filter: var(--_avatarShadowFilter);
    }

    &.-animated::before {
      display: none;
    }

    &.-compact {
      border-radius: $fallback--avatarAltRadius;
      border-radius: var(--avatarAltRadius, $fallback--avatarAltRadius);
    }

    &.-placeholder {
      background-color: $fallback--fg;
      background-color: var(--fg, $fallback--fg);
    }
  }

  img {
    width: 100%;
    height: 100%;
  }

  .bot-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: -0.2em;
    padding: 0.2em;
    background: rgba(127, 127, 127, 0.5);
    color: #fff;
    border-radius: var(--tooltipRadius);
  }

}
</style>
