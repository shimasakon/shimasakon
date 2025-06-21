---
title: "BYUCTF 2025 : Baby Android 1"
date: "2025-05-17"
excerpt: "Who doesn't love .apk?"
tags: "rev, apk, jadx-gui, baby-apk, xml"
---

The Baby Android 1 turned out to be a tad bit more complex than Baby Android 2 CTF task.
### Challenge Overview
**Category:** Reverse Engineering  
**Difficulty:** Medium  
**Points:** 250  
**Files:** **baby_android-1.apk**
### Files 
We are given a single .apk file, called **baby_android-1.apk**. As I said, B.B.A (Baby Android) 1 turned out to be somewhat weirder and harder than 2. 
Again, we start with decompiling : 

```bash
apktool d baby-android-1.apk -o baby-android-1
```

One thing that I learned from these .apk rev challenges is to always, and I mean always first sniff out **MainActivity** within jadx-gui. Here, we can find exactly 28 **cleanUp()** functions, all of which find 28 textviews (**flagPart1**... **flagPart28**)
From this we can logically derive that the flag is 28 ASCII characters long/ 28 bytes long (since 1 ASCII symbol = 1 byte), but more importantly, that the flag is somewhere stored in 28 parts inside of the source code - statically embedded, waiting to be plucked. =)
And we manage to find it :

```markdown
baby-android-1/
		res/
				layout/
							activity_main.xml
```

You can download the .xml file right here => <a href="/pic/activity_main.txt" download>activity_main.xml</a>
### Problem and solution
Inside of the .xml file, we had TextView lines (namely 28). This is the format that all of them followed :

```markdown
<TextView android:id="@id/flagPart1" android:layout_width="wrap_content" android:layout_height="wrap_content" android:layout_marginBottom="420.0dip" android:text="}" android:layout_marginEnd="216.0dip" app:layout_constraintBottom_toBottomOf="parent" app:layout_constraintEnd_toEndOf="parent" />
```

In every single TextView line we can see an ASCII letter of the flag directly after **android:text=** , e.g in **flagPart1** , its  **android:text="}"**. Based off of this knowledge, we can extract every single letter of the flag.
And given that we are definitely not lazy, we write a python script for it!

```python
import re

with open('activity_main.xml', 'r', encoding='utf-8') as file:
    xml_content = file.read()

texts = re.findall(r'android:text="(.*?)"', xml_content)

result = ''.join(texts)

print(result)
```

and the result...

```bash
$ ./solve.py
b}tayccdrni0dkupocfe_efi_4e{
```

So, we can can see the initial 6 letters of the flag, "byuctf", as well as both of the curly brackets. But this, by itself, is an obnoxiously difficult anagram. One could do it logically and somehow arrange it to forge/create a valid flag, but we looked at it differently.
While analyzing the .xml file, I noticed something quite peculiar. Each tuple in the **flag_parts** was in the form :

```python
(text_character, layout_marginBottom, layout_marginEnd)
```

where each value comes from each **TextView** from our XML. Based off of this, I had a theory - what if we arranged the respective letters from each **TextView** with their respective coordinates, using Kivy Android GUI?

### Solve

```python
from kivy.app import App
from kivy.uix.label import Label
from kivy.uix.floatlayout import FloatLayout
from kivy.core.window import Window
# dip values
Window.size = (400, 700)
flag_parts = [
    ("}", 420, 216),
    ("t", 616, 340),
    ("a", 556, 332),
    ("y", 676, 368),
    ("c", 500, 252),
    ("c", 636, 348),
    ("d", 436, 364),
    ("r", 496, 348),
    ("n", 536, 336),
    ("i", 456, 360),
    ("0", 536, 276),
    ("d", 516, 340),
    ("k", 460, 232),
    ("u", 656, 356),
    ("p", 452, 320),
    ("o", 476, 352),
    ("c", 500, 300),
    ("f", 596, 332),
    ("e", 484, 308),
    ("_", 436, 328),
    ("e", 516, 292),
    ("_", 536, 284),
    ("f", 536, 268),
    ("i", 468, 316),
    ("_", 516, 260),
    ("4", 480, 240),
    ("e", 440, 224),
    ("{", 576, 324),
]
class FlagLayoutApp(App):
    def build(self):
        layout = FloatLayout()
        height = Window.height
        width = Window.width
        for text, bottom, end in flag_parts:
            x = (width - end) / width
            y = bottom / height
            label = Label(text=text, size_hint=(None, None), size=(20, 20),
                          pos_hint={'x': x, 'y': y})
            layout.add_widget(label)

        return layout

if __name__ == '__main__':
    FlagLayoutApp().run()
```

![flag reconstruct](https://github.com/tlsbollei/tlsbollei/blob/c6e92d106a7babbe78e4044df8dcc801cbac0d09/pic/babyandroid1.png)

Wow! So it worked! :>

### Flag

**byuctf{android_piece_0f_c4ke}**
