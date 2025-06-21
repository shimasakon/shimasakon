---
title: "BYUCTF 2025 : Baby Android 2"
date: "2025-05-17"
excerpt: "Fun introduction to APK reverse engineering"
tags: "rev, apk, jadx-gui"
---

BYU CTF 2025 was a very nice experience, and as Team Slovakia, we managed to end up on the 35th spot, and we successfuly solved all of the reverse engineering challenges. From the 5 reverse engineering challenges provided, two of them were focused on .apk reverse engineering, which is a fun spice up from your typical keygen crackme. Let's get into it!
### Challenge Overview
**Category:** Reverse Engineering  
**Difficulty:** Easy  
**Points:** 50  
**Files:** `baby_android-2.apk`
### Files 
We are given a single .apk file, called **baby_android-2.apk**.
Now, there is not much to analyze here :D Booting up jadx-gui (amazing tool for apk reversing), we can see a class called **FlagChecker**. In this FlagChecker class, there was a file called **libbabyandroid.so** referenced. Interesting, huh?
### Decompiling
Let's start with unpacking the .apk file and finding the libbyandroid.so file. We can do this by :

```bash
apktool d baby_android-2.apk -o decoded_apk
```

From the decoded_apk directory we can quickly locate the libbyandroid.so file, which, big surprise, is actually a C++ source file! This is new, C++ within an .apk. Opening up the source in a text editor, we can see :


```c
jboolean Java_byuctf_babyandroid_FlagChecker_check(JNIEnv env, jobject obj, jstring input) {
const char raw = env->GetStringUTFChars(input, nullptr);
std::string candidate(raw);                                                                                                
if (candidate.length() == 23) {
    // Hidden lookup table (47 chars)
    static const char table[47] =
      "bycnu)_aacGly~}tt+?=<_ML?f^i_vETkG+b{nDJrVp6=)=";
    for (int i = 0; i <= 22; i++) {
        char expected = table[(i * i) % 47];
        if (candidate[i] != expected) {
            return JNI_FALSE;
        }
    }
    return JNI_TRUE;
}
return JNI_FALSE;

}
```
### Understanding the program logic and reversing it
The source defines a 47 byte lookup table :

```c
static const char table[47] = "bycnu)_aacGly~}tt+?=<_ML?f^i_vETkG+b{nDJrVp6=)=";
```

and it performs the following operations :

```c
for (int i = 0; i <= 22; i++) {
    char expected = table[(i * i) % 47];
    if (candidate[i] != expected) {
        return JNI_FALSE;
    }
}
```

For every index i from 0 to 22, compute ``[i * i] % 47``. This sequence of operations can be reversed very easily, using the following script :

```python
def recover_flag():
    table = "bycnu)_aacGly~}tt+?=<_ML?f^i_vETkG+b{nDJrVp6=)="
    flag = ''.join(
        table[(i * i) % 47]
        for i in range(23)
    )
    return flag

if __name__ == '__main__':
    print(recover_flag())
```

and the result...
```bash
$ ./solve.py
byuctf{c++_in_an_apk??}
```

### Flag

**byuctf{c++_in_an_apk??}**
