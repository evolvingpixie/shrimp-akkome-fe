<template>
  <button
    v-if="usePlaceholder"
    class="Attachment -placeholder button-unstyled"
    :class="classNames"
    @click="openModal"
  >
    <a
      v-if="type !== 'html'"
      class="placeholder"
      target="_blank"
      :href="attachment.url"
      :alt="attachment.description"
      :title="attachment.description"
      @click.prevent=""
    >
      <FAIcon :icon="placeholderIconClass" />
      <b>{{ nsfw ? "NSFW / " : "" }}</b>{{ this.edit ? '' : placeholderName }}
    </a>
    <div
      class="attachment-buttons"
      v-if="edit || remove"
      >
      <button
        v-if="remove"
        class="button-unstyled attachment-button"
        @click.prevent="onRemove"
      >
        <FAIcon icon="trash-alt" />
      </button>
    </div>
    <div
      v-if="size !== 'hide' && !hideDescription && (edit || localDescription)"
      class="description-container"
      :class="{ '-static': !edit }"
    >
      <input
        v-if="edit"
        v-model="localDescription"
        type="text"
        class="description-field"
        :placeholder="$t('post_status.media_description')"
        @keydown.enter.prevent=""
      >
      <p v-else>
        {{ localDescription }}
      </p>
    </div>
  </button>
  <div
    class="Attachment"
    :class="classNames"
    v-else
  >
    <div
      class="attachment-wrapper"
      v-show="!isEmpty"
    >
      <a
        v-if="hidden"
        class="image-container"
        :href="attachment.url"
        :alt="attachment.description"
        :title="attachment.description"
        @click.prevent.stop="toggleHidden"
      >
        <img
          :key="nsfwImage"
          class="nsfw"
          :src="nsfwImage"
        >
        <FAIcon
          v-if="type === 'video'"
          class="play-icon"
          icon="play-circle"
        />
      </a>
      <div
        class="attachment-buttons"
        v-if="!hidden"
        >
        <button
          v-if="type === 'flash' && flashLoaded"
          class="button-unstyled attachment-button"
          @click.prevent="stopFlash"
        >
          <FAIcon icon="stop" />
        </button>
        <button
          v-if="!useModal"
          class="button-unstyled attachment-button"
          @click.prevent="openModalForce"
        >
          <FAIcon icon="search-plus" />
        </button>
        <button
          v-if="nsfw && hideNsfwLocal"
          class="button-unstyled attachment-button"
          @click.prevent="toggleHidden"
        >
          <FAIcon icon="times" />
        </button>
        <button
          v-if="remove"
          class="button-unstyled attachment-button"
          @click.prevent="onRemove"
        >
          <FAIcon icon="trash-alt" />
        </button>
      </div>

      <a
        v-if="type === 'image' && (!hidden || preloadImage)"
        class="image-container"
        :class="{'-hidden': hidden && preloadImage }"
        :href="attachment.url"
        target="_blank"
        @click.stop.prevent="openModal"
      >
        <StillImage
          class="image"
          :referrerpolicy="referrerpolicy"
          :mimetype="attachment.mimetype"
          :src="attachment.large_thumb_url || attachment.url"
          :image-load-handler="onImageLoad"
          :alt="attachment.description"
        />
      </a>

      <span
        v-if="type === 'video' && !hidden"
        class="video-container"
        :href="attachment.url"
        @click.stop.prevent="openModal"
      >
        <VideoAttachment
          class="video"
          :attachment="attachment"
          :controls="!useModal"
          @play="$emit('play')"
          @pause="$emit('pause')"
        />
        <FAIcon
          v-if="useModal"
          class="play-icon"
          icon="play-circle"
        />
      </span>

      <span
        v-if="type === 'audio' && !hidden"
        class="audio-container"
        :href="attachment.url"
        @click.stop.prevent="openModal"
      >
        <audio
          v-if="type === 'audio'"
          :src="attachment.url"
          :alt="attachment.description"
          :title="attachment.description"
          controls
          @play="$emit('play')"
          @pause="$emit('pause')"
        />
      </span>

      <div
        v-if="type === 'html' && attachment.oembed"
        class="oembed-container"
        @click.prevent="linkClicked"
      >
        <div
          v-if="attachment.thumb_url"
          class="image"
        >
          <img :src="attachment.thumb_url">
        </div>
        <div class="text">
          <!-- eslint-disable vue/no-v-html -->
          <h1><a :href="attachment.url">{{ attachment.oembed.title }}</a></h1>
          <div v-html="attachment.oembed.oembedHTML" />
          <!-- eslint-enable vue/no-v-html -->
        </div>
      </div>

      <span
        v-if="type === 'flash' && !hidden"
        class="flash-container"
        :href="attachment.url"
        @click.stop.prevent="openModal"
      >
        <Flash
          class="flash"
          ref="flash"
          :src="attachment.large_thumb_url || attachment.url"
          @playerOpened="setFlashLoaded(true)"
          @playerClosed="setFlashLoaded(false)"
        />
      </span>
    </div>
    <div
      v-if="size !== 'hide' && !hideDescription && (edit || localDescription)"
      class="description-container"
      :class="{ '-static': !edit }"
    >
      <input
        v-if="edit"
        v-model="localDescription"
        type="text"
        class="description-field"
        :placeholder="$t('post_status.media_description')"
        @keydown.enter.prevent=""
      >
      <p v-else>
        {{ localDescription }}
      </p>
    </div>
  </div>
</template>

<script src="./attachment.js"></script>

<style src="./attachment.scss" lang="scss"></style>
