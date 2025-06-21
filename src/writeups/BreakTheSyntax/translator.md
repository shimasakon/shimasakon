---
title: "Break The Syntax 2025 : Translator"
date: "2025-05-09"
excerpt: "Reverse engineering the logic of a string translator"
tags: "rev, ELF, reversing-operations"
---

Break the Syntax 2025 was an amazing experience. As rakuz4n, we managed to place 35th among strong competition of CTF players, and I managed to solve all Reverse Engineering tasks, a feat I'm proud of. Let's get into it!
### Challenge Overview
**Category:** Reverse Engineering  
**Difficulty:** Medium  
**Points:** 300  
**Files:** **translator**, **text.txt**
### Files 
We are given 2 files, the first one being **"translator"** :

```bash
$ file translator 
translator: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=a74a5a606cb44b6f38ae465b6710af822ecfd022, for GNU/Linux 4.4.0, stripped
```

and the other one being a .txt file, called **"text"**, which consists of a string made up of CJK graphemes - unicode characters.
### Binary functionality
The binary file, **translator**, works as follows:
```bash
$ ./translator HIEVERYONE
婄坙噜橀幍
$ ./translator YAYY
橄楓$
```

From our findings we can immediately derive that the binary file intakes an ASCII string character, makes it undergo multiple arithmetic operations until it eventually turns into an unicode string.
The mission is clear - we have an encoded message, that we have to decode. In order to do this, we have to first understand the underlying functionality of the "encoder", reverse the logic and decode our flag.
### Binary Analysis
The main function looks as follows :

```c
int main(int argc, char **argv)
{
    setlocale(LC_ALL, "");
    if (argc == 2) {
        char *p = argv[1];
        if (*p == '\0') { putwc(L'\n', stdout); exit(0); }

        int S = operations((uint8_t*)p + 1);      
        uint32_t mix = (((uint8_t)*p >> 4) & 0xF) + S;

        putwc(((mix >> 4 & 0xF) + *p & 0xF | *p & 0xF0) * 0x100 + 0x1000 +
              (mix + p[1] & 0xF | p[1] & 0xF0U), stdout);
        
        if (p[1] == '\0') { putwc(L'\n', stdout); exit(0); }
        argv[1] += 2;                             
        return main(2, (void**)argv);             
    }
    fprintf(stderr, "USAGE: %s <text>\n", argv[0]);
    return 1;
}
i<3nink
```

The entry point, **main**, is simple. It :
1. Reads the input string
2. Processes it as 2 characters (bytes) at a time
3. Converts each pair into a Unicode character
4. Calls itself again with the next 2 characters. This is what is referred to as "tail recursion" - we can see it in the code, namely :

```c
return main(2, (void**)argv);
```

However, it's not that sunshine and rainbow - it wouldn't have been a reverse engineering task if so after all :D
The trick lies in how the script modifies the high and low nibbles of our string. Main truly functions more like this :
1. Reads 2 characters from input
2. Calculates a suffix checksum on the rest of the string using **operations()**
3. Computes a wide character (wchar_t) using a combination of high nibbles **a** and **b** (which are copied directly from input) and low nibbles of a and b, **modified by the checksum**.
4. Prints wide character.
5. Recurse with the next 2.

### Decompiled operations()

```c
uint operations(byte *param_1)

{
  byte bVar1;
  byte bVar2;
  byte bVar3;
  int iVar4;
  uint uVar5;
  byte bVar6;
  
  bVar1 = *param_1;
  if (bVar1 == 0) {
    return (uint)bVar1;
  }
  bVar2 = param_1[1];
  uVar5 = (uint)bVar2;
  if (bVar2 != 0) {
    bVar6 = param_1[2];
    if (bVar6 != 0) {
      bVar3 = param_1[3];
      if (bVar3 != 0) {
        iVar4 = operations(param_1 + 4);
        return (uint)(bVar1 >> 4) +
               (uint)(bVar2 >> 4) + (uint)(bVar6 >> 4) + (uint)(bVar3 >> 4) + iVar4;
      }
      bVar6 = bVar6 >> 4;
    }
    uVar5 = (uint)(bVar2 >> 4) + (uint)bVar6;
  }
  return (bVar1 >> 4) + uVar5;
}
```

**operations()** is a **recursive suffix-sum function**. Given a pointer to a byte string, it returns the sum of the upper 4 bits (high nibbles) of every byte from the **ptr** to the end.
It processes 4 bytes at a time for performance, but logically it's equivalent to :

```c
sum = 0;
while (*ptr != '\0') {
    sum += *ptr >> 4;
    ptr++;
}
```

This sum - **S** in the binary - is used to add controlled "bias" to the lower nibbles, which as we already mentioned, are being modified.

### Encoding logic proven with an example
Let's call the two input bytes **a** and **b**.

```markdown
Let hi(x) = high nibble = x >> 4
Let lo(x) = low nibble = x & 0xF
Let S = suffix sum = sum of hi(x) for every x to the right of a
```

#### Step-by-step:

1. Calculate the mix sum
   
```python
mix = hi(a) + S;
```

2. Modify the lower nibble of **a**

```python
new_lo_a = ((mix >> 4) & 0xF) + lo(a);
```

3. Modify the lower nibble of **b**

```python
new_lo_b = (mix & 0xF) + lo(b);
```

4. Reconstruct the original bytes, adding the low and high nibbles back together

```python
byte1 = (hi(a) << 4) | (new_lo_a & 0xF);
byte2 = (hi(b) << 4) | (new_lo_b & 0xF);
```

5. Construct the unicode value :

```python
wchar = 0x1000 + (byte1 << 8) + byte2;
```

This will print out the CJK grapheme unicode character.
### Decoding

We go right to left, since the suffix sum depends on what comes **after**.
Given a wchar **W** :
1. Subtract offset:

```c
W' = W - 0x1000;
```

2. Extract:

```c
byte1 = W' >> 8;
byte2 = W' & 0xFF;
hi1 = byte1 >> 4;
lo1 = byte1 & 0xF;
hi2 = byte2 >> 4;
lo2 = byte2 & 0xF;
```

3. Knowing suffix sum **S** , recover original bytes:

```python
a = (hi1 << 4) | ((lo1 - ((S >> 4) & 0xF)) & 0xF)
b = (hi2 << 4) | ((lo2 -  (S       & 0xF)) & 0xF)
S += hi1 + hi2
```
### Complete solve script

```python
def decrypt(encrypted_flag):
    prev_sum = 0
    decrypted = []
    for c in reversed(encrypted_flag):
        code_point = ord(c)
        code_point -= 0x1000  
        
        upper_byte = (code_point >> 8) & 0xFF
        lower_byte = code_point & 0xFF
        
        U1 = (upper_byte & 0xF0) >> 4
        A = upper_byte & 0x0F
        
        U2 = (lower_byte & 0xF0) >> 4
        B = lower_byte & 0x0F
        
        checksum = U2 + prev_sum
        
        L2 = (B - checksum - U1) % 16
        
        temp = checksum + U1
        L1 = (A - (temp >> 4)) % 16
        
        v1 = (U1 << 4) | L1
        v2 = (U2 << 4) | L2
        
        decrypted.insert(0, v2)
        decrypted.insert(0, v1)
        
        prev_sum = U1 + U2 + prev_sum
    
    return bytes(decrypted)

if __name__ == "__main__":
    encrypted_flag = "幾湂潌蕔䩘桢豝詧䭡䝵敯䡨剱挧䍩硷穏罣㈡䨥贇"
    decrypted_bytes = decrypt(encrypted_flag)
    print(decrypted_bytes.decode('utf-8', errors='replace'))
```

Why does this work? Because the entire transformation is bijective, meaning that the high/upper nibbles are preserved, lower nibbles are altered only based off of known information, and the checksum S can be rebuilt.

### Flag

**BtSCTF{W0W_it_re4l1y_m3aNs_$0methIng!!:)}**
