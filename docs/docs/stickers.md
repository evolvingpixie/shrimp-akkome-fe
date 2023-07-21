# Adding stickers

Akkoma-FE supports stickers, which are essentially little images stored server-side
which can be selected by a user to automatically attach them to a post.

There's no explicit setting for these, they just rely on the existence of certain files.

## Initialising the sticker config file

You're probably serving Akkoma-FE from your instance's `instance/static/` directory -
this directy can also override files served at a given path.

The first thing we need to do is set up our `stickers.json` file. At `instance/static/static/stickers.json`,
put a file that looks like this

```json
{
  "myPack": "/static/stickers/myPack"
}
```

This file is a mapping from name to pack directory location. It says "we have a pack called myPack, look for
it at `/static/stickers/myPack`". You can add as many packs as you like in this manner.

## Creating the pack

First, create your pack directory

```bash
mkdir -p instance/static/static/stickers/myPack
```

Now you need to give it some config.

At `instance/static/static/stickers/myPack/pack.json`, put a file that looks like:

```json
{
    "title": "myPack",
    "author": "me for i am very cool",
    "tabIcon": "tab.png",
	"stickers": [
        "mySticker.png"
    ]
}
```

This should be relatively self-explanatory, it declares a pack with a title `myPack` which has only one sticker in it.
The `tabIcon` will appear on the sticker picker itself as a representative of the pack.

You can add as many stickers as you like. They should all be in the same directory as your `pack.json`.

Now you should find that there's a sticky note icon on the emoji picker on Akkoma-FE that allows you to attach stickers.
