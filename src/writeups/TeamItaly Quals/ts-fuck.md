---
title: "TeamItaly Quals 2025 : TsFuck"
date: "2025-06-07"
excerpt: "Reverse engineering and heavy deobsfuscation of a Turing-complete type system with type-level recursion"
tags: "rev, typescript, hard, reversing-operations"
---

The TeamItaly Quals 2025 served as this years election process for the members of Team Italy - a prestigious CTF team full of talented people representing their country at the ECSC. Their challenges were worthy of this title - with most challenges not exceeding 10 solves, with the CTF having over 500 people officialy registered. Let's get into it!
### Challenge Overview
**Category:** Reverse Engineering  
**Difficulty:** Hard
**Points:** 500 
**Files:** **TsFuck.ts**
### Files 
We are given 1 file, and that is a file called **TsFuck.ts**. 
### Functionality and initial analysis
Upon initial analysis of the source code and the CTF assignment, we can easily derive that the flag is embedded statically within the source code. Proof of this is no service being provided on the website, along with the source code showing no signs of externally connecting anywhere.
Our very first look at the source code shows one thing - the core concept behind this challenge is **type-level computation**.
### How is the flag encoded within the source code?
As I said, the core concept is **type-level computation**. The flag characters are encoded using number-based operations implemented entirely within TypeScript's type system.
Firstly, the numbers are represented as **Peano numerals**, a recursive form of encoding numbers:

```typescript
interface Qz {
  ke?: any;
  nw: "true" | "false";
}

// 0
type Yh = { nw: "true" };

// Successors (1 to 9, etc.)
type Zb<T extends Qz> = { ke: T; nw: "false" };
type Bp = Zb<Yh>; // 1
type Df = Zb<Bp>; // 2
type Gt = Zb<Df>; // 3
// and so on
```

### Reverse engineering TypeScript's arithmetic on types
TypeScript's recursive conditional types allow implementation of arithmetic operations, that we have seen in the source code.
#### Exponentation (Fx)

```typescript
type Fx<T1 extends Qz, T2> = {
  true: T2;
  false: Zb<Fx<Lq<T1>, T2>>;
}[Wg<T1>];
```

The above code is the TypeScript type system equivalent of exponentation. What it does is :
1. If **T1 == 0** (base case), return **T2**
2. Else, return **Zb<Fx<Lq<T1>, T2>>**
It's effectively counting how many times to wrap **Zb** around **T2**, simulating multiplication.
#### Multiplication (Vn)

```typescript
type Vn<T1 extends Qz, T2 extends Qz> = Kc<T1, T2, Yh>;
type Kc<T1, T2, TAcc extends Qz> = {
  true: TAcc;
  false: Kc<Lq<T1>, T2, Fx<TAcc, T2>>;
}[Wg<T1>];
```

Above code recursively accumulates T2 in the accumulator, which mimicks repeated addition == multiplication.
#### Modulo Expontentation (Xf)

```typescript
type Xf<T2 extends Fd, T1 extends Fd> = Fx<Vn<Qp, Zr<T2>>, Zr<T1>>;
```

What this does is that :
1. **Zr<T>** maps digit **T** to its type (e.g., **Zr<3>** → **Gt**)
2. **Qp = 10**, so **Vn<Qp**, **Zr<T2>>** gives **10*T2**
3. **Fx<10*T2**, **Zr<T1>>** == exponentiation
This calculates **T1 ^ (10 * T2)** at the type level.
#### Complex Operation : **Ona**
This type models a full expression:

```typescript
type Ona<TB, TE, TA, TM> = {
  true: Bp;
  false: Lm<Fx<On<TB, TE, TM>, TA>, TM>;
}[Wg<TE>];
```

Translated, this evaluates to :

```
(TB^TE + TA) % TM
```

Where :
1. **TB** : base (flag value)
2. **TE** : exponent
3. **TA** : addend from previous stage
4. **TM** : modulo, always 97
This is precisely how each character in the flag is validated by computing a chained equation.
### Final output check
The last type is :

```typescript
type It<TC extends "true"> = "true";
var output: It<Np<Uq<Ona<...>, Xf<0,0>, Xf<9,7>>>>;
```

This encodes a deeply nested chain of Ona computations, each one feeding into the next. 
The **Np<Uq<...>>** finally compares the result of all computations to **Xf<9,7>** - e.g **7^9 % 97 = 4**

```typescript
It<Np<Uq<Ona<...>, 4>>>;
```

Only if the result is exactly 4 does the whole type resolve to "true", and thus pass type-checking.
### Flag extraction
The goal is to find 38 characters such that :

```python
(flag[i] ^ exponent[i] + prev_result) % 97 == expected_result[i]
```

Which we reimplemented in python  as :

```python
x = pow((g - ta + 97) % 97, modinv(te, 96), 97)
```

Where :
1. **g** = result value
2. **ta** = previous result
3. **te** = exponent
And finally, we converted the result to characters:

```python
chr(x + 48)
```

This is precisely because each flag byte was stored as **ASCII - 48**, and this correctly reverts it.
### Solve

```python
import sys

def egcd(a, b):
    if a == 0:
        return (b, 0, 1)
    else:
        g, y, x = egcd(b % a, a)
        return (g, x - (b // a) * y, y)

def modinv(a, m):
    g, x, y = egcd(a, m)
    if g != 1:
        raise Exception('modular inverse does not exist')
    return x % m

def solve_modular_root(target, te, tm):
    if target == 0:
        return 0
    phi_tm = tm - 1
    inv_te = modinv(te, phi_tm)
    solution = pow(target, inv_te, tm)
    return solution

def solve_ctf_challenge():
    TM = 97
    equations_in_order = [
        (36, 13, 2), (7, 11, 19), (20, 13, 43), (10, 13, 33), (30, 13, 77),
        (2, 5, 74), (18, 19, 72), (35, 5, 1), (3, 11, 36), (9, 17, 14),
        (33, 11, 91), (11, 7, 53), (15, 17, 32), (22, 11, 51), (29, 5, 26),
        (13, 5, 12), (6, 13, 1), (19, 7, 65), (16, 7, 56), (23, 11, 89),
        (24, 19, 34), (0, 13, 70), (31, 13, 11), (28, 5, 61), (25, 11, 61),
        (37, 13, 80), (14, 7, 47), (1, 17, 79), (21, 7, 79), (32, 19, 55),
        (34, 7, 55), (4, 5, 11), (17, 13, 96), (26, 11, 35), (12, 5, 89),
        (5, 11, 31), (27, 19, 29), (8, 7, 72)
    ]
    solutions = {}
    ta = 0 # spomínaný addend

    for f_idx, te, g in equations_in_order:
        target = (g - ta + TM) % TM                     # Ona<TB, TE, TA, TM> reverse
        solved_val = solve_modular_root(target, te, TM) # Ona<TB, TE, TA, TM> reverse
        solutions[f_idx] = solved_val
        ta = g

    final_flag = ""
    for i in range(38):
        val = solutions.get(i)
        if val is None:
            final_flag += "?"
            continue
        char_code = val + 48
        # print(chr(char_code)) -> Uncomment if you want to see result of each byte after reversing
        final_flag += chr(char_code) # Add each solved byte to the final flag


    print(final_flag)


if __name__ == '__main__':
    solve_ctf_challenge()
```
### Flag

**TeamItaly{Wh4t_h4v3_y0u_d0n3_e27fc07e}**
