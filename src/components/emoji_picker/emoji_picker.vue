<template>
  <div class="emoji-picker panel panel-default panel-body">
    <div class="heading">
      <span
        ref="emoji-tabs"
        class="emoji-tabs"
        @wheel="onWheel"
      >
        <span
          v-for="group in emojis"
          :key="group.id"
          class="emoji-tabs-item"
          :class="{
            active: activeGroupView === group.id,
            disabled: group.emojis.length === 0
          }"
          :title="group.text"
          @click.prevent="highlight(group.id)"
        >
          <span v-if="!group.first.imageUrl">{{ group.first.replacement }}</span>
          <img
            v-else
            :src="group.first.imageUrl"
          >
        </span>
        <span
          v-if="stickerPickerEnabled"
          class="stickers-tab-icon emoji-tabs-item"
          :class="{active: showingStickers}"
          :title="$t('emoji.stickers')"
          @click.prevent="toggleStickers"
        >
          <FAIcon
            icon="sticky-note"
            fixed-width
          />
        </span>
      </span>
    </div>
    <div class="content">
      <div
        class="emoji-content"
        :class="{hidden: showingStickers}"
      >
        <div class="emoji-search">
          <input
            type="text"
            class="form-control"
            :placeholder="$t('emoji.search_emoji')"
            @input="debouncedSearch"
          >
        </div>
        <EmojiGrid
          ref="emojiGrid"
          :groups="emojisView"
          @emoji="onEmoji"
          @active-group="onActiveGroup"
        />
        <div
          v-if="showKeepOpen"
          class="keep-open"
        >
          <Checkbox v-model="keepOpen">
            {{ $t('emoji.keep_open') }}
          </Checkbox>
        </div>
      </div>
      <div
        v-if="showingStickers"
        class="stickers-content"
      >
        <sticker-picker
          @uploaded="onStickerUploaded"
          @upload-failed="onStickerUploadFailed"
        />
      </div>
    </div>
  </div>
</template>

<script src="./emoji_picker.js"></script>
<style lang="scss" src="./emoji_picker.scss"></style>
