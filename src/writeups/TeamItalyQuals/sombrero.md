---
title: "TeamItaly Quals 2025 : Sombrero"
date: "2025-06-07"
excerpt: "Anonymous centralized blockchain collision"
tags: "crypto, hash-collision, hard"
---

### Challenge Overview
**Category:** Cryptography 
**Difficulty:** Hard  
**Points:** 500  
**Files:** **sombrero.py**
### Files 
We are given 1 file, and that is a file called **sombrero.py**. 
### Functionality and initial analysis
We are given the source code of an application which was simulating a blockchain-like system with basic transaction support.
The initialization worked as follows :

```python
flag = os.getenv("FLAG", "TeamItaly{REDACTED}")

MAX_USERS = 5

users = {}
transactions = {}
```

### User registration
The users inside of the source code register by providing a user_id that is 120-127 bits long, where each user is initialized with a balance of 100 and an associated hash function instance :

```python
def register():
    ...
    assert user_id not in users and 120 <= user_id.bit_length() <= 128
    user_h = Hash(user_id)
    users[user_id] = {"h": user_h, "balance": 100, "spent_transactions": []}
```

### Transaction creation
Users can send value to others or to the systme itself using the **to = 0** flag. The transaction is stored using a key derived from **Hash.h(transaction_id)**

```python
def create_transaction():
    ...
    assert users[user_from]["balance"] >= value and value >= 0
    assert transaction_id.bit_length() >= 128

    users[user_from]["balance"] -= value
    transactions[users[user_from]['h'].h(transaction_id)] = {
        'from': user_from,
        'to': user_to,
        'value': value
    }
```

### Spending transactions
To spend a transaction, the user must provide a transaction ID that the system :
1. Looks up using **h(transaction_id)**
2. Checks that it has not been used before (the transaction id)
3. If **to = 0** and **value >= 1500** , prints out our dear flag

```python
def spend_transaction():
    transaction = transactions[users[user_from]['h'].h(transaction_id)]
    assert transaction['from'] == user_from
    assert transaction_id not in users[user_from]["spent_transactions"]

    users[user_from]["spent_transactions"].append(transaction_id)

    if transaction["to"] == 0 and transaction["value"] >= 1500:
        print(flag)
    else:
        users[transaction["to"]]["balance"] += transaction["value"]
```

I know this is getting a lot to handle, I know! But that is something we had to deal with live :D Bear with me, now we are getting to the juicy stuff
### Custom hash implementation
The class **Hash** implements a non-standard and deterministic function which is influenced by:
1. An internal 128 bit **init_state** (the user ID)
2. A fixed bit permutation ˇ**bit_perm** seeded with **0x1337** (Wow, how original, yolo)
3. A state-mixing function **F(a, b, bitsize)** that combines permutation and XOR with constants derived from **math.e**

### Hashing core

```python
def F(self, a, b, bitsize):
    for r in range(bitsize):
        bit = (b >> r) & 1
        tmp = 0
        for i, bit_index in enumerate(self.bit_perm):
            new_bit = (a >> (bit_index ^ bit)) & 1
            tmp |= (new_bit << i)
        a = tmp ^ self.c
    return a
```

### Hash digest flow

```python
tmp   = F((state << 64) + b, b,   64)
state = F((state << 64) + b, tmp, 192)
state = state ^ tmp
state = state >> 64
```

### Core vulnerability
Finally we get to the heart of this CTF. In the above hash digest flow we can see this interesting operation

```python
state >> 64
```

This truncation ensures that only the upper 64 bits are retained after each block, which means that the entire hash output is truncated to 64 bits, even though the intermediate states are 192 bits wide. This introduces the risk of hash collisions where two distinct inputs produce the same final hash.

#### Hash vs Raw ID

```python
transactions[users[user_from]['h'].h(transaction_id)] = { ... }
```

Because each transaction is indexed by **Hash.h(transaction_id)**, the underlying hash value is the actual key in the **transactions** dictionary.
Especially here, in this transaction system, the system only checks whether the raw input integer was previously used and it does not consider whether another **transaction_id** that hashes to the same value has already been spent

#### The bug
TL;DR 
Two different transaction IDs **txid1** and **txid2** can produce the same **Hash.h(txidX)** output, and therefore access the same transaction record. But the check **transaction_id** not in **spent_transactions** only blocks reuse of the exact same ID, not other colliding ones.

#### The truncation, again
This is the root of the collision potential:

```python
state = state >> 64
```

Even though **state** after **F()** may be 128-192 bits wide it is only the upper 64 bits which are kept, therefore many different input blocks can result in the same final **state**, which makes the nature of this entire function inherently non-collision-resistant, as it cannot ensure unique digest outputs for distinct transaction IDs.

#### How would we exploit this?

Using the flaw described above, we can :
1. Find two inputs such that :

```python
Hash(user_id).h(txid1) == Hash(user_id).h(txid2)
```

2. Use **txid1** to create and spend a transaction
3. Then spend txid2 - which is accepted by the system, all because it hashes to the same key in **transactions**, therefore it is valid, and it is also not inside of **spend_transaction**, so the check passes

#### Practice

Imagine this :

```python
Hash(uid).h(0xAAA) == Hash(uid).h(0xBBB)
```

1. **create_transaction(blabla, 0xAAA)** stores the data at some key, **k**
2. **spend_transaction(0xAAA)** looks up **k** , processes the transaction, and marks **0xAAA** as spent
3. **spend_transaction(0xBBB)** also looks up the same key, **k** , and it also finds the same data, and passes the entire check

### Exploit
#### Collision pair generation

```python
def find_base(x0, x1):
    return x0 >> 64, x0 & ((1<<64)-1), x1 & ((1<<64)-1)
```

```python
def build_pairs(base, lo0, lo1, needed=8):
    H = CustomHash(base)
    b0 = lo0 << 128
    b1 = lo1 << 128
    pairs = []
    i = 0
    while len(pairs) < needed:
        if H.digest(b0 + i) == H.digest(b1 + i):
            pairs.append((b0 + i, b1 + i))
        i += 1
    return pairs
```

1. We start from two 128-bit user IDs **(**x0**, **x1**)** that share the same upper 64 bits
2. We construct two sets of transactions IDs

```python
M0 = (lo0 << 128) + i, M1 = (lo1 << 128) + i
```

3. We find **M0**, **M1** such that **digest(M0) == digest(M1)** due to truncatation
Using collision pairs **(a, b)** where **h(a) == h(b)**, we perform:

```python
for a, b in coll_pairs:
    create(self.uid, self.balance, a)  
    spend(a)                           
    spend(b)                           
    self.balance *= 2                 
```

As we already mentioned, the second spend, **b**, is accepted becasue the system only checks that the raw transaction_id has not been used - not whether the hash key was reused.
**a** and **b** hash to the same value, so both map to the same transaction in the **transactions** dict
This loop doubles the user balance with every iteration, reaching over 256000 from the initial 100 coins in 8 iterations.

#### Obtaining the flag
Once the balance exceeds 1500, we execute:

```python
tx_final = (1 << 128) + 0x1337
create(0, 1500, tx_final)
spend(tx_final, final=True)
```

This sends 1500 coins to **to = 0**, triggering:

```python
if transaction["to"] == 0 and transaction["value"] >= 1500:
    print(flag)
```

... successfuly printing the flag.


### Solve 

```python
import struct
import math
import random
from Crypto.Util.Padding import pad
from Crypto.Util.number import long_to_bytes
from pwn import remote

# zreplikovana ich vlastna custom hash implementacia ktora bola v hash.py
class CustomHash:
    def __init__(self, seed):
        self.state = seed
        self.BSZ = 8
        self.DSZ = 16
        self.CONST = int.from_bytes(struct.pack('<d', math.e) * ((self.DSZ + self.BSZ) // 8), 'big')
        random.seed(0x1337)
        self.perm = list(range(8 * (self.DSZ + self.BSZ)))
        random.shuffle(self.perm)

    def _round(self, A, B, width):
        X = A
        for r in range(width):
            bit = (B >> r) & 1
            tmp = 0
            for i, idx in enumerate(self.perm):
                tmp |= (((X >> (idx ^ bit)) & 1) << i)
            X = tmp ^ self.CONST
        return X

    def digest(self, m_int):
        data = long_to_bytes(m_int) if isinstance(m_int, int) else m_int
        data = pad(data, self.BSZ)
        S = self.state
        for off in range(0, len(data), self.BSZ):
            block = int.from_bytes(data[off:off+self.BSZ], 'big')
            t1 = self._round((S << (8*self.BSZ)) + block, block,        8*self.BSZ)
            t2 = self._round((S << (8*self.BSZ)) + block, t1,           8*(self.BSZ + self.DSZ))
            S  = ((t2 ^ t1) >> (8*self.BSZ))
        return S

def find_base(x0, x1):
    return x0 >> 64, x0 & ((1<<64)-1), x1 & ((1<<64)-1)

def build_pairs(base, lo0, lo1, needed=8):
    H = CustomHash(base)
    b0 = lo0 << 128
    b1 = lo1 << 128
    pairs = []
    i = 0
    while len(pairs) < needed:
        if H.digest(b0 + i) == H.digest(b1 + i):
            pairs.append((b0 + i, b1 + i))
        i += 1
    return pairs

class Client:
    def __init__(self, host, port, uid):
        self.r = remote(host, port)
        self.uid = uid
        self.balance = 100
        self.r.recvuntil(b'> ')

    def register(self):
        self.r.sendline(b'1')
        self.r.recvuntil(b'User id: ')
        self.r.sendline(str(self.uid).encode())
        self.r.recvuntil(b'> ')

    def create(self, to, amt, txid):
        self.r.sendline(b'2')
        self.r.recvuntil(b'From: ')
        self.r.sendline(str(self.uid).encode())
        self.r.recvuntil(b'To: ')
        self.r.sendline(str(to).encode())
        self.r.recvuntil(b'Value: ')
        self.r.sendline(str(amt).encode())
        self.r.recvuntil(b'Transaction id: ')
        self.r.sendline(str(txid).encode())
        self.r.recvuntil(b'> ')

    def spend(self, txid, final=False):
        self.r.sendline(b'3')
        self.r.recvuntil(b'From: ')
        self.r.sendline(str(self.uid).encode())
        self.r.recvuntil(b'Transaction id: ')
        self.r.sendline(str(txid).encode())
        if final:
            return self.r.recvline(timeout=5).decode().strip()
        else:
            self.r.recvuntil(b'> ')
            return None

    def exploit(self, coll_pairs):
        for a, b in coll_pairs:
            self.create(self.uid, self.balance, a)
            self.spend(a)
            self.spend(b)
            self.balance *= 2
        tx_final = (1 << 128) + 0x1337
        self.create(0, 1500, tx_final)
        flag = self.spend(tx_final, final=True)
        print("Flag:", flag)

if __name__ == '__main__':
    x0 = 4834255595133874435204552325720083095538520465749038972963
    x1 = 4834255595133874435204552325720083095538520465749038972939
    base, l0, l1 = find_base(x0, x1)
    pairs = build_pairs(base, l0, l1)

    c = Client('sombrero.challs.quals.teamitaly.eu', 38069, base)
    c.register()
    c.exploit(pairs)
```

### Flag

**TeamItaly{Infinite_money_glitch_ftw_868a388d2bdea91c}**
