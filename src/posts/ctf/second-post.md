---
title: "Complete CTF Writeup: Buffer Overflow Challenge"
date: "2025-06-20"
excerpt: "A detailed walkthrough of exploiting a buffer overflow vulnerability in a CTF binary, including reverse engineering, exploit development, and getting shell access."
tags: "reverse-engineering, buffer-overflow, exploitation, writeup"
---

This writeup covers my solution to the "BufferMaster" challenge from the recent CyberSec CTF 2025. The challenge involved reverse engineering a binary and exploiting a classic buffer overflow vulnerability.

## Challenge Overview

**Category:** Binary Exploitation  
**Difficulty:** Medium  
**Points:** 500  
**Files:** `buffer_master`, `libc.so.6`

The challenge description simply stated: *"Can you overflow your way to victory? The flag is in `/flag.txt`"*

## Initial Analysis

Let's start by examining the binary with basic tools:

```bash
file buffer_master
# buffer_master: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked

checksec buffer_master
# [*] '/path/to/buffer_master'
#     Arch:     amd64-64-little
#     RELRO:    Partial RELRO
#     Stack:    No canary found
#     NX:       NX enabled
#     PIE:      No PIE (0x400000)
```
```python
def hello():
    print("Hello World!")
```

```bash
ls -la
echo "Hello"
```

```c
#include <stdio.h>
int main() {
    printf("Hello World!\n");
    return 0;
}
```